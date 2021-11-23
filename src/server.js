const path = require("path");
const express = require("express");
const expressWs = require("express-ws");
const mirrorTcpStream = require("../vendor/mirror-tcp-stream");
const scrcpy = require("./scrcpy-protocol");
const { execute } = require("./interpreter");

function createServer(config) {
  const app = express();
  expressWs(app);

  // ws-avc-player and its webworker
  app.use(
    "/WSAvcPlayer.js",
    express.static(path.join(require.resolve("ws-avc-player")))
  );
  app.use(
    "/Decoder.js",
    express.static(path.join(require.resolve("ws-avc-player/lib/Decoder.js")))
  );

  // remote control web ui
  app.use(express.static(path.join(__dirname, "public")));

  app.ws("/device", (ws) => {
    console.log("Client connected");

    ws.send(
      JSON.stringify({
        action: "initialize",
        payload: {
          width: config.width,
          height: config.height,
        },
      })
    );

    const stream = mirrorTcpStream({
      feed_ip: config.feedIp,
      feed_port: config.feedPort,
    });

    stream.on("data", (data) => {
      ws.send(data, { binary: true }, (err) => {
        if (err) {
          console.error(err);
        }
      });
    });

    ws.on("close", () => {
      console.log("Client disconnected");
      stream.removeAllListeners("data");
    });

    ws.on("message", (msg) => {
      console.log(msg);
      const { action, payload } = JSON.parse(msg);
      if (action === "key") {
        const key = parseInt(payload, 10);
        if (key) {
          const socket = mirrorTcpStream.getStream();
          socket.write(scrcpy.pressKey(key, true));
          socket.write(scrcpy.pressKey(key, false));
        }
      } else if (action === "run") {
        execute(payload, {
          pressKey: (key) => {
            const socket = mirrorTcpStream.getStream();
            socket.write(scrcpy.pressKey(key, true));
            socket.write(scrcpy.pressKey(key, false));
          },
          // TODO enter text via scrcpy
        });
      }
    });
  });

  return app;
}

module.exports = {
  createServer,
};
