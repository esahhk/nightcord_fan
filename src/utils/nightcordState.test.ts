import test from 'node:test';
import assert from 'node:assert/strict';
import { getUiText } from './i18n';
import {
  INITIAL_CHARACTERS,
  INITIAL_MESSAGES,
  INITIAL_VOICE_MEMBERS,
  MAX_PLAYBACK_INTERVAL_MS,
  TEMPLATE_CONVERSATION_ID,
  addMemberStatusEvent,
  appendInputToken,
  buildPlaybackTimeline,
  collectReferencedMediaIds,
  computeDisplayMessagesForPlayback,
  computePlaybackDelayMs,
  computePlaybackStepDelayMs,
  computePlaybackStepState,
  createFileMessage,
  createImageMessage,
  createInitialConversations,
  createNewConversation,
  createOutgoingMessage,
  deleteMessageAndRebuildDividers,
  detectFileMediaKind,
  extractFileType,
  formatDuration,
  formatJapaneseTime,
  formatNightcordFileMeta,
  getInitialPlaybackCursor,
  getSuggestedStatusEventTime,
  hydrateLegacyMessagesSentAt,
  invokeAction,
  parseNightcordBackup,
  removeCharacterAndMember,
  removeMemberStatusEvent,
  resolveOutgoingTimestamp,
  setMemberOnlineStatus,
  setMemberPresenceStatus,
  syncMembersWithCharacters,
  syncUpsertMemberFromCharacter,
  toggleMemberMute,
  upsertCharacter,
} from './nightcordState';
import {
  NIGHTCORD_HTML_TEMPLATE,
  NIGHTCORD_PALETTE_TOKENS,
  NIGHTCORD_TSX_TEMPLATE,
  isTemplateSubpageLocation,
} from './nightcordTemplateCode';

test('initial template conversation and voice members match reference', () => {
  const convs = createInitialConversations();
  assert.equal(convs.length, 1);
  assert.equal(convs[0].id, TEMPLATE_CONVERSATION_ID);
  assert.equal(convs[0].isTemplate, true);
  assert.equal(convs[0].messages.length, INITIAL_MESSAGES.length);
  assert.equal(INITIAL_VOICE_MEMBERS.length, 4);
  assert.deepEqual(
    INITIAL_VOICE_MEMBERS.map((m) => m.name),
    ['K', '雪', 'えななん', 'Amia']
  );
});

test('createNewConversation rejects empty title and creates blank or templated conversation', () => {
  assert.equal(createNewConversation('   '), null);
  const blank = createNewConversation('雑談', false, new Date(2026, 10, 18, 2, 0));
  assert.ok(blank);
  assert.equal(blank.title, '雑談');
  assert.equal(blank.messages.length, 0);

  const copied = createNewConversation('コピー作業', true, new Date(2026, 10, 18, 2, 1));
  assert.ok(copied);
  assert.equal(copied.messages.length, INITIAL_MESSAGES.length);
  assert.equal(copied.isTemplate, false);
});

test('upsertCharacter creates new character and edits existing character', () => {
  const createdRes = upsertCharacter(INITIAL_CHARACTERS, {
    name: 'ミク',
    avatarType: 'amia',
  });
  assert.ok(createdRes.saved);
  assert.equal(createdRes.characters.length, INITIAL_CHARACTERS.length + 1);
  assert.equal(createdRes.saved.name, 'ミク');

  const editedRes = upsertCharacter(createdRes.characters, {
    id: createdRes.saved.id,
    name: '初音ミク',
    avatarType: 'yuki',
    customAvatarMediaId: 'media-1',
  });
  assert.ok(editedRes.saved);
  assert.equal(editedRes.characters.length, createdRes.characters.length);
  assert.equal(editedRes.saved.name, '初音ミク');
  assert.equal(editedRes.saved.customAvatarMediaId, 'media-1');
});

test('createOutgoingMessage and createFileMessage preserve sender and format Nightcord file cards', () => {
  assert.equal(createOutgoingMessage('   '), null);
  const sender = { id: 'c1', name: 'ミク', avatarType: 'enanan' as const, customAvatarMediaId: 'av-1' };
  const fixedDate = new Date(2026, 10, 18, 1, 5);
  const msg = createOutgoingMessage('  おつかれ  ', sender, fixedDate);
  assert.ok(msg);
  assert.equal(msg.username, 'ミク');
  assert.equal(msg.customAvatarMediaId, 'av-1');
  assert.equal(msg.timestamp, formatJapaneseTime(fixedDate));

  assert.equal(detectFileMediaKind('Vrough01.mp4', 'video/mp4'), 'video');
  assert.equal(detectFileMediaKind('MIX1_oke.mp3', 'audio/mpeg'), 'audio');
  assert.equal(detectFileMediaKind('歌詞_調整版01.txt', 'text/plain'), 'text');
  assert.equal(detectFileMediaKind('ラフA_04.jpg', 'image/jpeg'), 'image');

  const mp4Meta = formatNightcordFileMeta(220 * 1024 * 1024, 'Vrough01.mp4', 'video');
  assert.equal(mp4Meta.sizeLabel, '220MB MP4 ビデオ');
  const mp3Meta = formatNightcordFileMeta(7 * 1024 * 1024, 'MIX1_oke.mp3', 'audio');
  assert.equal(mp3Meta.sizeLabel, '7MB MP3');
  const txtMeta = formatNightcordFileMeta(1024, '歌詞_調整版01.txt', 'text');
  assert.equal(txtMeta.sizeLabel, '1KB テキスト');
  const jpgMeta = formatNightcordFileMeta(7 * 1024 * 1024, 'ラフA_04.jpg', 'image');
  assert.equal(jpgMeta.sizeLabel, '7MB JPG');

  const fileMsg = createFileMessage(
    {
      mediaId: 'vid-1',
      kind: 'video',
      filename: 'Vrough01.mp4',
      sizeLabel: mp4Meta.sizeLabel,
      fileType: mp4Meta.fileType,
      displayMode: 'card',
    },
    sender,
    '今の進捗',
    fixedDate
  );
  assert.equal(fileMsg.fileMedia?.kind, 'video');
  assert.equal(fileMsg.fileMedia?.filename, 'Vrough01.mp4');
  assert.equal(fileMsg.text, '今の進捗');
  assert.equal(extractFileType('ラフC.jpg'), 'JPG');
  assert.equal(formatDuration(65), '1:05');
});

test('i18n dictionary provides distinct zh, ja, and en control text with 6 onboarding steps and 4 AI guide steps', () => {
  const zh = getUiText('zh');
  const ja = getUiText('ja');
  const en = getUiText('en');
  assert.equal(zh.stepBadges.length, 6);
  assert.equal(ja.stepBadges.length, 6);
  assert.equal(en.stepBadges.length, 6);
  assert.equal(zh.stepBadges[5], '步骤 6 / 6');
  assert.equal(ja.stepBadges[5], 'ステップ 6 / 6');
  assert.equal(en.stepBadges[5], 'Step 6 / 6');
  assert.equal(zh.aiGuideBadges.length, 4);
  assert.equal(ja.aiGuideBadges.length, 4);
  assert.equal(en.aiGuideBadges.length, 4);
  assert.equal(zh.editChar, '编辑');
  assert.equal(ja.editChar, '編集');
  assert.equal(en.editChar, 'Edit');
  assert.equal(zh.emptyConvTitle('雑談'), '开始「雑談」的对话吧');
  assert.equal(en.emptyConvTitle('雑談'), 'Start chatting in "雑談"');
  assert.ok(zh.youtubeTutorialTitle.includes('YouTube'));
  assert.ok(ja.youtubeTutorialTitle.includes('YouTube'));
  assert.ok(en.youtubeTutorialTitle.includes('YouTube'));
  assert.equal(Boolean(INITIAL_MESSAGES[0].topClipped), false);
});

test('toggleMemberMute, setMemberOnlineStatus, appendInputToken, and invokeAction work', () => {
  const first = toggleMemberMute(INITIAL_VOICE_MEMBERS, 'k');
  assert.equal(first.updated?.muted, true);

  const offlineRes = setMemberOnlineStatus(INITIAL_VOICE_MEMBERS, 'k', false);
  assert.equal(offlineRes.updated?.online, false);
  assert.equal(offlineRes.updated?.status, 'offline');
  const onlineOnlyRes = setMemberPresenceStatus(offlineRes.members, 'k', 'online');
  assert.equal(onlineOnlyRes.updated?.online, true);
  assert.equal(onlineOnlyRes.updated?.status, 'online');
  const voiceRes = setMemberPresenceStatus(onlineOnlyRes.members, 'k', 'voice');
  assert.equal(voiceRes.updated?.online, true);
  assert.equal(voiceRes.updated?.status, 'voice');

  assert.equal(appendInputToken('了解', '♪'), '了解♪');

  let received = '';
  const fired = invokeAction(
    {
      onChannelSelect: (id) => {
        received = id;
      },
    },
    'onChannelSelect',
    'work'
  );
  assert.equal(fired, true);
  assert.equal(received, 'work');
});

test('custom date-time validation prevents earlier dates and supports 2000-3000 range', () => {
  const refNow = new Date(2026, 5, 18, 12, 0);

  const earlier = resolveOutgoingTimestamp(
    INITIAL_MESSAGES,
    { enabled: true, year: 2026, month: 6, day: 18, time: '01:35' },
    refNow
  );
  assert.equal(earlier.ok, false);

  const earlierYear = resolveOutgoingTimestamp(
    INITIAL_MESSAGES,
    { enabled: true, year: 2021, month: 6, day: 17, time: '23:59' },
    refNow
  );
  assert.equal(earlierYear.ok, false);

  const sameTime = resolveOutgoingTimestamp(
    INITIAL_MESSAGES,
    { enabled: true, year: 2026, month: 6, day: 18, time: '01:36' },
    refNow
  );
  assert.equal(sameTime.ok, true);
  if (sameTime.ok) {
    assert.equal(sameTime.timestamp, '今日 1:36');
  }

  const futureYear = resolveOutgoingTimestamp(
    INITIAL_MESSAGES,
    { enabled: true, year: 2999, month: 12, day: 31, time: '23:59' },
    refNow
  );
  assert.equal(futureYear.ok, true);
  if (futureYear.ok) {
    assert.equal(futureYear.timestamp, '2999年12月31日 23:59');
  }

  const yesterdayOnly = INITIAL_MESSAGES.slice(0, 7);
  const crossing = resolveOutgoingTimestamp(
    yesterdayOnly,
    { enabled: true, year: 2026, month: 6, day: 18, time: '00:10' },
    refNow
  );
  assert.equal(crossing.ok, true);
  if (crossing.ok) {
    assert.equal(crossing.timestamp, '今日 0:10');
    assert.equal(crossing.dividerBefore, '今日');
  }
});

test('computeDisplayMessagesForPlayback handles anchored-to-today and unanchored day rollover with message time preserved', () => {
  const baseNow = new Date(2026, 5, 18, 12, 0);
  const sender = INITIAL_CHARACTERS[0];
  const m1 = createOutgoingMessage('old year', sender, baseNow, {
    sentAt: { year: 2021, month: 6, day: 17, hour: 15, minute: 30 },
    timestamp: '2021年6月17日 15:30',
  })!;
  const m2 = createOutgoingMessage('same month', sender, baseNow, {
    sentAt: { year: 2026, month: 6, day: 13, hour: 23, minute: 13 },
    timestamp: '13日 23:13',
  })!;
  const m3 = createOutgoingMessage('next day', sender, baseNow, {
    sentAt: { year: 2026, month: 6, day: 14, hour: 0, minute: 5 },
    timestamp: '14日 0:05',
  })!;

  const anchored = computeDisplayMessagesForPlayback([m1, m2, m3], true, baseNow);
  assert.equal(anchored[0].timestamp, '2021年6月17日 15:30');
  assert.equal(anchored[1].timestamp, '13日 23:13');
  assert.equal(anchored[1].dividerBefore, '13日');
  assert.equal(anchored[2].timestamp, '14日 0:05');
  assert.equal(anchored[2].dividerBefore, '14日');

  const unanchoredStep2 = computeDisplayMessagesForPlayback([m1, m2], false, baseNow);
  assert.equal(unanchoredStep2[0].timestamp, '2021年6月17日 15:30');
  assert.equal(unanchoredStep2[1].timestamp, '今日 23:13');
  assert.equal(unanchoredStep2[1].dividerBefore, '今日');

  const unanchoredStep3 = computeDisplayMessagesForPlayback([m1, m2, m3], false, baseNow);
  assert.equal(unanchoredStep3[0].timestamp, '2021年6月17日 15:30');
  assert.equal(unanchoredStep3[1].timestamp, '昨日 23:13');
  assert.equal(unanchoredStep3[1].dividerBefore, '昨日');
  assert.equal(unanchoredStep3[2].timestamp, '今日 0:05');
  assert.equal(unanchoredStep3[2].dividerBefore, '今日');
});

test('collectReferencedMediaIds and parseNightcordBackup handle valid and invalid payloads', () => {
  const convs = createInitialConversations();
  const extraConv = createNewConversation('雑談', false);
  assert.ok(extraConv);
  extraConv.messages.push(
    createImageMessage(
      {
        mediaId: 'img-99',
        filename: 'a.jpg',
        sizeLabel: '1MB JPG',
        fileType: 'JPG',
        displayMode: 'card',
      },
      { id: 'c-custom', name: 'ミク', avatarType: 'k', customAvatarMediaId: 'av-99' }
    )
  );
  const allConvs = [...convs, extraConv];
  const ids = collectReferencedMediaIds(allConvs, [
    ...INITIAL_CHARACTERS,
    { id: 'c-custom', name: 'ミク', avatarType: 'k', customAvatarMediaId: 'av-99' },
  ]);
  assert.ok(ids.includes('img-99'));
  assert.ok(ids.includes('av-99'));

  const payload = JSON.stringify({
    version: 1,
    exportedAt: '2026-11-18T00:00:00.000Z',
    conversations: [extraConv],
    characters: INITIAL_CHARACTERS,
    activeConversationId: extraConv.id,
    activeCharacterId: 'yuki',
    media: { 'img-99': { mimeType: 'image/png', dataBase64: 'AAAA' } },
  });
  const parsed = parseNightcordBackup(payload);
  assert.ok(parsed);
  assert.equal(parsed.conversations.length, 2);
  assert.equal(parsed.activeConversationId, extraConv.id);
  assert.equal(parsed.activeCharacterId, 'yuki');
  assert.equal(parsed.media['img-99'].mimeType, 'image/png');

  assert.equal(parseNightcordBackup('not json'), null);
  assert.equal(parseNightcordBackup('{"conversations":[]}'), null);
});

test('computePlaybackDelayMs respects exact flow, proportional flow, fixed 0.5s-60s interval, and 0.5s floor', () => {
  assert.equal(computePlaybackDelayMs(INITIAL_MESSAGES, 0, 'timeline'), 1000);
  assert.equal(computePlaybackDelayMs(INITIAL_MESSAGES, 1, 'timeline', 2.5, 'proportional', 60), 2000);
  assert.equal(
    computePlaybackDelayMs(INITIAL_MESSAGES, 2, 'timeline', 2.5, 'proportional', 60),
    MAX_PLAYBACK_INTERVAL_MS
  );
  assert.equal(computePlaybackDelayMs(INITIAL_MESSAGES, 4, 'timeline', 2.5, 'proportional', 60), 1000);
  assert.equal(computePlaybackDelayMs(INITIAL_MESSAGES, 4, 'timeline', 2.5, 'proportional', 300), 500);
  assert.equal(computePlaybackDelayMs(INITIAL_MESSAGES, 1, 'timeline', 2.5, 'exact'), 120000);
  assert.equal(computePlaybackDelayMs(INITIAL_MESSAGES, 4, 'timeline', 2.5, 'exact'), 60000);

  assert.equal(computePlaybackDelayMs(INITIAL_MESSAGES, 2, 'even', 3), 3000);
  assert.equal(computePlaybackDelayMs(INITIAL_MESSAGES, 2, 'even', 60), 60000);
  assert.equal(computePlaybackDelayMs(INITIAL_MESSAGES, 2, 'even', 99), MAX_PLAYBACK_INTERVAL_MS);
  assert.equal(computePlaybackDelayMs(INITIAL_MESSAGES, 2, 'even', 0.1), 500);
});

test('UI template subpage routing and standalone template exports are valid', () => {
  assert.equal(
    isTemplateSubpageLocation({ pathname: '/', search: '?view=template', hash: '' }),
    true
  );
  assert.equal(
    isTemplateSubpageLocation({ pathname: '/', search: '', hash: '#template' }),
    true
  );
  assert.equal(
    isTemplateSubpageLocation({ pathname: '/template', search: '', hash: '' }),
    true
  );
  assert.equal(
    isTemplateSubpageLocation({ pathname: '/', search: '?autostart=1', hash: '' }),
    false
  );
  assert.ok(NIGHTCORD_PALETTE_TOKENS.length >= 8);
  assert.ok(NIGHTCORD_TSX_TEMPLATE.includes('export function NightcordTemplate'));
  assert.ok(NIGHTCORD_HTML_TEMPLATE.includes('25時、ナイトコードで。'));
});

test('deleteMessageAndRebuildDividers keeps day dividers accurate after deletions', () => {
  const baseNow = new Date(2026, 10, 21, 10, 0);
  const sender = INITIAL_CHARACTERS[0];
  const yesterdayMsg = createOutgoingMessage('yesterday', sender, baseNow, {
    sentAt: { year: 2026, month: 11, day: 20, hour: 23, minute: 0 },
    timestamp: '昨日 23:00',
  })!;
  const todayFirst = createOutgoingMessage('today 1', sender, baseNow, {
    sentAt: { year: 2026, month: 11, day: 21, hour: 1, minute: 10 },
    timestamp: '今日 1:10',
    dividerBefore: '今日',
  })!;
  const todaySecond = createOutgoingMessage('today 2', sender, baseNow, {
    sentAt: { year: 2026, month: 11, day: 21, hour: 2, minute: 20 },
    timestamp: '今日 2:20',
  })!;

  const afterDeletingBoundary = deleteMessageAndRebuildDividers(
    [yesterdayMsg, todayFirst, todaySecond],
    todayFirst.id,
    baseNow
  );
  assert.equal(afterDeletingBoundary.length, 2);
  assert.equal(afterDeletingBoundary[0].dividerBefore, undefined);
  assert.equal(afterDeletingBoundary[1].dividerBefore, '今日');

  const afterDeletingYesterday = deleteMessageAndRebuildDividers(
    afterDeletingBoundary,
    yesterdayMsg.id,
    baseNow
  );
  assert.equal(afterDeletingYesterday.length, 1);
  assert.equal(afterDeletingYesterday[0].dividerBefore, undefined);
});

test('syncUpsertMemberFromCharacter, syncMembersWithCharacters, and removeCharacterAndMember keep sidebar in sync', () => {
  const createdRes = upsertCharacter(INITIAL_CHARACTERS, {
    name: 'ミク',
    avatarType: 'amia',
    customAvatarMediaId: 'av-miku',
  });
  assert.ok(createdRes.saved);

  const syncedOnAdd = syncUpsertMemberFromCharacter(INITIAL_VOICE_MEMBERS, createdRes.saved);
  assert.equal(syncedOnAdd.length, INITIAL_VOICE_MEMBERS.length + 1);
  const addedMember = syncedOnAdd.find((m) => m.id === createdRes.saved!.id);
  assert.ok(addedMember);
  assert.equal(addedMember.name, 'ミク');
  assert.equal(addedMember.status, 'online');
  assert.equal(addedMember.customAvatarMediaId, 'av-miku');

  const editedRes = upsertCharacter(createdRes.characters, {
    id: createdRes.saved.id,
    name: '初音ミク',
    avatarType: 'yuki',
    customAvatarMediaId: 'av-miku-2',
  });
  assert.ok(editedRes.saved);
  const syncedOnEdit = syncUpsertMemberFromCharacter(syncedOnAdd, editedRes.saved);
  assert.equal(syncedOnEdit.length, syncedOnAdd.length);
  const editedMember = syncedOnEdit.find((m) => m.id === editedRes.saved!.id);
  assert.equal(editedMember?.name, '初音ミク');
  assert.equal(editedMember?.avatar, 'yuki');
  assert.equal(editedMember?.customAvatarMediaId, 'av-miku-2');

  const reconciled = syncMembersWithCharacters(INITIAL_VOICE_MEMBERS, editedRes.characters);
  assert.equal(reconciled.length, INITIAL_VOICE_MEMBERS.length + 1);
  assert.equal(reconciled.find((m) => m.id === 'k')?.avatar, 'k-pink');

  const removedActive = removeCharacterAndMember(
    editedRes.characters,
    syncedOnEdit,
    editedRes.saved.id,
    editedRes.saved.id
  );
  assert.equal(removedActive.removed, true);
  assert.equal(removedActive.characters.length, INITIAL_CHARACTERS.length);
  assert.equal(removedActive.members.length, INITIAL_VOICE_MEMBERS.length);
  assert.equal(removedActive.activeCharacterId, INITIAL_CHARACTERS[0].id);

  const singleChar = [INITIAL_CHARACTERS[0]];
  const singleMember = [INITIAL_VOICE_MEMBERS[0]];
  const blocked = removeCharacterAndMember(
    singleChar,
    singleMember,
    singleChar[0].id,
    singleChar[0].id
  );
  assert.equal(blocked.removed, false);
  assert.equal(blocked.characters.length, 1);
});

test('timed member status events merge chronologically with messages and respect includeStatusEvents', () => {
  const baseNow = new Date(2026, 10, 22, 9, 0);
  const hydrated = hydrateLegacyMessagesSentAt(INITIAL_MESSAGES, baseNow);
  assert.ok(hydrated.every((m) => Boolean(m.sentAt)));
  assert.equal(hydrated[2].sentAt?.hour, 20);
  assert.equal(hydrated[2].sentAt?.minute, 36);

  const ev1Res = addMemberStatusEvent(
    [],
    'enanan',
    'offline',
    { year: 2026, month: 11, day: 21, hour: 20, minute: 37 },
    baseNow
  );
  const ev2Res = addMemberStatusEvent(
    ev1Res.events,
    'enanan',
    'voice',
    { year: 2026, month: 11, day: 22, hour: 1, minute: 35 },
    baseNow
  );
  assert.equal(ev2Res.events.length, 2);

  const suggested = getSuggestedStatusEventTime(hydrated, ev2Res.events, baseNow);
  assert.equal(suggested.day, 22);

  const mergedSteps = buildPlaybackTimeline(hydrated, ev2Res.events, true, baseNow);
  assert.equal(mergedSteps.length, hydrated.length + 2);
  assert.equal(mergedSteps[3].kind, 'status');
  if (mergedSteps[3].kind === 'status') {
    assert.equal(mergedSteps[3].event.memberId, 'enanan');
    assert.equal(mergedSteps[3].event.status, 'offline');
  }
  assert.equal(mergedSteps[8].kind, 'status');
  if (mergedSteps[8].kind === 'status') {
    assert.equal(mergedSteps[8].event.status, 'voice');
  }

  const stateAfterOffline = computePlaybackStepState(
    mergedSteps,
    4,
    hydrated,
    INITIAL_VOICE_MEMBERS,
    true,
    baseNow
  );
  assert.equal(stateAfterOffline.messages.length, 3);
  assert.equal(
    stateAfterOffline.members.find((m) => m.id === 'enanan')?.status,
    'offline'
  );
  assert.equal(stateAfterOffline.hasOfflineTransition, true);

  const stateAfterComeback = computePlaybackStepState(
    mergedSteps,
    9,
    hydrated,
    INITIAL_VOICE_MEMBERS,
    true,
    baseNow
  );
  assert.equal(stateAfterComeback.messages.length, 7);
  assert.equal(
    stateAfterComeback.members.find((m) => m.id === 'enanan')?.status,
    'voice'
  );

  const startFromMsg4 = getInitialPlaybackCursor(mergedSteps, 3);
  assert.equal(startFromMsg4, 3);

  const delayToOffline = computePlaybackStepDelayMs(mergedSteps, 3, 'timeline', 2.5, 'exact');
  assert.equal(delayToOffline, 60000);

  const messagesOnlySteps = buildPlaybackTimeline(hydrated, ev2Res.events, false, baseNow);
  assert.equal(messagesOnlySteps.length, hydrated.length);
  assert.ok(messagesOnlySteps.every((s) => s.kind === 'message'));

  const remaining = removeMemberStatusEvent(ev2Res.events, ev1Res.created.id);
  assert.equal(remaining.length, 1);
  assert.equal(remaining[0].status, 'voice');
});

test('Cloudflare Workers wrangler.jsonc and public/_redirects have valid SPA config with no redirect loops', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const rootDir = path.resolve(import.meta.dirname, '../..');

  const wranglerRaw = fs.readFileSync(path.join(rootDir, 'wrangler.jsonc'), 'utf-8');
  const wranglerConfig = JSON.parse(wranglerRaw) as {
    assets?: { directory?: string; not_found_handling?: string };
  };
  assert.equal(wranglerConfig.assets?.directory, './dist');
  assert.equal(wranglerConfig.assets?.not_found_handling, 'single-page-application');

  const redirectsRaw = fs.readFileSync(path.join(rootDir, 'public/_redirects'), 'utf-8');
  const rules = redirectsRaw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'))
    .map((line) => line.split(/\s+/));

  assert.ok(rules.length > 0);
  const sources = new Set<string>();
  for (const parts of rules) {
    const [source, destination] = parts;
    assert.ok(source && destination);
    assert.notEqual(source, '/*');
    assert.notEqual(source, destination);
    assert.notEqual(destination, '/index.html');
    sources.add(source);
  }
  for (const [, destination] of rules) {
    assert.equal(sources.has(destination), false);
  }
});


