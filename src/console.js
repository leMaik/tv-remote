const readline = require("readline");
const { KeyCodes, execute } = require("./interpreter");

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

(async () => {
  while (true) {
    console.log(JSON.stringify(KeyCodes, null, 2));
    const input = await askQuestion("Command: ");
    console.log("");
    await execute(input);
  }
})();
