const { runAdb } = require("./adb");

async function defaultPressKey(keyCode) {
  await runAdb(`shell input keyevent ${keyCode}`);
}

async function defaultEnterText(text) {
  // TODO sanitize text
  await runAdb(`shell input text ${text}`);
}

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(() => resolve(), ms));
}

const KeyCodes = {
  UP: 19,
  DOWN: 20,
  LEFT: 21,
  RIGHT: 22,
  DPAD_CENTER: 23,
  BACK: 4,
  RED: 183,
  GREEN: 184,
  YELLOW: 185,
  BLUE: 186,
  TELETEXT: 233,
  SLEEP: 223,
  WAKEUP: 224,
  TV: 170,
  POWER: 26,
};

async function execute(
  input,
  { pressKey = defaultPressKey, enterText = defaultEnterText, macros = {} } = {}
) {
  for (const cmd of input.split(",")) {
    const match = /^((\d+)x)?(.*)$/.exec(cmd);
    const key = match[3];
    for (let i = 0; i < (match[2] || 1); i++) {
      if (key.startsWith(":")) {
        console.log(`Enter "${key.substr(1)}"`);
        await enterText(key.substr(1));
      } else if (key.startsWith("!")) {
        const macro = macros[key.substr(1)];
        console.log(`Run  ${key.substr(1)} (${macro})`);
        await execute(macro);
      } else if (key.startsWith("~")) {
        console.log(`Sleep ${key.substr(1)} seconds`);
        await sleep(parseInt(key.substr(1)) * 1000);
      } else {
        const [name, k] = Object.entries(KeyCodes).find(
          ([name, code]) =>
            code == key || name.toLowerCase().startsWith(key.toLowerCase())
        ) || [key, key];
        const sanitized = parseInt(k, 10);
        if (sanitized) {
          console.log(`Press ${name}`);
          await pressKey(sanitized);
        }
      }
    }
  }
}

module.exports = {
  KeyCodes,
  execute,
};
