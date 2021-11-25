const { exec } = require("child_process");
const { default: prepend } = require("prepend-transform");

function runAdb(command) {
  return new Promise((resolve, reject) => {
    const child = exec(`adb ${command}`);
    let errors = "";
    child.stderr.on("data", (chunk) => (errors += chunk.toString()));
    child.on("exit", (code) => {
      if (code == 0) {
        resolve();
      } else {
        reject(
          new Error(
            `'adb ${command}' failed with exit code ${code}\n\n${errors}`
          )
        );
      }
    });
  });
}

module.exports = {
  runAdb,
};
