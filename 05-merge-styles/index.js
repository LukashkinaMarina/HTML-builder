const fs = require("fs");
const path = require("path");
const testFolder = path.join(__dirname, "styles");
const pathFile = path.join(__dirname, "project-dist/bundle.css");

function streamToString(stream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("error", (err) => reject(err));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
  });
}

fs.access(pathFile, fs.F_OK, (err) => {
  if (err) {
    fs.writeFile(
      path.join(__dirname, "project-dist/bundle.css"),
      "Hello world",
      (err) => {
        console.log("Файл был создан");
      }
    );
  }
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
              path.join(__dirname, "project-dist/bundle.css"),
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
