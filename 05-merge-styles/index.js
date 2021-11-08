const fs = require('fs');
const path = require('path');
const styles = path.join(__dirname, 'styles');
const dist = path.join(__dirname, 'project-dist');
const bundle = path.join(dist, 'bundle.css');

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
    }
    removeFiles(folder);
    callback && callback();
  });
}

function streamToString(stream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
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
        fs.stat(path.join(stylesPath, file.name), (e) => {
          if (e) {
            console.warn(file, `File doesn't exist.`);
          } else {
            streamToString(
              fs.createReadStream(
                path.join(stylesPath, path.basename(file.name))
              )
            ).then((result) => {
              count++;

              updated[index] = result;
              if (count === filtered.length) {
                resolve(updated);
              }
            });
          }
        });
      });
    });
    promise.then((updated) => {
      fs.writeFile(newPath, updated.join('\n\r'), 'utf8', (e1) => {
        if (e1) throw e1;
      });
    });
  });
}

createFolder(dist, () => {
  mergeFilesToOneNew(styles, bundle, 'css');
});
