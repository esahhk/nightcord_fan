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
  computePlaybackDelayMs,
  createImageMessage,
  createInitialConversations,
  createNewConversation,
  createOutgoingMessage,
  createVoiceMessage,
  extractFileType,
  formatCustomJapaneseTime,
  formatDuration,
  formatJapaneseTime,
  invokeAction,
  parseJapaneseTimestampToMinutes,
  parseNightcordBackup,
  resolveOutgoingTimestamp,
  toggleMemberMute,
  upsertCharacter,
} from './nightcordState';

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

test('createOutgoingMessage, createImageMessage, and createVoiceMessage preserve sender identity', () => {
  assert.equal(createOutgoingMessage('   '), null);
  const sender = { id: 'c1', name: 'ミク', avatarType: 'enanan' as const, customAvatarMediaId: 'av-1' };
  const fixedDate = new Date(2026, 10, 18, 1, 5);
  const msg = createOutgoingMessage('  おつかれ  ', sender, fixedDate);
  assert.ok(msg);
  assert.equal(msg.username, 'ミク');
  assert.equal(msg.customAvatarMediaId, 'av-1');
  assert.equal(msg.timestamp, formatJapaneseTime(fixedDate));

  const imgMsg = createImageMessage(
    {
      mediaId: 'img-1',
      filename: 'sketch.png',
      sizeLabel: '1.2MB PNG',
      fileType: 'PNG',
      displayMode: 'card',
    },
    sender,
    'これどう？',
    fixedDate
  );
  assert.equal(imgMsg.imageMedia?.filename, 'sketch.png');
  assert.equal(imgMsg.imageMedia?.displayMode, 'card');
  assert.equal(extractFileType('ラフC.jpg'), 'JPG');
  assert.equal(extractFileType('noext'), 'IMG');
  assert.equal(imgMsg.text, 'これどう？');

  const voiceMsg = createVoiceMessage(
    { mediaId: 'aud-1', durationSec: 12, filename: 'voice.webm' },
    sender,
    fixedDate
  );
  assert.equal(voiceMsg.voiceMedia?.durationSec, 12);
  assert.equal(formatDuration(65), '1:05');
});

test('i18n dictionary provides distinct zh and ja control text', () => {
  const zh = getUiText('zh');
  const ja = getUiText('ja');
  assert.equal(zh.stepBadges[0], '步骤 1 / 4');
  assert.equal(ja.stepBadges[0], 'ステップ 1 / 4');
  assert.equal(zh.editChar, '编辑');
  assert.equal(ja.editChar, '編集');
});

test('toggleMemberMute, appendInputToken, and invokeAction work as expected', () => {
  const first = toggleMemberMute(INITIAL_VOICE_MEMBERS, 'k');
  assert.equal(first.updated?.muted, true);
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

test('custom timestamp validation prevents earlier timestamps and inserts day divider', () => {
  assert.equal(formatCustomJapaneseTime('today', '01:36'), '今日 1:36');
  assert.equal(parseJapaneseTimestampToMinutes('昨日 23:46'), 23 * 60 + 46);
  assert.equal(parseJapaneseTimestampToMinutes('今日 1:36'), 1440 + 96);

  const earlier = resolveOutgoingTimestamp(INITIAL_MESSAGES, {
    enabled: true,
    day: 'today',
    time: '01:35',
  });
  assert.equal(earlier.ok, false);

  const earlierYesterday = resolveOutgoingTimestamp(INITIAL_MESSAGES, {
    enabled: true,
    day: 'yesterday',
    time: '23:59',
  });
  assert.equal(earlierYesterday.ok, false);

  const sameTime = resolveOutgoingTimestamp(INITIAL_MESSAGES, {
    enabled: true,
    day: 'today',
    time: '01:36',
  });
  assert.equal(sameTime.ok, true);
  if (sameTime.ok) {
    assert.equal(sameTime.timestamp, '今日 1:36');
  }

  const yesterdayOnly = INITIAL_MESSAGES.slice(0, 7);
  const crossing = resolveOutgoingTimestamp(yesterdayOnly, {
    enabled: true,
    day: 'today',
    time: '00:10',
  });
  assert.equal(crossing.ok, true);
  if (crossing.ok) {
    assert.equal(crossing.timestamp, '今日 0:10');
    assert.equal(crossing.dividerBefore, '今日');
  }
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

test('computePlaybackDelayMs respects timeline flow, even spacing, and 40s max cap', () => {
  assert.equal(computePlaybackDelayMs(INITIAL_MESSAGES, 0, 'timeline'), 1200);
  assert.equal(computePlaybackDelayMs(INITIAL_MESSAGES, 1, 'timeline'), 2000);
  assert.equal(computePlaybackDelayMs(INITIAL_MESSAGES, 2, 'timeline'), MAX_PLAYBACK_INTERVAL_MS);
  assert.equal(computePlaybackDelayMs(INITIAL_MESSAGES, 4, 'timeline'), 1000);

  assert.equal(computePlaybackDelayMs(INITIAL_MESSAGES, 2, 'even', 3), 3000);
  assert.equal(computePlaybackDelayMs(INITIAL_MESSAGES, 2, 'even', 99), MAX_PLAYBACK_INTERVAL_MS);
  assert.equal(computePlaybackDelayMs(INITIAL_MESSAGES, 2, 'even', 0.1), 500);
});
