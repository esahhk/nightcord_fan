import test from 'node:test';
import assert from 'node:assert/strict';
import { getUiText } from './i18n';
import {
  INITIAL_CHARACTERS,
  INITIAL_MESSAGES,
  INITIAL_VOICE_MEMBERS,
  MAX_PLAYBACK_INTERVAL_MS,
  TEMPLATE_CONVERSATION_ID,
  appendInputToken,
  collectReferencedMediaIds,
  computeDisplayMessagesForPlayback,
  computePlaybackDelayMs,
  createFileMessage,
  createImageMessage,
  createInitialConversations,
  createNewConversation,
  createOutgoingMessage,
  detectFileMediaKind,
  extractFileType,
  formatDuration,
  formatJapaneseTime,
  formatNightcordFileMeta,
  invokeAction,
  parseNightcordBackup,
  resolveOutgoingTimestamp,
  setMemberOnlineStatus,
  setMemberPresenceStatus,
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

test('i18n dictionary provides distinct zh, ja, and en control text with 5 onboarding steps', () => {
  const zh = getUiText('zh');
  const ja = getUiText('ja');
  const en = getUiText('en');
  assert.equal(zh.stepBadges.length, 5);
  assert.equal(ja.stepBadges.length, 5);
  assert.equal(en.stepBadges.length, 5);
  assert.equal(zh.stepBadges[4], '步骤 5 / 5');
  assert.equal(ja.stepBadges[4], 'ステップ 5 / 5');
  assert.equal(en.stepBadges[4], 'Step 5 / 5');
  assert.equal(zh.editChar, '编辑');
  assert.equal(ja.editChar, '編集');
  assert.equal(en.editChar, 'Edit');
  assert.equal(zh.emptyConvTitle('雑談'), '开始「雑談」的对话吧');
  assert.equal(en.emptyConvTitle('雑談'), 'Start chatting in "雑談"');
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
    assert.equal(futureYear.timestamp, '2999年12月31日');
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

test('computeDisplayMessagesForPlayback handles anchored-to-today and unanchored day rollover', () => {
  const baseNow = new Date(2026, 5, 18, 12, 0);
  const sender = INITIAL_CHARACTERS[0];
  const m1 = createOutgoingMessage('old year', sender, baseNow, {
    sentAt: { year: 2021, month: 6, day: 17, hour: 15, minute: 30 },
    timestamp: '2021年6月17日',
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
  assert.equal(anchored[0].timestamp, '2021年6月17日');
  assert.equal(anchored[1].timestamp, '13日 23:13');
  assert.equal(anchored[2].timestamp, '14日 0:05');

  const unanchoredStep2 = computeDisplayMessagesForPlayback([m1, m2], false, baseNow);
  assert.equal(unanchoredStep2[0].timestamp, '2021年6月17日');
  assert.equal(unanchoredStep2[1].timestamp, '今日 23:13');

  const unanchoredStep3 = computeDisplayMessagesForPlayback([m1, m2, m3], false, baseNow);
  assert.equal(unanchoredStep3[0].timestamp, '2021年6月17日');
  assert.equal(unanchoredStep3[1].timestamp, '昨日 23:13');
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
