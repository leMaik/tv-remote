/**
 * Copied from androidmirrroing, which is licensed under the GPL v3 or later.
 * Copyright (c) 2018 vuquangtrong
 * @see https://github.com/vuquangtrong/androidmirrroing/blob/master/mirroring/lib/mirror-tcp-stream
 *
 * androidmirrroing is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * androidmirrroing is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with androidmirrroing. If not, see <http://www.gnu.org/licenses/>.
 */
const net = require("net");
const Splitter = require("stream-split");
const stream = require("stream");
const StreamConcat = require("stream-concat");

const NALseparator = new Buffer([0, 0, 0, 1]);

const headerData = {
  _waitingStream: new stream.PassThrough(),
  _firstFrames: [],
  _lastIdrFrame: null,

  set idrFrame(frame) {
    this._lastIdrFrame = frame;

    if (this._waitingStream) {
      const waitingStream = this._waitingStream;
      this._waitingStream = null;
      this.getStream().pipe(waitingStream);
    }
  },

  addParameterFrame: function (frame) {
    this._firstFrames.push(frame);
  },

  getStream: function () {
    if (this._waitingStream) {
      return this._waitingStream;
    } else {
      const headersStream = new stream.PassThrough();
      this._firstFrames.forEach((frame) => headersStream.push(frame));
      headersStream.push(this._lastIdrFrame);
      headersStream.end();
      return headersStream;
    }
  },
};

let feedStream;
let width = 1920;
let height = 1080;

// This returns the live stream only, without the parameter chunks
function getLiveStream(options) {
  // console.log(`Connecting to ${options.feed_ip}:${options.feed_port}`);
  feedStream = net.connect(options.feed_port, options.feed_ip, () => {
    console.log("Remote stream ready");
  });

  return feedStream.pipe(new Splitter(NALseparator)).pipe(
    new stream.Transform({
      transform: function (chunk, encoding, callback) {
        const chunkWithSeparator = Buffer.concat([NALseparator, chunk]);

        const chunkType = chunk[0] & 0b11111;

        // Capture the first SPS & PPS frames, so we can send stream parameters on connect.
        if (chunkType === 7 || chunkType === 8) {
          headerData.addParameterFrame(chunkWithSeparator);
          // TODO get stream width and height from sps frame with h264-sps-parser
        } else {
          // The live stream only includes the non-parameter chunks
          this.push(chunkWithSeparator);

          // Keep track of the latest IDR chunk, so we can start clients off with a near-current image
          if (chunkType === 5) {
            headerData.idrFrame = chunkWithSeparator;
          }
        }

        callback();
      },
    })
  );
}

var liveStream = null;

module.exports = function (options) {
  if (!liveStream) {
    liveStream = getLiveStream(options);
  }
  return new StreamConcat([headerData.getStream(), liveStream]);
};

module.exports.getStream = () => feedStream;
module.exports.getSize = () => ({ width, height });
