import test from 'node:test';
import assert from 'node:assert/strict';
import {
  AI_PROTOCOL_METAS,
  DEFAULT_AI_GLOBAL_CONFIG,
  appendUsageRecordToState,
  buildAiChatPayload,
  buildDedicatedTimeAnalyzerPrompt,
  createDefaultAiCharacterConfig,
  createEmptyUsageState,
  describeMemberPresenceStatus,
  editMessageText,
  extractMentionedCharacters,
  extractProviderUsage,
  formatAiConversationTranscript,
  getAiCharacterConfig,
  getEligibleAiCharacters,
  getNightcordCharacterPresetPrompt,
  isMemberOnlineForAi,
  normalizeAiEndpoint,
  parseAiDateTimeTag,
  parseAiModelOutput,
  parseDedicatedTimeAnalyzerOutput,
  parseStructuredJsonReply,
  pickAiAutonomousSpeaker,
  pickAiContinueResponder,
  pickAiFollowUpResponder,
  pickRandomMemberPresenceTransition,
  prepareRegenerateTarget,
  requestAiCompletion,
  resetSessionUsageState,
  resolveAiResponder,
  resolveAiResponders,
  resolveEffectiveAiCredentials,
  sanitizeAiCharacterConfigs,
  sanitizeAiGlobalConfig,
  sanitizeAiUsageState,
  stripSpeakerPrefix,
  testAiConnection,
} from './aiClient';
import {
  INITIAL_CHARACTERS,
  INITIAL_VOICE_MEMBERS,
  buildPlaybackTimeline,
  computeDisplayMessagesForPlayback,
  computePlaybackStepDelayMs,
  createFileMessage,
  createOutgoingMessage,
  resolveClampedOutgoingTimestamp,
  setMemberPresenceStatus,
} from './nightcordState';
import { isAiSubpageLocation } from './nightcordTemplateCode';
import type {
  AiCharacterConfig,
  AiGlobalConfig,
  AiOutputLanguage,
  AiTimeFrequency,
  AiUsageRecord,
} from '../types/nightcord';

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
    '仮ミックスまとめたよ。聴いてみて。\n[[FILE:nightcord_demo_01.mp3|4MB MP3]]',
    'K'
  );
  assert.equal(parsedWithFile.inferredSentAt, null);
  assert.equal(parsedWithFile.text, '仮ミックスまとめたよ。聴いてみて。');
  assert.ok(parsedWithFile.fileMedia);
  assert.equal(parsedWithFile.fileMedia.mediaId, '');
  assert.equal(parsedWithFile.fileMedia.kind, 'audio');
  assert.equal(parsedWithFile.fileMedia.filename, 'nightcord_demo_01.mp3');
  assert.equal(parsedWithFile.fileMedia.sizeLabel, '4MB MP3');
  assert.equal(parsedWithFile.fileMedia.fileType, 'MP3');

  const structured = parseStructuredJsonReply(
    JSON.stringify({
      send_time: '2026-11-22 01:50',
      message: 'K: 仮ミックスまとめたよ。聴いてみて。',
      attach_file: { filename: 'nightcord_demo_01.mp3', size_label: '4MB MP3' },
    }),
    'K',
    prevDt,
    baseNow
  );
  assert.ok(structured);
  assert.deepEqual(structured.sentAt, {
    year: 2026,
    month: 11,
    day: 22,
    hour: 1,
    minute: 50,
  });
  assert.equal(structured.text, '仮ミックスまとめたよ。聴いてみて。');
  assert.equal(structured.fileMedia?.filename, 'nightcord_demo_01.mp3');
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

test('buildAiChatPayload injects voice/muted/text/offline member states, webSearch rule, and never regex-parses times from prose', () => {
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

  const proseOnly = parseAiModelOutput('今ちょうどサビのミックス書き出したところ。', 'K');
  assert.equal(proseOnly.text, '今ちょうどサビのミックス書き出したところ。');
  assert.equal(proseOnly.inferredSentAt, null);

  const proseWithParenthetical = parseAiModelOutput(
    '(2026/11/24 01:35) 今ちょうどサビのミックス書き出したところ。',
    'K'
  );
  assert.equal(proseWithParenthetical.inferredSentAt, null);

  const jsonMarkdownReply = parseStructuredJsonReply(
    '```json\n{"send_time":"2026-11-24 01:42","message":"えななん、ラフもうちょい待てる？"}\n```',
    'K',
    { year: 2026, month: 11, day: 24, hour: 1, minute: 20 },
    baseNow
  );
  assert.ok(jsonMarkdownReply);
  assert.equal(jsonMarkdownReply.text, 'えななん、ラフもうちょい待てる？');
  assert.deepEqual(jsonMarkdownReply.sentAt, {
    year: 2026,
    month: 11,
    day: 24,
    hour: 1,
    minute: 42,
  });

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
      assert.deepEqual(bodyObj.response_format, { type: 'json_object' });
      return new Response(
        JSON.stringify({
          usage: { prompt_tokens: 40, completion_tokens: 18, total_tokens: 58 },
          choices: [
            {
              message: {
                content: JSON.stringify({
                  send_time: '2026-11-24 01:22',
                  message: 'ツール無しフォールバック成功',
                }),
              },
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }) as typeof fetch;

    const fbUsage: AiUsageRecord[] = [];
    const fbResult = await requestAiCompletion({
      targetCharacter: k,
      charConfig: createDefaultAiCharacterConfig(),
      globalConfig: { ...baseGlobal, webSearchEnabled: false },
      history: [userMsg],
      allCharacters: INITIAL_CHARACTERS,
      purpose: 'continue',
      onUsageRecord: (r) => fbUsage.push(r),
    });
    assert.equal(fbResult.rawText, 'ツール無しフォールバック成功');
    assert.deepEqual(fbResult.toolSentAt, { year: 2026, month: 11, day: 24, hour: 1, minute: 22 });
    assert.equal(fbUsage.length, 2);
    assert.equal(fbUsage[0].status, 'error');
    assert.equal(fbUsage[0].usageKnown, false);
    assert.equal(fbUsage[1].status, 'ok');
    assert.equal(fbUsage[1].usageKnown, true);
    assert.equal(fbUsage[1].totalTokens, 58);

    let gemBody: Record<string, unknown> = {};
    globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
      gemBody = JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>;
      return new Response(
        JSON.stringify({
          usageMetadata: {
            promptTokenCount: 120,
            candidatesTokenCount: 35,
            totalTokenCount: 180,
            thoughtsTokenCount: 25,
            cachedContentTokenCount: 60,
          },
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
    assert.equal(gemResult.usageRecords[0].thinkingTokens, 25);
    assert.equal(gemResult.usageRecords[0].cachedTokens, 60);

    let gemSearchBody: Record<string, unknown> = {};
    globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
      gemSearchBody = JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>;
      return new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      send_time: '2026-11-24 01:29',
                      message: '検索付きGemini返答',
                    }),
                  },
                ],
              },
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }) as typeof fetch;

    const gemSearchResult = await requestAiCompletion({
      targetCharacter: k,
      charConfig: createDefaultAiCharacterConfig(),
      globalConfig: {
        ...baseGlobal,
        protocol: 'gemini',
        baseUrl: AI_PROTOCOL_METAS.gemini.defaultBaseUrl,
        model: 'gemini-2.5-flash',
        webSearchEnabled: true,
      },
      history: [userMsg],
      allCharacters: INITIAL_CHARACTERS,
    });
    assert.deepEqual(gemSearchBody.tools, [{ google_search: {} }]);
    assert.equal(
      (gemSearchBody.generationConfig as Record<string, unknown>).responseMimeType,
      'application/json'
    );
    assert.equal(gemSearchResult.rawText, '検索付きGemini返答');
    assert.deepEqual(gemSearchResult.toolSentAt, {
      year: 2026,
      month: 11,
      day: 24,
      hour: 1,
      minute: 29,
    });
    assert.equal(gemSearchResult.usageRecords[0].usageKnown, false);
    assert.equal(gemSearchResult.usageRecords[0].totalTokens, null);

    let antBody: Record<string, unknown> = {};
    globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
      antBody = JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>;
      return new Response(
        JSON.stringify({
          usage: {
            input_tokens: 90,
            output_tokens: 24,
            cache_read_input_tokens: 45,
            cache_creation_input_tokens: 15,
          },
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
    assert.equal(antResult.usageRecords[0].cachedTokens, 45);
    assert.equal(antResult.usageRecords[0].extraTokens?.cache_creation_input_tokens, 15);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('5-tier timeFrequency and outputLanguage affect prompts independently and preserve timestamps for playback', () => {
  const k = INITIAL_CHARACTERS[0];
  const simNow = new Date(2026, 10, 24, 17, 30);

  const frequencies: AiTimeFrequency[] = [
    'high',
    'somewhat_high',
    'balanced',
    'somewhat_low',
    'low',
  ];
  const frequencyPrompts = frequencies.map((freq) =>
    buildAiChatPayload(k, [], 'Quiet composer', INITIAL_CHARACTERS, {
      timeMode: 'ai_inferred',
      timeFrequency: freq,
      now: simNow,
    }).systemInstruction
  );
  assert.equal(new Set(frequencyPrompts).size, 5);
  assert.ok(frequencyPrompts[0].includes('Local webpage simulation start time: 2026-11-24 17:30'));
  assert.ok(frequencyPrompts[0].includes('Frequency tendency — HIGH'));
  assert.ok(frequencyPrompts[4].includes('Frequency tendency — LOW'));

  const outputLangs: AiOutputLanguage[] = ['auto', 'zh-CN', 'zh-TW', 'en', 'ja'];
  const langInstructions = outputLangs.map((outLang) => {
    const cfg = sanitizeAiGlobalConfig({ outputLanguage: outLang, timeFrequency: 'somewhat_low' });
    assert.equal(cfg.outputLanguage, outLang);
    assert.equal(cfg.timeFrequency, 'somewhat_low');
    return buildAiChatPayload(k, [], 'Persona stays intact', INITIAL_CHARACTERS, {
      outputLanguage: cfg.outputLanguage,
      now: simNow,
    }).systemInstruction;
  });
  assert.ok(langInstructions[1].includes('Simplified Chinese'));
  assert.ok(langInstructions[2].includes('Traditional Chinese'));
  assert.ok(langInstructions[3].includes('English'));
  assert.ok(langInstructions[4].includes('Japanese'));
  assert.ok(langInstructions.every((inst) => inst.includes('Persona stays intact')));

  const msg1Time = resolveClampedOutgoingTimestamp(
    [],
    { year: 2026, month: 11, day: 24, hour: 17, minute: 35 },
    simNow
  );
  const m1 = createOutgoingMessage('そろそろ集まろうか', k, simNow, msg1Time)!;
  const msg2Time = resolveClampedOutgoingTimestamp(
    [m1],
    { year: 2026, month: 11, day: 24, hour: 17, minute: 50 },
    simNow
  );
  const m2 = createOutgoingMessage('うん、今入った', INITIAL_CHARACTERS[1], simNow, msg2Time)!;

  assert.deepEqual(m1.sentAt, { year: 2026, month: 11, day: 24, hour: 17, minute: 35 });
  assert.deepEqual(m2.sentAt, { year: 2026, month: 11, day: 24, hour: 17, minute: 50 });

  const timeline = buildPlaybackTimeline([m1, m2], [], false, simNow);
  assert.equal(timeline.length, 2);
  const delayMs = computePlaybackStepDelayMs(timeline, 1, 'timeline', 2.5, 'proportional', 60);
  assert.equal(delayMs, 15000);
  const rendered = computeDisplayMessagesForPlayback([m1, m2], true, simNow);
  assert.equal(rendered[0].timestamp, m1.timestamp);
  assert.equal(rendered[1].timestamp, m2.timestamp);
});

test('multi-provider extractProviderUsage, unknown handling, session reset, and testAiConnection usage callback', async () => {
  const dsUsage = extractProviderUsage('deepseek', {
    usage: {
      prompt_tokens: 100,
      completion_tokens: 50,
      total_tokens: 150,
      prompt_cache_hit_tokens: 64,
      prompt_cache_miss_tokens: 36,
      completion_tokens_details: { reasoning_tokens: 20, audio_tokens: 5 },
    },
  });
  assert.equal(dsUsage.usageKnown, true);
  assert.equal(dsUsage.inputTokens, 100);
  assert.equal(dsUsage.outputTokens, 50);
  assert.equal(dsUsage.totalTokens, 150);
  assert.equal(dsUsage.cachedTokens, 64);
  assert.equal(dsUsage.thinkingTokens, 20);
  assert.equal(dsUsage.extraTokens.prompt_cache_miss_tokens, 36);
  assert.equal(dsUsage.extraTokens.completion_audio_tokens, 5);

  const missingUsage = extractProviderUsage('openai', { choices: [{ message: { content: 'hi' } }] });
  assert.equal(missingUsage.usageKnown, false);
  assert.equal(missingUsage.inputTokens, null);
  assert.equal(missingUsage.outputTokens, null);
  assert.equal(missingUsage.totalTokens, null);

  let state = createEmptyUsageState();
  state = appendUsageRecordToState(state, {
    id: 'r1',
    timestampIso: '2026-11-24T17:30:00.000Z',
    protocol: 'openai',
    model: 'gpt-4o-mini',
    characterId: 'k',
    characterName: 'K',
    purpose: 'chat',
    status: 'ok',
    usageKnown: true,
    inputTokens: 10,
    outputTokens: 20,
    totalTokens: 30,
    thinkingTokens: null,
    cachedTokens: 4,
  });
  state = appendUsageRecordToState(state, {
    id: 'r2',
    timestampIso: '2026-11-24T17:31:00.000Z',
    protocol: 'openai',
    model: 'custom-proxy',
    characterId: 'k',
    characterName: 'K',
    purpose: 'chat',
    status: 'ok',
    usageKnown: false,
    inputTokens: null,
    outputTokens: null,
    totalTokens: null,
    thinkingTokens: null,
    cachedTokens: null,
  });
  assert.equal(state.session.requestCount, 2);
  assert.equal(state.session.knownUsageRequestCount, 1);
  assert.equal(state.session.unknownUsageRequestCount, 1);
  assert.equal(state.session.totalTokens, 30);

  const reset = resetSessionUsageState(state);
  assert.equal(reset.session.requestCount, 0);
  assert.equal(reset.session.totalTokens, null);
  assert.equal(reset.history.requestCount, 2);
  assert.equal(reset.history.totalTokens, 30);

  const restored = sanitizeAiUsageState(
    { history: reset.history, historyRecords: reset.historyRecords },
    { session: state.session, sessionRecords: state.sessionRecords }
  );
  assert.equal(restored.history.requestCount, 2);
  assert.equal(restored.session.requestCount, 2);

  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({
          usage: { prompt_tokens: 7, completion_tokens: 3, total_tokens: 10 },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )) as typeof fetch;
    const testRecords: AiUsageRecord[] = [];
    const res = await testAiConnection('openai', '', 'sk-live', 'gpt-4o-mini', (rec) =>
      testRecords.push(rec)
    );
    assert.equal(res.ok, true);
    assert.equal(testRecords.length, 1);
    assert.equal(testRecords[0].purpose, 'test');
    assert.equal(testRecords[0].totalTokens, 10);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('dedicated time-analysis metadata fallback triggers across protocols when primary omits send_time', async () => {
  const k = INITIAL_CHARACTERS[0];
  const baseNow = new Date(2026, 10, 24, 14, 30);
  const userMsg = createOutgoingMessage(
    '曲のバランスどう思う？',
    { id: '__user__', name: 'あなた', avatarType: 'k' },
    baseNow,
    { timestamp: '今日 14:30', sentAt: { year: 2026, month: 11, day: 24, hour: 14, minute: 30 } }
  )!;

  const analyzerPrompt = buildDedicatedTimeAnalyzerPrompt({
    speakerName: k.name,
    cleanedReply: 'サビのピアノを少し抑えてみるね。',
    history: [userMsg],
    timeFrequency: 'somewhat_low',
    members: INITIAL_VOICE_MEMBERS,
    allCharacters: INITIAL_CHARACTERS,
    prevDt: userMsg.sentAt,
    now: baseNow,
  });
  assert.ok(analyzerPrompt.systemInstruction.includes('silent timestamp metadata analyzer'));
  assert.ok(analyzerPrompt.userPrompt.includes('SOMEWHAT LOW'));
  assert.ok(analyzerPrompt.userPrompt.includes('2026-11-24 14:30'));
  assert.ok(analyzerPrompt.userPrompt.includes('サビのピアノを少し抑えてみるね。'));

  assert.deepEqual(
    parseDedicatedTimeAnalyzerOutput('```json\n{"send_time":"2026-11-24 15:12"}\n```', userMsg.sentAt, baseNow),
    { year: 2026, month: 11, day: 24, hour: 15, minute: 12 }
  );
  assert.deepEqual(
    parseDedicatedTimeAnalyzerOutput('Based on context around 14:30, final: 2026-11-24 16:05', userMsg.sentAt, baseNow),
    { year: 2026, month: 11, day: 24, hour: 16, minute: 5 }
  );
  assert.deepEqual(
    parseDedicatedTimeAnalyzerOutput('{"send_time":"2026-11-24 12:00"}', userMsg.sentAt, baseNow),
    userMsg.sentAt
  );

  const baseGlobal: AiGlobalConfig = {
    ...DEFAULT_AI_GLOBAL_CONFIG,
    useGlobalApi: true,
    protocol: 'deepseek',
    baseUrl: AI_PROTOCOL_METAS.deepseek.defaultBaseUrl,
    apiKey: 'sk-ds-test',
    model: 'deepseek-chat',
    timeMode: 'ai_inferred',
    timeFrequency: 'high',
    webSearchEnabled: false,
  };

  const originalFetch = globalThis.fetch;
  try {
    let dsCall = 0;
    const dsBodies: Record<string, unknown>[] = [];
    globalThis.fetch = (async (_input: string | URL | Request, init?: RequestInit) => {
      dsCall += 1;
      const bodyObj = JSON.parse(String(init?.body ?? '{}')) as Record<string, unknown>;
      dsBodies.push(bodyObj);
      if (dsCall === 1) {
        return new Response(
          JSON.stringify({
            usage: { prompt_tokens: 90, completion_tokens: 18, total_tokens: 108 },
            choices: [{ message: { content: 'うん、今すぐ直して送るよ。' } }],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      if (dsCall === 2) {
        return new Response('json_object unsupported', { status: 400 });
      }
      return new Response(
        JSON.stringify({
          usage: { prompt_tokens: 55, completion_tokens: 12, total_tokens: 67 },
          choices: [{ message: { content: '{"send_time":"2026-11-24 14:33"}' } }],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }) as typeof fetch;

    const dsRecords: AiUsageRecord[] = [];
    const dsResult = await requestAiCompletion({
      targetCharacter: k,
      charConfig: createDefaultAiCharacterConfig(),
      globalConfig: baseGlobal,
      history: [userMsg],
      allCharacters: INITIAL_CHARACTERS,
      members: INITIAL_VOICE_MEMBERS,
      onUsageRecord: (r) => dsRecords.push(r),
    });
    assert.equal(dsResult.rawText, 'うん、今すぐ直して送るよ。');
    assert.deepEqual(dsResult.toolSentAt, { year: 2026, month: 11, day: 24, hour: 14, minute: 33 });
    assert.equal(dsBodies.length, 3);
    assert.deepEqual(dsBodies[1].response_format, { type: 'json_object' });
    assert.equal(dsBodies[2].response_format, undefined);
    assert.equal(dsRecords.length, 3);
    assert.equal(dsRecords[0].purpose, 'chat');
    assert.equal(dsRecords[1].purpose, 'time_analysis');
    assert.equal(dsRecords[1].status, 'error');
    assert.equal(dsRecords[2].purpose, 'time_analysis');
    assert.equal(dsRecords[2].status, 'ok');
    assert.equal(dsRecords[2].totalTokens, 67);

    let gemCall = 0;
    globalThis.fetch = (async () => {
      gemCall += 1;
      if (gemCall === 1) {
        return new Response(
          JSON.stringify({
            usageMetadata: { promptTokenCount: 70, candidatesTokenCount: 15, totalTokenCount: 85 },
            candidates: [{ content: { parts: [{ text: 'あとでまた確認するね。' }] } }],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({
          usageMetadata: { promptTokenCount: 40, candidatesTokenCount: 10, totalTokenCount: 50 },
          candidates: [{ content: { parts: [{ text: '{"send_time":"2026-11-24 15:40"}' }] } }],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }) as typeof fetch;

    const gemFallbackResult = await requestAiCompletion({
      targetCharacter: k,
      charConfig: createDefaultAiCharacterConfig(),
      globalConfig: {
        ...baseGlobal,
        protocol: 'gemini',
        baseUrl: AI_PROTOCOL_METAS.gemini.defaultBaseUrl,
        model: 'gemini-2.5-flash',
      },
      history: [userMsg],
      allCharacters: INITIAL_CHARACTERS,
    });
    assert.equal(gemFallbackResult.rawText, 'あとでまた確認するね。');
    assert.deepEqual(gemFallbackResult.toolSentAt, {
      year: 2026,
      month: 11,
      day: 24,
      hour: 15,
      minute: 40,
    });
    assert.equal(gemFallbackResult.usageRecords.length, 2);
    assert.equal(gemFallbackResult.usageRecords[1].purpose, 'time_analysis');

    let antCall = 0;
    globalThis.fetch = (async () => {
      antCall += 1;
      if (antCall === 1) {
        return new Response(
          JSON.stringify({
            usage: { input_tokens: 60, output_tokens: 14 },
            content: [{ type: 'text', text: '了解。少し作業に戻る。' }],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return new Response('rate limit', { status: 500 });
    }) as typeof fetch;

    const antFailAnalyzerResult = await requestAiCompletion({
      targetCharacter: k,
      charConfig: createDefaultAiCharacterConfig(),
      globalConfig: {
        ...baseGlobal,
        protocol: 'anthropic',
        baseUrl: AI_PROTOCOL_METAS.anthropic.defaultBaseUrl,
        model: 'claude-sonnet-4-20250514',
      },
      history: [userMsg],
      allCharacters: INITIAL_CHARACTERS,
    });
    assert.equal(antFailAnalyzerResult.rawText, '了解。少し作業に戻る。');
    assert.equal(antFailAnalyzerResult.toolSentAt, null);
    assert.equal(antFailAnalyzerResult.usageRecords.length, 2);
    assert.equal(antFailAnalyzerResult.usageRecords[1].purpose, 'time_analysis');
    assert.equal(antFailAnalyzerResult.usageRecords[1].status, 'error');
  } finally {
    globalThis.fetch = originalFetch;
  }
});


