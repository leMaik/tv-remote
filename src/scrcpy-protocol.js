const INJECT_KEYCODE = 0;

const KEY_EVENT_ACTION_DOWN = 0;
const KEY_EVENT_ACTION_UP = 1;

function pressKey(keyCode, down) {
  const buffer = Buffer.alloc(10, 0);
  buffer.writeUInt8(INJECT_KEYCODE, 0);
  buffer.writeUInt8(down ? KEY_EVENT_ACTION_DOWN : KEY_EVENT_ACTION_UP, 1);
  buffer.writeInt32BE(keyCode, 2); // keyCode
  return buffer;
}

module.exports = {
  pressKey,
};
