const fs = require('fs');
const path = require('path');
const styles = path.join(__dirname, 'styles');
const fonts = path.join('assets', 'fonts');
const img = path.join('assets', 'img');
const svg = path.join('assets', 'svg');
const dist = path.join(__dirname, 'project-dist');
const template = path.join(__dirname, 'template.html');
const indexFile = path.join(__dirname, 'project-dist', 'index.html');
const header = path.join(__dirname, 'components', 'header.html');
const articles = path.join(__dirname, 'components', 'articles.html');
const footer = path.join(__dirname, 'components', 'footer.html');

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

function copyFolder(folder) {
  fs.readdir(
    path.join(__dirname, folder),
    { withFileTypes: true },
    (err, files) => {
      files.forEach((file) => {
        if (file.isFile()) {
          fs.stat(path.join(__dirname, folder, file.name), (err, stats) => {
            if (err) {
              console.log(file, `File doesn't exist.`);
            } else {
              fs.createReadStream(path.join(__dirname, folder, file.name)).pipe(
                fs.createWriteStream(
                  path.join(__dirname, 'project-dist', folder, file.name)
                )
              );
            }
          });
        }
      });
    }
  );
}

function mergeCSS(stylesPath, newPath) {
  fs.readdir(stylesPath, { withFileTypes: true }, (err, files) => {
    files.forEach((file) => {
      if (file.isFile() && path.extname(file.name) === '.css') {
        fs.stat(path.join(stylesPath, file.name), (e) => {
          if (e) {
            console.log(file, `File doesn't exist.`);
          } else {
            streamToString(
              fs.createReadStream(
                path.join(stylesPath, path.basename(file.name))
              )
            ).then((result) => {
              fs.appendFile(newPath, result, (e1) => {
                if (e1) throw e1;
              });
            });
          }
        });
      }
    });
  });
}

createFolder(dist, () => {
  mergeCSS(styles, path.join(__dirname, 'project-dist/style.css'));
  fs.createReadStream(template).pipe(fs.createWriteStream(indexFile));
  replaceToken(indexFile, header, /{{header}}/g, () => {
    replaceToken(indexFile, articles, /{{articles}}/g, () => {
      replaceToken(indexFile, footer, /{{footer}}/g);
    });
  });
  createFolder(path.join(dist, 'assets'), () => {
    createFolder(path.join(dist, img), () => {
      copyFolder(img);
    });
    createFolder(path.join(dist, svg), () => {
      copyFolder(svg);
    });
    createFolder(path.join(dist, fonts), () => {
      copyFolder(fonts);
    });
  });
});
