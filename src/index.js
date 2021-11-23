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
  const { Listr } = require("listr2");
  const tasks = new Listr(
    [
      {
        title: "Start scrcpy",
        task: (ctx, task) =>
          task.newListr(
            [
              {
                title: "Connect to device",
                task: async (ctx, task) => {
                  await runAdb(
                    `connect ${config.deviceIp}`,
                    task.stdout(),
                    task.stdout()
                  );
                },
              },
              {
                title: "Forward screen stream port",
                task: async (ctx, task) => {
                  await runAdb(
                    `forward tcp:${config.feedPort} localabstract:scrcpy`,
                    task.stdout(),
                    task.stdout()
                  );
                },
              },
              {
                title: "Push scrcpy to device",
                task: async (ctx, task) => {
                  await runAdb(
                    `push "${path.join(
                      __dirname,
                      "..",
                      "vendor",
                      "scrcpy-server.jar"
                      // "scrcpy-server-v1.20.jar"
                    )}" /data/local/tmp/`,
                    task.stdout(),
                    task.stdout()
                  );
                },
              },
              {
                title: "Start scrcpy",
                task: async () => {
                  runAdb(
                    `shell CLASSPATH=/data/local/tmp/scrcpy-server.jar app_process / com.genymobile.scrcpy.Server 0 1000000 true`
                    // `shell CLASSPATH=/data/local/tmp/scrcpy-server-v1.20.jar app_process / com.genymobile.scrcpy.Server 1.20 ERROR 0 1000000 0 -1 true - false true 0 false true - - false`
                  ).catch((e) => {
                    console.error("scrcpy error", e);
                  });
                  await new Promise((resolve) => setTimeout(resolve, 1000));
                },
              },
            ],
            { concurrent: false, exitOnError: true }
          ),
      },
      {
        title: "Start server",
        task: async (ctx, task) => {
          const app = createServer(config);
          await new Promise((resolve, reject) => {
            app.listen(config.port, config.hostname, (err) => {
              if (err) {
                reject(err);
                return;
              }
              resolve();
            });
          });
          task.output = `http://${
            config.hostname === "0.0.0.0" ? "localhost" : config.hostname
          }:${config.port}`;
        },
        options: { persistentOutput: true },
      },
      {
        title: "Create tunnel",
        skip: (ctx) => !ctx.localtunnel,
        task: async (ctx, task) => {
          const localtunnel = require("localtunnel");
          const tunnel = await localtunnel({ port: config.port });
          task.output = tunnel.url;
        },
        options: { persistentOutput: true },
      },
    ],
    {
      concurrent: true,
      exitOnError: true,
      registerSignalListeners: false,
    }
  );

  try {
    await tasks.run({
      localtunnel: process.env.LOCALTUNNEL === "true",
    });
  } catch (e) {
    process.exit(-1);
  }
})();
