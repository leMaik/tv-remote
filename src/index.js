const readline = require("readline");
const { exec } = require("child_process");
const path = require("path");
const { default: prepend } = require("prepend-transform");
const { createServer } = require("./server");

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

const adb = "scrcpy.adb";

async function pressKey(keyCode) {
  await runAdb(`shell input keyevent ${parseInt(keyCode, 10)}`);
}

async function enterText(text) {
  // TODO sanitize text
  await runAdb(`shell input text ${text}`);
}

async function sleep(ms) {
  await new Promise((resolve) => setTimeout(() => resolve(), ms));
}

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

const macros = {
  tv: "26,~2,26,~3",
};

async function run(input) {
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
        await run(macro);
      } else if (key.startsWith("~")) {
        console.log(`Sleep ${key.substr(1)} seconds`);
        await sleep(parseInt(key.substr(1)) * 1000);
      } else {
        const [name, k] = Object.entries(KeyCodes).find(
          ([name, code]) =>
            code == key || name.toLowerCase().startsWith(key.toLowerCase())
        ) || [key, key];
        console.log(`Press ${name}`);
        await pressKey(k);
      }
    }
  }
}

module.exports = {
  run,
  enterText,
  pressKey,
};

/*
(async () => {
  while (true) {
    console.log(JSON.stringify(KeyCodes, null, 2));
    const input = await askQuestion("Command: ");
    console.log("");
    await run(input);
  }
})();
*/

const config = {
  width: 1920,
  height: 1080,
  deviceIp: "192.168.178.20",
  feedPort: 8091,
  feedIp: "127.0.0.1",
  hostname: "0.0.0.0",
  port: 8080,
  adb: "scrcpy.adb",
};

function runAdb(command) {
  return new Promise((resolve, reject) => {
    const child = exec(`${config.adb} ${command}`);
    child.stdout.pipe(prepend("[adb] ")).pipe(process.stdout);
    child.stderr.pipe(prepend("[adb] ")).pipe(process.stderr);
    child.on("exit", (code) => {
      if (code == 0) {
        resolve();
      } else {
        reject(code);
      }
    });
  });
}

(async () => {
  console.log(`Connecting to Android device ${config.deviceIp} ...`);
  await runAdb(`connect ${config.deviceIp}`);
  await runAdb(`forward tcp:${config.feedPort} localabstract:scrcpy`);
  await runAdb(
    `push "${path.join(
      __dirname,
      "..",
      "vendor",
      "scrcpy-server.jar"
      // "scrcpy-server-v1.20.jar"
    )}" /data/local/tmp/`
  );

  console.log("Starting scrcpy ...");
  runAdb(
    `shell CLASSPATH=/data/local/tmp/scrcpy-server.jar app_process / com.genymobile.scrcpy.Server 0 1000000 true`
    // `shell CLASSPATH=/data/local/tmp/scrcpy-server-v1.20.jar app_process / com.genymobile.scrcpy.Server 1.20 ERROR 0 1000000 0 -1 true - false true 0 false true - - false`
  ).catch((e) => {
    console.error("scrcpy error", e);
  });
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const app = createServer(config);
  app.listen(config.port, config.hostname, () => {
    console.log(
      `\nReady, please visit http://${
        config.hostname === "0.0.0.0" ? "localhost" : config.hostname
      }:${config.port} in your favorite browser`
    );
  });
})();
