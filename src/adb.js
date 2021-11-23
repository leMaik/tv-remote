const { exec } = require("child_process");
const { default: prepend } = require("prepend-transform");

function runAdb(command) {
  return new Promise((resolve, reject) => {
    const child = exec(`adb ${command}`);
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

module.exports = {
  runAdb,
};
