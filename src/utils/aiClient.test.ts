import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AI_PROTOCOL_METAS,
  DEFAULT_AI_GLOBAL_CONFIG,
  buildAiChatPayload,
  createDefaultAiCharacterConfig,
  describeMemberPresenceStatus,
  editMessageText,
  extractMentionedCharacters,
  formatAiConversationTranscript,
  getAiCharacterConfig,
  getEligibleAiCharacters,
  getNightcordCharacterPresetPrompt,
  isMemberOnlineForAi,
  normalizeAiEndpoint,
  parseAiDateTimeTag,
  parseAiModelOutput,
  pickAiAutonomousSpeaker,
  pickAiContinueResponder,
  pickAiFollowUpResponder,
  pickRandomMemberPresenceTransition,
  prepareRegenerateTarget,
  requestAiCompletion,
  resolveAiResponder,
  resolveAiResponders,
  resolveEffectiveAiCredentials,
  sanitizeAiCharacterConfigs,
  sanitizeAiGlobalConfig,
  stripSpeakerPrefix,
  testAiConnection,
} from './aiClient';
import {
  INITIAL_CHARACTERS,
  INITIAL_VOICE_MEMBERS,
  createFileMessage,
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
  assert.ok(payload.systemInstruction.includes('set_send_time'));
  assert.ok(payload.systemInstruction.includes('2026/11/22 1:36'));
  assert.equal(payload.turns.some((t) => t.content.includes('(2026/11/22')), false);

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

test('resolveAiResponders queues multiple @mentions sequentially and reports offline/missing-key skips', () => {
  const configs: Record<string, AiCharacterConfig> = {
    k: { ...createDefaultAiCharacterConfig(), apiKey: 'k-key' },
    enanan: { ...createDefaultAiCharacterConfig(), apiKey: 'ena-key' },
  };
  const globalOff: AiGlobalConfig = { ...DEFAULT_AI_GLOBAL_CONFIG, useGlobalApi: false };
  const members = setMemberPresenceStatus(INITIAL_VOICE_MEMBERS, 'enanan', 'offline').members;

  const multi = resolveAiResponders(
    '@K @えななん @雪 @Amia',
    INITIAL_CHARACTERS,
    configs,
    globalOff,
    () => 0,
    members
  );
  assert.deepEqual(
    multi.responders.map((c) => c.id),
    ['k']
  );
  assert.deepEqual(
    multi.offlineMentioned.map((c) => c.id),
    ['enanan']
  );
  assert.deepEqual(
    multi.missingKeyMentioned.map((c) => c.id),
    ['yuki', 'amia']
  );

  const twoReady = resolveAiResponders(
    '@Amia と @K',
    INITIAL_CHARACTERS,
    {
      ...configs,
      amia: { ...createDefaultAiCharacterConfig(), apiKey: 'amia-key' },
    },
    globalOff,
    () => 0
  );
  assert.deepEqual(
    twoReady.responders.map((c) => c.id),
    ['amia', 'k']
  );
});

test('pickAiContinueResponder avoids repeating lastSpeakerId when possible and falls back safely', () => {
  const configs: Record<string, AiCharacterConfig> = {
    k: { ...createDefaultAiCharacterConfig(), apiKey: 'k-key' },
    yuki: { ...createDefaultAiCharacterConfig(), apiKey: 'y-key' },
  };
  const globalOff: AiGlobalConfig = { ...DEFAULT_AI_GLOBAL_CONFIG, useGlobalApi: false };

  const pickedOther = pickAiContinueResponder('k', INITIAL_CHARACTERS, configs, globalOff, () => 0);
  assert.equal(pickedOther.character?.id, 'yuki');

  const onlyKConfigs: Record<string, AiCharacterConfig> = {
    k: { ...createDefaultAiCharacterConfig(), apiKey: 'k-key' },
  };
  const fallbackSame = pickAiContinueResponder(
    'k',
    INITIAL_CHARACTERS,
    onlyKConfigs,
    globalOff,
    () => 0
  );
  assert.equal(fallbackSame.character?.id, 'k');

  const allOfflineMembers = INITIAL_VOICE_MEMBERS.map((m) => ({
    ...m,
    online: false,
    status: 'offline' as const,
  }));
  const noneOnline = pickAiContinueResponder(
    'k',
    INITIAL_CHARACTERS,
    onlyKConfigs,
    globalOff,
    () => 0,
    allOfflineMembers
  );
  assert.equal(noneOnline.character, null);
  assert.equal(noneOnline.reason, 'none_online');

  const noneConfigured = pickAiContinueResponder('k', INITIAL_CHARACTERS, {}, globalOff, () => 0);
  assert.equal(noneConfigured.character, null);
  assert.equal(noneConfigured.reason, 'none_configured');
});

test('getNightcordCharacterPresetPrompt and sanitizeAiGlobalConfig / sanitizeAiCharacterConfigs enforce valid ranges', () => {
  assert.ok(getNightcordCharacterPresetPrompt('k', 'K', 'ja').includes('宵崎奏'));
  assert.ok(getNightcordCharacterPresetPrompt('yuki', '雪', 'zh').includes('真冬'));
  assert.ok(getNightcordCharacterPresetPrompt('enanan', 'えななん', 'en').includes('Ena'));
  assert.ok(getNightcordCharacterPresetPrompt('custom-1', 'ミク', 'zh').includes('ミク'));

  const g = sanitizeAiGlobalConfig({
    protocol: 'deepseek',
    temperature: 99,
    replyLength: 'short',
    userAvatar: 'amia',
  });
  assert.equal(g.protocol, 'deepseek');
  assert.equal(g.temperature, 1.5);
  assert.equal(g.replyLength, 'short');
  assert.equal(g.userAvatar, 'amia');

  const cMap = sanitizeAiCharacterConfigs({
    k: {
      protocol: 'gemini',
      temperature: -2,
      apiKey: 'gk',
    },
  });
  assert.equal(cMap.k.protocol, 'gemini');
  assert.equal(cMap.k.temperature, 0);
  assert.equal(cMap.k.apiKey, 'gk');
});

test('buildAiChatPayload respects replyLength & textPreview, formatAiConversationTranscript exports text, and editMessageText clears caption on media', () => {
  const baseNow = new Date(2026, 10, 22, 2, 0);
  const k = INITIAL_CHARACTERS[0];
  const fileMsg = createFileMessage(
    {
      mediaId: 'txt-1',
      kind: 'text',
      filename: 'draft.txt',
      sizeLabel: '1KB テキスト',
      fileType: 'TXT',
      displayMode: 'card',
      textPreview: '深夜二時、静かなコード',
    },
    k,
    'これ確認して',
    baseNow
  );

  const shortPayload = buildAiChatPayload(k, [fileMsg], '', INITIAL_CHARACTERS, {
    replyLength: 'short',
    now: baseNow,
  });
  assert.ok(shortPayload.systemInstruction.includes('1–2 crisp Nightcord chat sentences'));
  assert.ok(
    shortPayload.turns.some((t) => t.content.includes('深夜二時、静かなコード'))
  );

  const detailedPayload = buildAiChatPayload(k, [fileMsg], '', INITIAL_CHARACTERS, {
    replyLength: 'detailed',
    now: baseNow,
  });
  assert.ok(detailedPayload.systemInstruction.includes('3–5 sentences'));

  const clearedFileList = editMessageText([fileMsg], fileMsg.id, '   ');
  assert.equal(clearedFileList[0].text, undefined);
  assert.ok(clearedFileList[0].fileMedia);

  const transcript = formatAiConversationTranscript({
    id: 'ai-1',
    title: 'ナイトコード会議',
    messages: [{ ...fileMsg, dividerBefore: '今日' }],
  });
  assert.ok(transcript.includes('# ナイトコード会議'));
  assert.ok(transcript.includes('--- 今日 ---'));
  assert.ok(transcript.includes('これ確認して [File: draft.txt (1KB テキスト)]'));
});

test('testAiConnection validates empty key, success latency, HTTP error, and network error', async () => {
  const emptyRes = await testAiConnection('openai', '', '   ', 'gpt-4o-mini');
  assert.equal(emptyRes.ok, false);
  assert.equal(emptyRes.detail, 'NO_API_KEY');

  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ id: 'chatcmpl-1' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })) as typeof fetch;
    const okRes = await testAiConnection('deepseek', '', 'sk-live', 'deepseek-chat');
    assert.equal(okRes.ok, true);
    assert.ok(okRes.latencyMs >= 1);
    assert.equal(okRes.detail, 'deepseek-chat');

    globalThis.fetch = (async () =>
      new Response('invalid api key', {
        status: 401,
      })) as typeof fetch;
    const errRes = await testAiConnection('openai', '', 'sk-bad', 'gpt-4o-mini');
    assert.equal(errRes.ok, false);
    assert.ok(errRes.detail.startsWith('HTTP 401'));

    globalThis.fetch = (async () => {
      throw new TypeError('Failed to fetch');
    }) as typeof fetch;
    const netRes = await testAiConnection('openai', '', 'sk-net', 'gpt-4o-mini');
    assert.equal(netRes.ok, false);
    assert.ok(netRes.detail.includes('Failed to fetch'));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('buildAiChatPayload injects voice/muted/text/offline member states, webSearch rule, and strips leaked time prefixes', () => {
  const baseNow = new Date(2026, 10, 24, 1, 20);
  let members = setMemberPresenceStatus(INITIAL_VOICE_MEMBERS, 'k', 'voice').members;
  members = members.map((m) => (m.id === 'yuki' ? { ...m, status: 'voice', online: true, muted: true } : m));
  members = setMemberPresenceStatus(members, 'enanan', 'online').members;
  members = setMemberPresenceStatus(members, 'amia', 'offline').members;

  assert.ok(describeMemberPresenceStatus(members[0]).includes('Voice call'));
  assert.ok(describeMemberPresenceStatus(members[1]).includes('muted'));
  assert.ok(describeMemberPresenceStatus(members[2]).includes('text chat only'));
  assert.equal(describeMemberPresenceStatus(members[3]), 'Offline');

  const k = INITIAL_CHARACTERS[0];
  const prevMsg = {
    ...createOutgoingMessage('みんな作業進んでる？', k, baseNow)!,
    sentAt: { year: 2026, month: 11, day: 24, hour: 1, minute: 20 },
  };
  const payload = buildAiChatPayload(k, [prevMsg], '', INITIAL_CHARACTERS, {
    members,
    webSearchEnabled: true,
    timeMode: 'ai_inferred',
    now: baseNow,
  });

  assert.ok(payload.systemInstruction.includes('Current room member presence & voice/mute status'));
  assert.ok(payload.systemInstruction.includes('Voice call (mic muted'));
  assert.ok(payload.systemInstruction.includes('Online (text chat only'));
  assert.ok(payload.systemInstruction.includes('Offline'));
  assert.ok(payload.systemInstruction.includes('Web search is enabled'));
  assert.ok(payload.systemInstruction.includes('Contextual file sharing'));
  assert.equal(payload.turns.some((turn) => turn.content.includes('(2026/11/24')), false);

  const prevDt = { year: 2026, month: 11, day: 24, hour: 1, minute: 20 };
  const strippedParen = parseAiModelOutput(
    '(2026/11/24 01:35) 今ちょうどサビのミックス書き出したところ。',
    'K',
    prevDt,
    baseNow
  );
  assert.equal(strippedParen.text, '今ちょうどサビのミックス書き出したところ。');
  assert.deepEqual(strippedParen.inferredSentAt, {
    year: 2026,
    month: 11,
    day: 24,
    hour: 1,
    minute: 35,
  });

  const strippedSingleBracket = parseAiModelOutput(
    '[TIME: 2026-11-24 01:42] えななん、ラフもうちょい待てる？',
    'K',
    prevDt,
    baseNow
  );
  assert.equal(strippedSingleBracket.text, 'えななん、ラフもうちょい待てる？');
  assert.deepEqual(strippedSingleBracket.inferredSentAt, {
    year: 2026,
    month: 11,
    day: 24,
    hour: 1,
    minute: 42,
  });

  const strippedFullwidth = parseAiModelOutput(
    '【TIME：2026-11-24 01:48】了解。すぐ送る。',
    'K',
    prevDt,
    baseNow
  );
  assert.equal(strippedFullwidth.text, '了解。すぐ送る。');
  assert.equal(strippedFullwidth.inferredSentAt?.minute, 48);

  const g = sanitizeAiGlobalConfig({ webSearchEnabled: true });
  assert.equal(g.webSearchEnabled, true);
});

test('pickAiAutonomousSpeaker prioritizes @mentions and pickRandomMemberPresenceTransition keeps >= 1 configured member online', () => {
  const configs: Record<string, AiCharacterConfig> = {
    k: { ...createDefaultAiCharacterConfig(), apiKey: 'k-key' },
    enanan: { ...createDefaultAiCharacterConfig(), apiKey: 'ena-key' },
  };
  const globalOff: AiGlobalConfig = {
    ...DEFAULT_AI_GLOBAL_CONFIG,
    useGlobalApi: false,
    aiFollowUpEnabled: true,
    aiFollowUpProbability: 100,
  };
  const baseNow = new Date(2026, 10, 24, 1, 30);
  const msgWithMention = createOutgoingMessage('@えななん この配色どう思う？', INITIAL_CHARACTERS[0], baseNow)!;

  const pickedMention = pickAiAutonomousSpeaker(
    [msgWithMention],
    'k',
    INITIAL_CHARACTERS,
    configs,
    globalOff,
    () => 0.9,
    INITIAL_VOICE_MEMBERS
  );
  assert.equal(pickedMention.character?.id, 'enanan');

  const followMention = pickAiFollowUpResponder(
    'k',
    INITIAL_CHARACTERS,
    configs,
    globalOff,
    () => 0,
    INITIAL_VOICE_MEMBERS,
    '@えななん ねえ聞いて'
  );
  assert.equal(followMention?.id, 'enanan');

  let singleOnlineMembers = setMemberPresenceStatus(INITIAL_VOICE_MEMBERS, 'enanan', 'offline').members;
  singleOnlineMembers = setMemberPresenceStatus(singleOnlineMembers, 'yuki', 'offline').members;
  singleOnlineMembers = setMemberPresenceStatus(singleOnlineMembers, 'amia', 'offline').members;
  singleOnlineMembers = setMemberPresenceStatus(singleOnlineMembers, 'k', 'online').members;

  const transition = pickRandomMemberPresenceTransition(
    singleOnlineMembers,
    INITIAL_CHARACTERS,
    configs,
    globalOff,
    () => 0
  );
  const kAfter = transition.members.find((m) => m.id === 'k');
  assert.ok(kAfter);
  assert.notEqual(kAfter.status, 'offline');
});

test('requestAiCompletion executes set_send_time tool calls, web_search loops, HTTP 400 fallback, Gemini, and Anthropic', async () => {
  const originalFetch = globalThis.fetch;
  const k = INITIAL_CHARACTERS[0];
  const baseNow = new Date(2026, 10, 24, 1, 0);
  const userMsg = {
    ...createOutgoingMessage('今の天気と進捗どう？', k, baseNow)!,
    memberId: '__user__',
    username: 'あなた',
    sentAt: { year: 2026, month: 11, day: 24, hour: 1, minute: 0 },
  };
  const baseGlobal: AiGlobalConfig = {
    ...DEFAULT_AI_GLOBAL_CONFIG,
    useGlobalApi: true,
    apiKey: 'sk-global',
    timeMode: 'ai_inferred',
    webSearchEnabled: true,
  };

  try {
    let oaStep = 0;
    const seenUrls: string[] = [];
    globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      seenUrls.push(url);
      if (url.includes('wikipedia.org/w/api.php')) {
        return new Response(
          JSON.stringify({
            query: {
              search: [{ title: 'Nightcord', snippet: 'Late-night music creation circle.' }],
            },
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      oaStep += 1;
      const bodyObj = init?.body ? (JSON.parse(String(init.body)) as Record<string, unknown>) : {};
      if (oaStep === 1) {
        assert.ok(Array.isArray(bodyObj.tools));
        return new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: null,
                  tool_calls: [
                    {
                      id: 'call_time_1',
                      type: 'function',
                      function: {
                        name: 'set_send_time',
                        arguments: JSON.stringify({ send_time: '2026-11-24 01:18' }),
                      },
                    },
                    {
                      id: 'call_search_1',
                      type: 'function',
                      function: {
                        name: 'web_search',
                        arguments: JSON.stringify({ query: 'Nightcord' }),
                      },
                    },
                  ],
                },
              },
            ],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: '少し調べたよ。トラックの続き詰めよう。',
              },
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }) as typeof fetch;

    const oaResult = await requestAiCompletion({
      targetCharacter: k,
      charConfig: createDefaultAiCharacterConfig(),
      globalConfig: baseGlobal,
      history: [userMsg],
      allCharacters: INITIAL_CHARACTERS,
      members: INITIAL_VOICE_MEMBERS,
    });
    assert.equal(oaResult.rawText, '少し調べたよ。トラックの続き詰めよう。');
    assert.deepEqual(oaResult.toolSentAt, { year: 2026, month: 11, day: 24, hour: 1, minute: 18 });
    assert.ok(seenUrls.some((u) => u.includes('wikipedia.org/w/api.php')));

    let fallbackCall = 0;
    globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
      fallbackCall += 1;
      const bodyObj = init?.body ? (JSON.parse(String(init.body)) as Record<string, unknown>) : {};
      if (fallbackCall === 1) {
        assert.ok(bodyObj.tools);
        return new Response('tools not supported', { status: 400 });
      }
      assert.equal(bodyObj.tools, undefined);
      return new Response(
        JSON.stringify({
          choices: [{ message: { content: 'ツール無しフォールバック成功' } }],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }) as typeof fetch;

    const fbResult = await requestAiCompletion({
      targetCharacter: k,
      charConfig: createDefaultAiCharacterConfig(),
      globalConfig: { ...baseGlobal, webSearchEnabled: false },
      history: [userMsg],
      allCharacters: INITIAL_CHARACTERS,
    });
    assert.equal(fbResult.rawText, 'ツール無しフォールバック成功');
    assert.equal(fbResult.toolSentAt, null);

    let gemBody: Record<string, unknown> = {};
    globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
      gemBody = JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>;
      return new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  { functionCall: { name: 'set_send_time', args: { send_time: '2026-11-24 01:25' } } },
                  { text: 'Geminiの返答だよ' },
                ],
              },
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }) as typeof fetch;

    const gemResult = await requestAiCompletion({
      targetCharacter: k,
      charConfig: createDefaultAiCharacterConfig(),
      globalConfig: {
        ...baseGlobal,
        protocol: 'gemini',
        baseUrl: AI_PROTOCOL_METAS.gemini.defaultBaseUrl,
        model: 'gemini-2.5-flash',
        webSearchEnabled: false,
      },
      history: [userMsg],
      allCharacters: INITIAL_CHARACTERS,
    });
    assert.ok(Array.isArray(gemBody.tools));
    assert.equal(gemResult.rawText, 'Geminiの返答だよ');
    assert.deepEqual(gemResult.toolSentAt, { year: 2026, month: 11, day: 24, hour: 1, minute: 25 });

    let antBody: Record<string, unknown> = {};
    globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
      antBody = JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>;
      return new Response(
        JSON.stringify({
          content: [
            { type: 'tool_use', id: 'tu_1', name: 'set_send_time', input: { send_time: '2026-11-24 01:33' } },
            { type: 'text', text: 'Claudeの返答だよ' },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }) as typeof fetch;

    const antResult = await requestAiCompletion({
      targetCharacter: k,
      charConfig: createDefaultAiCharacterConfig(),
      globalConfig: {
        ...baseGlobal,
        protocol: 'anthropic',
        baseUrl: AI_PROTOCOL_METAS.anthropic.defaultBaseUrl,
        model: 'claude-sonnet-4-20250514',
        webSearchEnabled: true,
      },
      history: [userMsg],
      allCharacters: INITIAL_CHARACTERS,
    });
    assert.ok(Array.isArray(antBody.tools));
    assert.ok(
      (antBody.tools as Record<string, unknown>[]).some((tool) => tool.type === 'web_search_20250305')
    );
    assert.equal(antResult.rawText, 'Claudeの返答だよ');
    assert.deepEqual(antResult.toolSentAt, { year: 2026, month: 11, day: 24, hour: 1, minute: 33 });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

