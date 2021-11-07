const fs = require("fs");
const path = require("path");
const testFolder = path.join(__dirname, "styles");
const fonts = path.join("assets", "fonts");
const img = path.join("assets", "img");
const svg = path.join("assets", "svg");
const pathFile = path.join(__dirname, "project-dist");
const template = path.join(__dirname, "template.html");
const indexFile = path.join(__dirname, "project-dist", "index.html");
const header = path.join(__dirname, "components", "header.html");
const articles = path.join(__dirname, "components", "articles.html");
const footer = path.join(__dirname, "components", "footer.html");
const bundle = path.join(__dirname, "project-dist/bundle.css");

function createFolder(folder, cb) {
  fs.access(folder, fs.F_OK, (err) => {
    if (err) {
      fs.mkdir(folder, (err) => {
        if (err) throw err;
        cb && cb();
      });
    }
  });
}

function streamToString(stream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("error", (err) => reject(err));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
}

function replaceToken(file, snippetFile, token, cb) {
  fs.readFile(file, "utf8", function (err, data) {
    streamToString(fs.createReadStream(snippetFile)).then((result) => {
      let formatted = data.replace(token, result);
      fs.writeFile(file, formatted, "utf8", function (err) {
        if (err) return console.log(err);
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
                  path.join(__dirname, "project-dist", folder, file.name)
                )
              );
            }
          });
        }
      });
    }
  );
}

createFolder(pathFile, () => {
  fs.createReadStream(template).pipe(fs.createWriteStream(indexFile));
  replaceToken(indexFile, header, /{{header}}/g, () => {
    replaceToken(indexFile, articles, /{{articles}}/g, () => {
      replaceToken(indexFile, footer, /{{footer}}/g);
    });
  });
});

fs.readdir(testFolder, { withFileTypes: true }, (err, files) => {
  files.forEach((file) => {
    if (file.isFile() && path.extname(file.name) === ".css") {
      fs.stat(`${testFolder}\\${file.name}`, (err) => {
        if (err) {
          console.log(file, `File doesn't exist.`);
        } else {
          streamToString(
            fs.createReadStream(path.join(testFolder, path.basename(file.name)))
          ).then((result) => {
            fs.appendFile(
              path.join(__dirname, "project-dist/style.css"),
              result,
              (err) => {
                if (err) throw err;
              }
            );
          });
        }
      });
    }
  });
});
createFolder(path.join(pathFile, "assets"));
createFolder(path.join(pathFile, img));
createFolder(path.join(pathFile, svg));
createFolder(path.join(pathFile, fonts));
copyFolder(fonts);
copyFolder(img);
copyFolder(svg);
