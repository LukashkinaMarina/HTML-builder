const fs = require("fs");
const path = require("path");
const { stdout } = process;
const { readdir } = require("fs").promises;

const testFolder = path.join(__dirname, "secret-folder");

fs.readdir(testFolder, { withFileTypes: true }, (err, files) => {
  files.forEach((file) => {
    if (file.isFile()) {
      fs.stat(`${testFolder}\\${file.name}`, (err, stats) => {
        if (err) {
          console.log(file, `File doesn't exist.`);
        } else {
          console.log(
            `${path
              .basename(file.name)
              .replace(path.extname(file.name), "")} - ${path
              .extname(file.name)
              .slice(1)} - ${Math.ceil(stats.size / 1024)}kb`
          );
        }
      });
    }
  });
});
