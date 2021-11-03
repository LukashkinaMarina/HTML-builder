const fs = require("fs");
const path = require("path");
const fileName = "new.txt";
const { exit } = require("process");
const { stdin, stdout } = process;
const file = path.join(__dirname, fileName);
let fileExists = false;
stdout.write("enter text\n");

stdin.on("data", (data) => {
  fs.access(file, fs.F_OK, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    fileExists = true;
    if (data !== "exit") {
      fs.appendFile(file, data, (err) => {
        if (err) throw err;
      });
    } else {
      process.stdin.resume();
    }
  });
  if (!fileExists) {
    fs.writeFile(file, data, (err) => {
      if (err) throw err;
    });
  }
});

process.on("SIGINT", function () {
  stdout.write("Buy!");
  process.exit();
});
