const fs = require('fs');
const path = require('path');
const original = path.join(__dirname, 'files');
const copy = path.join(__dirname, 'files-copy');

function removeFiles(folder) {
  fs.readdir(folder, { withFileTypes: true }, (err, files) => {
    files.forEach((file) => {
      fs.unlink(path.join(folder, file.name), () => {
        //do nothing
      });
    });
  });
}

function createFolder(folder, callback) {
  fs.access(folder, fs.F_OK, (err) => {
    if (err) {
      fs.mkdir(folder, () => {
        callback && callback();
      });
    } else {
      removeFiles(folder);
      callback && callback();
    }
  });
}

function copyDir(folder, newFolder) {
  fs.readdir(folder, { withFileTypes: true }, (err, files) => {
    files.forEach((file) => {
      if (file.isFile()) {
        fs.createReadStream(path.join(folder, file.name)).pipe(
          fs.createWriteStream(path.join(newFolder, file.name))
        );
      }
    });
  });
}

createFolder(copy, () => {
  copyDir(original, copy);
});
