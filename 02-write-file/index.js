const fs = require('fs');
const path = require('path');
const fileName = 'new.txt';
const { stdin, stdout } = process;
const file = path.join(__dirname, fileName);
const farewell = 'Buy!';
stdout.write('Enter text:\n');

function exit() {
  stdout.write(farewell);
  process.exit();
}

function checkExit(data) {
  if (data.toString().trim() === 'exit') {
    updateFile(file, () => {
      exit();
    });
  }
}

function updateFile(f, callback) {
  fs.access(f, fs.F_OK, (err) => {
    if (err) {
      fs.writeFile(f, '', (e1) => {
        if (e1) throw e1;
        callback && callback();
      });
    } else {
      callback && callback();
    }
  });
}

stdin.on('data', (data) => {
  updateFile(file, () => {
    checkExit(data);
    fs.appendFile(file, data, (e) => {
      if (e) throw e;
    });
  });
});

process.on('SIGINT', function () {
  updateFile(file, () => {
    exit();
  });
});
