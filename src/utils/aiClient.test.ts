import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AI_PROTOCOL_METAS,
  DEFAULT_AI_GLOBAL_CONFIG,
  buildAiChatPayload,
  createDefaultAiCharacterConfig,
  editMessageText,
  extractMentionedCharacters,
  getAiCharacterConfig,
  getEligibleAiCharacters,
  isMemberOnlineForAi,
  normalizeAiEndpoint,
  parseAiDateTimeTag,
  parseAiModelOutput,
  pickAiFollowUpResponder,
  prepareRegenerateTarget,
  resolveAiResponder,
  resolveEffectiveAiCredentials,
  stripSpeakerPrefix,
} from './aiClient';
import {
  INITIAL_CHARACTERS,
  INITIAL_VOICE_MEMBERS,
  createOutgoingMessage,
  setMemberPresenceStatus,
} from './nightcordState';
import { isAiSubpageLocation } from './nightcordTemplateCode';
import type { AiCharacterConfig, AiGlobalConfig } from '../types/nightcord';

test('isAiSubpageLocation recognizes /ai, ?view=ai, and #ai routes', () => {
  assert.equal(isAiSubpageLocation({ pathname: '/', search: '?view=ai', hash: '' }), true);
  assert.equal(isAiSubpageLocation({ pathname: '/', search: '', hash: '#ai' }), true);
  assert.equal(isAiSubpageLocation({ pathname: '/', search: '', hash: '#/ai' }), true);
  assert.equal(isAiSubpageLocation({ pathname: '/ai', search: '', hash: '' }), true);
  assert.equal(isAiSubpageLocation({ pathname: '/ai/', search: '', hash: '' }), true);
  assert.equal(isAiSubpageLocation({ pathname: '/', search: '?autostart=1', hash: '' }), false);
  assert.equal(isAiSubpageLocation({ pathname: '/template', search: '', hash: '' }), false);
});

test('normalizeAiEndpoint resolves openai, gemini, and anthropic urls', () => {
  const oaDefault = normalizeAiEndpoint('openai', '', 'gpt-4o-mini', 'sk-test');
  assert.equal(oaDefault.baseRoot, AI_PROTOCOL_METAS.openai.defaultBaseUrl);
  assert.equal(oaDefault.url, 'https://api.openai.com/v1/chat/completions');

  const oaHostOnly = normalizeAiEndpoint('openai', 'https://proxy.example.com/', 'gpt-4o', 'sk-1');
  assert.equal(oaHostOnly.baseRoot, 'https://proxy.example.com/v1');
  assert.equal(oaHostOnly.url, 'https://proxy.example.com/v1/chat/completions');

  const oaFull = normalizeAiEndpoint(
    'openai',
    'https://proxy.example.com/custom/chat/completions',
    'gpt-4o',
    'sk-1'
  );
  assert.equal(oaFull.baseRoot, 'https://proxy.example.com/custom');
  assert.equal(oaFull.url, 'https://proxy.example.com/custom/chat/completions');

  const gem = normalizeAiEndpoint('gemini', 'https://generativelanguage.googleapis.com', 'gemini-2.5-flash', 'gkey');
  assert.equal(gem.baseRoot, 'https://generativelanguage.googleapis.com/v1beta');
  assert.equal(
    gem.url,
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=gkey'
  );

  const ant = normalizeAiEndpoint('anthropic', 'https://api.anthropic.com', 'claude-sonnet-4-20250514', 'akey');
  assert.equal(ant.baseRoot, 'https://api.anthropic.com/v1');
  assert.equal(ant.url, 'https://api.anthropic.com/v1/messages');
});

test('resolveEffectiveAiCredentials handles per-character key, global key fallback, and empty keys', () => {
  const globalOff: AiGlobalConfig = {
    ...DEFAULT_AI_GLOBAL_CONFIG,
    useGlobalApi: false,
    apiKey: 'global-secret',
  };
  const globalOn: AiGlobalConfig = {
    ...DEFAULT_AI_GLOBAL_CONFIG,
    useGlobalApi: true,
    protocol: 'gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    apiKey: 'global-secret',
    model: 'gemini-2.5-flash',
  };

  const emptyChar: AiCharacterConfig = {
    ...createDefaultAiCharacterConfig(),
    systemPrompt: 'Calm composer',
  };

  const credOff = resolveEffectiveAiCredentials(emptyChar, globalOff);
  assert.equal(credOff.ready, false);
  assert.equal(credOff.usingGlobalKey, false);

  const credGlobal = resolveEffectiveAiCredentials(emptyChar, globalOn);
  assert.equal(credGlobal.ready, true);
  assert.equal(credGlobal.usingGlobalKey, true);
  assert.equal(credGlobal.protocol, 'gemini');
  assert.equal(credGlobal.apiKey, 'global-secret');
  assert.equal(credGlobal.systemPrompt, 'Calm composer');

  const ownChar: AiCharacterConfig = {
    protocol: 'anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    apiKey: 'own-key',
    model: 'claude-sonnet-4-20250514',
    systemPrompt: 'Tsundere artist',
  };
  const credOwn = resolveEffectiveAiCredentials(ownChar, globalOn);
  assert.equal(credOwn.ready, true);
  assert.equal(credOwn.usingGlobalKey, false);
  assert.equal(credOwn.protocol, 'anthropic');
  assert.equal(credOwn.apiKey, 'own-key');
});

test('resolveAiResponder respects API key gating and @mention targeting', () => {
  const configs: Record<string, AiCharacterConfig> = {
    enanan: {
      ...createDefaultAiCharacterConfig(),
      apiKey: 'ena-key',
      systemPrompt: 'Illustrator',
    },
    amia: {
      ...createDefaultAiCharacterConfig(),
      apiKey: 'amia-key',
      systemPrompt: 'Video editor',
    },
  };
  const globalOff: AiGlobalConfig = { ...DEFAULT_AI_GLOBAL_CONFIG, useGlobalApi: false };

  const noKeys = resolveAiResponder('hello', INITIAL_CHARACTERS, {}, globalOff);
  assert.equal(noKeys.kind, 'none_configured');

  const eligible = getEligibleAiCharacters(INITIAL_CHARACTERS, configs, globalOff);
  assert.deepEqual(
    eligible.map((c) => c.id),
    ['enanan', 'amia']
  );

  const mentionNoKey = resolveAiResponder('@K ねえ', INITIAL_CHARACTERS, configs, globalOff);
  assert.equal(mentionNoKey.kind, 'mentioned_missing_key');
  if (mentionNoKey.kind === 'mentioned_missing_key') {
    assert.equal(mentionNoKey.character.id, 'k');
  }

  const mentionWithKey = resolveAiResponder('@えななん 今どう？', INITIAL_CHARACTERS, configs, globalOff);
  assert.equal(mentionWithKey.kind, 'selected');
  if (mentionWithKey.kind === 'selected') {
    assert.equal(mentionWithKey.character.id, 'enanan');
  }

  const randomLow = resolveAiResponder('こんばんは', INITIAL_CHARACTERS, configs, globalOff, () => 0.1);
  assert.equal(randomLow.kind, 'selected');
  if (randomLow.kind === 'selected') {
    assert.equal(randomLow.character.id, 'enanan');
  }

  const randomHigh = resolveAiResponder('こんばんは', INITIAL_CHARACTERS, configs, globalOff, () => 0.9);
  assert.equal(randomHigh.kind, 'selected');
  if (randomHigh.kind === 'selected') {
    assert.equal(randomHigh.character.id, 'amia');
  }

  const mentionedList = extractMentionedCharacters('@amia and @えななん', INITIAL_CHARACTERS);
  assert.deepEqual(
    mentionedList.map((c) => c.id),
    ['amia', 'enanan']
  );

  assert.deepEqual(
    extractMentionedCharacters('@Kawaii おはよう', INITIAL_CHARACTERS).map((c) => c.id),
    []
  );
  assert.deepEqual(
    extractMentionedCharacters('@Kawaii @K 聞いて', INITIAL_CHARACTERS).map((c) => c.id),
    ['k']
  );
});

test('pickAiFollowUpResponder respects toggle, probability, and excludes first speaker', () => {
  const configs: Record<string, AiCharacterConfig> = {
    k: { ...createDefaultAiCharacterConfig(), apiKey: 'k-key' },
    enanan: { ...createDefaultAiCharacterConfig(), apiKey: 'e-key' },
  };

  assert.equal(
    pickAiFollowUpResponder('k', INITIAL_CHARACTERS, configs, {
      ...DEFAULT_AI_GLOBAL_CONFIG,
      aiFollowUpEnabled: false,
      aiFollowUpProbability: 100,
    }),
    null
  );

  assert.equal(
    pickAiFollowUpResponder(
      'k',
      INITIAL_CHARACTERS,
      configs,
      {
        ...DEFAULT_AI_GLOBAL_CONFIG,
        aiFollowUpEnabled: true,
        aiFollowUpProbability: 30,
      },
      () => 0.5
    ),
    null
  );

  const followUp = pickAiFollowUpResponder(
    'k',
    INITIAL_CHARACTERS,
    configs,
    {
      ...DEFAULT_AI_GLOBAL_CONFIG,
      aiFollowUpEnabled: true,
      aiFollowUpProbability: 80,
    },
    () => 0.2
  );
  assert.ok(followUp);
  assert.equal(followUp.id, 'enanan');

  assert.equal(
    pickAiFollowUpResponder(
      'k',
      INITIAL_CHARACTERS,
      { k: { ...createDefaultAiCharacterConfig(), apiKey: 'k-key' } },
      {
        ...DEFAULT_AI_GLOBAL_CONFIG,
        aiFollowUpEnabled: true,
        aiFollowUpProbability: 100,
      },
      () => 0
    ),
    null
  );
});

test('stripSpeakerPrefix and buildAiChatPayload format prompt rules and alternating turns cleanly', () => {
  assert.equal(stripSpeakerPrefix('[えななん]: べ、別に待ってないし', 'えななん'), 'べ、別に待ってないし');
  assert.equal(stripSpeakerPrefix('えななん：わかったよ', 'えななん'), 'わかったよ');
  assert.equal(stripSpeakerPrefix('普通の返事', 'えななん'), '普通の返事');

  const baseNow = new Date(2026, 10, 22, 1, 0);
  const k = INITIAL_CHARACTERS[0];
  const ena = INITIAL_CHARACTERS[2];
  const userMsg1 = {
    ...createOutgoingMessage('こんばんは', k, baseNow)!,
    memberId: '__user__',
    username: 'あなた',
  };
  const enaMsg1 = createOutgoingMessage('遅いよ', ena, baseNow)!;
  const kMsg1 = createOutgoingMessage('ごめん', k, baseNow)!;
  const enaMsg2 = createOutgoingMessage('作業始めるよ', ena, baseNow)!;

  const payload = buildAiChatPayload(
    ena,
    [userMsg1, enaMsg1, kMsg1, enaMsg2],
    'ツンデレ絵師',
    INITIAL_CHARACTERS,
    'あなた'
  );
  assert.ok(payload.systemInstruction.includes('ツンデレ絵師'));
  assert.ok(payload.systemInstruction.includes('K, 雪, Amia'));
  assert.deepEqual(payload.turns, [
    { role: 'user', content: '[あなた]: こんばんは' },
    { role: 'assistant', content: '遅いよ' },
    { role: 'user', content: '[K]: ごめん' },
    { role: 'assistant', content: '作業始めるよ' },
    {
      role: 'user',
      content: '[System cue]: Continue the conversation naturally as えななん.',
    },
  ]);

  const defaulted = getAiCharacterConfig({}, 'missing');
  assert.equal(defaulted.protocol, 'openai');
});

test('editMessageText and prepareRegenerateTarget support AI and user message regeneration', () => {
  const baseNow = new Date(2026, 10, 22, 1, 0);
  const k = INITIAL_CHARACTERS[0];
  const ena = INITIAL_CHARACTERS[2];
  const mUser = {
    ...createOutgoingMessage('最初の質問', k, baseNow)!,
    id: 'msg-user',
    memberId: '__user__',
    username: 'あなた',
  };
  const mAi1 = {
    ...createOutgoingMessage('えなの返事', ena, baseNow)!,
    id: 'msg-ai-1',
  };
  const mAi2 = {
    ...createOutgoingMessage('Kの追い返事', k, baseNow)!,
    id: 'msg-ai-2',
  };

  const edited = editMessageText([mUser, mAi1, mAi2], 'msg-ai-1', '  編集後の返事  ');
  assert.equal(edited[1].text, '編集後の返事');
  assert.equal(editMessageText(edited, 'msg-ai-1', '   ')[1].text, '編集後の返事');

  const regenAi = prepareRegenerateTarget([mUser, mAi1, mAi2], 'msg-ai-1', INITIAL_CHARACTERS);
  assert.ok(regenAi);
  assert.equal(regenAi.mode, 'replace_ai');
  assert.equal(regenAi.targetCharacter?.id, 'enanan');
  assert.deepEqual(
    regenAi.historyBeforeTarget.map((m) => m.id),
    ['msg-user']
  );

  const regenUser = prepareRegenerateTarget([mUser, mAi1, mAi2], 'msg-user', INITIAL_CHARACTERS);
  assert.ok(regenUser);
  assert.equal(regenUser.mode, 'reply_after_user');
  assert.equal(regenUser.targetCharacter, null);
  assert.equal(regenUser.triggerText, '最初の質問');
  assert.deepEqual(
    regenUser.historyBeforeTarget.map((m) => m.id),
    ['msg-user']
  );
});

test('deepseek preset normalizes properly and offline characters are excluded from AI replies', () => {
  assert.equal(AI_PROTOCOL_METAS.deepseek.defaultBaseUrl, 'https://api.deepseek.com/v1');
  assert.deepEqual(AI_PROTOCOL_METAS.deepseek.presetModels, [
    'deepseek-chat',
    'deepseek-reasoner',
  ]);
  const dsEndpoint = normalizeAiEndpoint('deepseek', '', 'deepseek-chat', 'ds-key');
  assert.equal(dsEndpoint.url, 'https://api.deepseek.com/v1/chat/completions');
  assert.equal(dsEndpoint.baseRoot, 'https://api.deepseek.com/v1');

  const configs: Record<string, AiCharacterConfig> = {
    k: {
      protocol: 'deepseek',
      baseUrl: 'https://api.deepseek.com/v1',
      apiKey: 'ds-key',
      model: 'deepseek-chat',
      systemPrompt: '',
    },
    enanan: {
      ...createDefaultAiCharacterConfig(),
      apiKey: 'ena-key',
    },
  };
  const globalOff: AiGlobalConfig = {
    ...DEFAULT_AI_GLOBAL_CONFIG,
    useGlobalApi: false,
    aiFollowUpEnabled: true,
    aiFollowUpProbability: 100,
  };

  let members = setMemberPresenceStatus(INITIAL_VOICE_MEMBERS, 'enanan', 'offline').members;
  assert.equal(isMemberOnlineForAi('enanan', members), false);
  assert.equal(isMemberOnlineForAi('k', members), true);

  const eligible = getEligibleAiCharacters(INITIAL_CHARACTERS, configs, globalOff, members);
  assert.deepEqual(
    eligible.map((c) => c.id),
    ['k']
  );

  const mentionOffline = resolveAiResponder(
    '@えななん いる？',
    INITIAL_CHARACTERS,
    configs,
    globalOff,
    () => 0,
    members
  );
  assert.equal(mentionOffline.kind, 'mentioned_offline');

  assert.equal(
    pickAiFollowUpResponder('k', INITIAL_CHARACTERS, configs, globalOff, () => 0, members),
    null
  );

  members = setMemberPresenceStatus(members, 'k', 'offline').members;
  const allOffline = resolveAiResponder(
    'おーい',
    INITIAL_CHARACTERS,
    configs,
    globalOff,
    () => 0,
    members
  );
  assert.equal(allOffline.kind, 'none_online');
});

test('buildAiChatPayload injects worldview/userPersona/timeMode and parseAiModelOutput extracts shell files and clamped times', () => {
  const baseNow = new Date(2026, 10, 22, 1, 10);
  const prevDt = { year: 2026, month: 11, day: 22, hour: 1, minute: 36 };
  const k = INITIAL_CHARACTERS[0];
  const userMsg = {
    ...createOutgoingMessage('@K 新曲のデモ送って', k, baseNow, {
      sentAt: prevDt,
      timestamp: '今日 1:36',
    })!,
    memberId: '__user__',
    username: 'テストユーザー',
  };

  const payload = buildAiChatPayload(k, [userMsg], '深夜に作曲する', INITIAL_CHARACTERS, {
    userDisplayName: 'テストユーザー',
    userPersona: '歌詞を担当しているメンバー',
    worldviewPrompt: '25時にナイトコードで作業中の世界線',
    timeMode: 'ai_inferred',
    lastMessageDateTime: prevDt,
    now: baseNow,
  });

  assert.ok(payload.systemInstruction.includes('25時にナイトコードで作業中の世界線'));
  assert.ok(payload.systemInstruction.includes('歌詞を担当しているメンバー'));
  assert.ok(payload.systemInstruction.includes('[[FILE:'));
  assert.ok(payload.systemInstruction.includes('[[TIME:YYYY-MM-DD HH:mm]]'));
  assert.ok(payload.systemInstruction.includes('2026/11/22 1:36'));

  const validTag = parseAiDateTimeTag('2026-11-22 02:05', prevDt, baseNow);
  assert.deepEqual(validTag, { year: 2026, month: 11, day: 22, hour: 2, minute: 5 });

  const clampedTag = parseAiDateTimeTag('2026-11-22 01:00', prevDt, baseNow);
  assert.deepEqual(clampedTag, prevDt);

  const parsedWithFile = parseAiModelOutput(
    '[[TIME:2026-11-22 01:50]] 仮ミックスまとめたよ。聴いてみて。\n[[FILE:nightcord_demo_01.mp3|4MB MP3]]',
    'K',
    prevDt,
    baseNow
  );
  assert.deepEqual(parsedWithFile.inferredSentAt, {
    year: 2026,
    month: 11,
    day: 22,
    hour: 1,
    minute: 50,
  });
  assert.equal(parsedWithFile.text, '仮ミックスまとめたよ。聴いてみて。');
  assert.ok(parsedWithFile.fileMedia);
  assert.equal(parsedWithFile.fileMedia.mediaId, '');
  assert.equal(parsedWithFile.fileMedia.kind, 'audio');
  assert.equal(parsedWithFile.fileMedia.filename, 'nightcord_demo_01.mp3');
  assert.equal(parsedWithFile.fileMedia.sizeLabel, '4MB MP3');
  assert.equal(parsedWithFile.fileMedia.fileType, 'MP3');
});

