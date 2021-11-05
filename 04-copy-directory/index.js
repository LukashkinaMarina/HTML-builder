const fs = require("fs");
const path = require("path");
const pathFile = path.join(__dirname, "files-copy");
const { stdout } = process;
const testFolder = path.join(__dirname, "files");
//process.on("exit", () => {

fs.access(pathFile, fs.F_OK, (err) => {
  if (err) {
    fs.mkdir(path.join(pathFile), (err) => {
      if (err) throw err;
      console.log("Папка была создана");
    });
  }
});

fs.readdir(testFolder, { withFileTypes: true }, (err, files) => {
  files.forEach((file) => {
    if (file.isFile()) {
      fs.stat(`${testFolder}\\${file.name}`, (err, stats) => {
        if (err) {
          console.log(file, `File doesn't exist.`);
        } else {
          fs.createReadStream(
            path.join(__dirname, `/files/${path.basename(file.name)}`)
          ).pipe(
            fs.createWriteStream(
              path.join(__dirname, `/files-copy/${path.basename(file.name)}`)
            )
          );
        }
      });
    }
  });
});
//});
