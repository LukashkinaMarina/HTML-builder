const fs = require('fs');
const path = require('path');
const template = path.join(__dirname, 'template.html');
const indexFile = path.join(__dirname, 'project-dist', 'index.html');
const components = path.join(__dirname, 'components');
const header = path.join(__dirname, 'components', 'header.html');
const articles = path.join(__dirname, 'components', 'articles.html');
const footer = path.join(__dirname, 'components', 'footer.html');
const styles = path.join(__dirname, 'styles');
const dist = path.join(__dirname, 'project-dist');
const assets = path.join(__dirname, 'assets');
const fonts = path.join(assets, 'fonts');
const img = path.join(assets, 'img');
const svg = path.join(assets, 'svg');

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

function replaceToken(file, snippetFile, token, callback) {
  fs.readFile(file, 'utf8', function (err, data) {
    readFileAsString(snippetFile).then((result) => {
      let formatted = data.replace(token, result);
      fs.writeFile(file, formatted, 'utf8', function (e) {
        if (e) return console.error(e);
        callback && callback();
      });
    });
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

function replaceTokens(file, tokens) {
  if (!tokens || !tokens.length) return;
  const { path, regexp } = tokens.shift();
  replaceToken(file, path, regexp, () => {
    replaceTokens(file, tokens);
  });
}

createFolder(dist, () => {
  mergeFilesToOneNew(styles, path.join(dist, 'style.css'), 'css');
  readFileAsString(template).then((result) => {
    let tokens = [];
    fs.readdir(components, { withFileTypes: true }, (err, files) => {
      tokens = files.map((file) => {
        return {
          path: path.join(components, file.name),
          regexp: `{{${path
            .basename(file.name)
            .replace(path.extname(file.name), '')}}}`,
        };
      });

      fs.writeFile(indexFile, result, () => {
        replaceTokens(indexFile, tokens);
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
