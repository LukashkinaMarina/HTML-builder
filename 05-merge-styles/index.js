const fs = require('fs');
const path = require('path');
const styles = path.join(__dirname, 'styles');
const dist = path.join(__dirname, 'project-dist');
const bundle = path.join(dist, 'bundle.css');

function removeFiles(folder, excludes) {
  fs.readdir(folder, { withFileTypes: true }, (err, files) => {
    files.forEach((file) => {
      if (!excludes || (excludes && !excludes.includes(file.name))) {
        fs.unlink(path.join(folder, file.name), () => {
          //do nothing
        });
      }
    });
  });
}

function createFolder(folder, excludes, callback) {
  fs.access(folder, fs.F_OK, (err) => {
    if (err) {
      fs.mkdir(folder, () => {
        callback && callback();
      });
    } else {
      removeFiles(folder, excludes);
      callback && callback();
    }
  });
}

function readFileAsString(f) {
  const stream = fs.createReadStream(f);
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', (err) => reject(err));
    stream.on('end', () =>
      resolve(chunks.map((chunk) => chunk.toString('utf8')).join(''))
    );
  });
}

function mergeFilesToOneNew(stylesPath, newPath, extType) {
  fs.readdir(stylesPath, { withFileTypes: true }, (err, files) => {
    const promise = new Promise((resolve) => {
      let count = 0;
      let updated = [];
      const filtered = files.filter(
        (file) => file.isFile() && path.extname(file.name) === `.${extType}`
      );
      filtered.sort().forEach((file, index) => {
        readFileAsString(path.join(stylesPath, path.basename(file.name))).then(
          (result) => {
            count++;

            updated[index] = result;
            if (count === filtered.length) {
              resolve(updated);
            }
          }
        );
      });
    });
    promise.then((updated) => {
      fs.writeFile(newPath, updated.join('\n\r'), 'utf8', (e1) => {
        if (e1) throw e1;
      });
    });
  });
}

createFolder(dist, ['index.html'], () => {
  mergeFilesToOneNew(styles, bundle, 'css');
});
