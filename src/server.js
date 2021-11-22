const path = require("path");
const express = require("express");
const expressWs = require("express-ws");
const mirrorTcpStream = require("../vendor/mirror-tcp-stream");

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
        const pressKeyMsg = (code, down) => {
          const buffer = Buffer.alloc(10, 0);
          buffer.writeUInt8(0, 0); // INJECT_KEYCODE
          buffer.writeUInt8(down ? 0 : 1, 1); // AKEY_EVENT_ACTION_UP
          buffer.writeInt32BE(code, 2); // keyCode
          return buffer;
        };
        const key = parseInt(payload, 10);
        if (key) {
          const socket = mirrorTcpStream.getStream();
          socket.write(pressKeyMsg(key, true), "binary");
          socket.write(pressKeyMsg(key, false), "binary");
        }
      } else if (action === "run") {
        const { run } = require("./index");
        run(payload);
      }
    });
  });

  return app;
}

module.exports = {
  createServer,
};
