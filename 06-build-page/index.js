const fs = require('fs');
const path = require('path');
const template = path.join(__dirname, 'template.html');
const indexFile = path.join(__dirname, 'project-dist', 'index.html');
const header = path.join(__dirname, 'components', 'header.html');
const articles = path.join(__dirname, 'components', 'articles.html');
const footer = path.join(__dirname, 'components', 'footer.html');
const styles = path.join(__dirname, 'styles');
const dist = path.join(__dirname, 'project-dist');
const assets = path.join(__dirname, 'assets');
const fonts = path.join(assets, 'fonts');
const img = path.join(assets, 'img');
const svg = path.join(assets, 'svg');

function createFolder(folder, cb) {
  fs.access(folder, fs.F_OK, (err) => {
    if (err) {
      fs.mkdir(folder, () => {
        cb && cb();
      });
    }
    cb && cb();
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

function replaceToken(file, snippetFile, token, cb) {
  fs.readFile(file, 'utf8', function (err, data) {
    streamToString(fs.createReadStream(snippetFile)).then((result) => {
      let formatted = data.replace(token, result);
      fs.writeFile(file, formatted, 'utf8', function (e) {
        if (e) return console.error(e);
        cb && cb();
      });
    });
  });
}

function copyDir(folder, newFolder) {
  fs.readdir(folder, { withFileTypes: true }, (err, files) => {
    files.forEach((file) => {
      if (file.isFile()) {
        fs.stat(path.join(folder, file.name), (e) => {
          if (e) {
            console.warn(file, `File doesn't exist.`);
          } else {
            fs.createReadStream(path.join(folder, file.name)).pipe(
              fs.createWriteStream(path.join(newFolder, file.name))
            );
          }
        });
      }
    });
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
            console.log(file, `File doesn't exist.`);
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
      fs.writeFile(newPath, updated.join('\n\r'), (e1) => {
        if (e1) throw e1;
      });
    });
  });
}

createFolder(dist, () => {
  mergeFilesToOneNew(styles, path.join(dist, 'style.css'), 'css');
  streamToString(fs.createReadStream(template)).then((result) => {
    fs.writeFile(indexFile, result, () => {
      replaceToken(indexFile, header, /{{header}}/g, () => {
        replaceToken(indexFile, articles, /{{articles}}/g, () => {
          replaceToken(indexFile, footer, /{{footer}}/g);
        });
      });
    });
  });

  createFolder(path.join(dist, 'assets'), () => {
    createFolder(path.join(dist, 'assets', 'img'), () => {
      copyDir(img, path.join(dist, 'assets', 'img'));
    });
    createFolder(path.join(dist, 'assets', 'svg'), () => {
      copyDir(svg, path.join(dist, 'assets', 'svg'));
    });
    createFolder(path.join(dist, 'assets', 'fonts'), () => {
      copyDir(fonts, path.join(dist, 'assets', 'fonts'));
    });
  });
});
