const path = require("path");
const { runAdb } = require("./adb");
const { createServer } = require("./server");

const config = {
  width: 1920,
  height: 1080,
  deviceIp: "192.168.178.20",
  feedPort: 8091,
  feedIp: "127.0.0.1",
  hostname: "0.0.0.0",
  port: 8080,
};

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
