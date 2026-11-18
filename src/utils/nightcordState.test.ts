import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_MESSAGES,
  INITIAL_VOICE_MEMBERS,
  appendInputToken,
  createOutgoingMessage,
  formatJapaneseTime,
  invokeAction,
  toggleMemberMute,
} from './nightcordState';

test('initial Japanese messages and voice members match reference', () => {
  assert.equal(INITIAL_VOICE_MEMBERS.length, 4);
  assert.deepEqual(
    INITIAL_VOICE_MEMBERS.map((m) => m.name),
    ['K', '雪', 'えななん', 'Amia']
  );
  assert.equal(INITIAL_MESSAGES.length, 8);
  assert.equal(INITIAL_MESSAGES[7].dividerBefore, '今日');
  assert.equal(INITIAL_MESSAGES[7].attachments?.length, 2);
});

test('createOutgoingMessage trims input and rejects empty text', () => {
  assert.equal(createOutgoingMessage('   '), null);
  const fixedDate = new Date(2026, 10, 18, 1, 5);
  const msg = createOutgoingMessage('  おつかれ  ', fixedDate);
  assert.ok(msg);
  assert.equal(msg.username, 'K');
  assert.equal(msg.avatar, 'k');
  assert.equal(msg.text, 'おつかれ');
  assert.equal(msg.timestamp, formatJapaneseTime(fixedDate));
  assert.equal(msg.timestamp, '今日 1:05');
});

test('toggleMemberMute toggles only the targeted member', () => {
  const first = toggleMemberMute(INITIAL_VOICE_MEMBERS, 'k');
  assert.ok(first.updated);
  assert.equal(first.updated.muted, true);
  assert.equal(first.members[0].muted, true);
  assert.equal(first.members[1].muted, false);

  const second = toggleMemberMute(first.members, 'k');
  assert.equal(second.updated?.muted, false);
});

test('appendInputToken appends tokens cleanly', () => {
  assert.equal(appendInputToken('', '@えななん '), '@えななん ');
  assert.equal(appendInputToken('了解', '♪'), '了解♪');
});

test('invokeAction dispatches registered callbacks and ignores missing ones', () => {
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
  assert.equal(invokeAction({}, 'onWindowClose'), false);
});
