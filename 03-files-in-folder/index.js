const fs = require('fs');
const path = require('path');
const testFolder = path.join(__dirname, 'secret-folder');

fs.readdir(testFolder, { withFileTypes: true }, (err, files) => {
  files.forEach((file) => {
    if (file.isFile()) {
      fs.stat(path.join(testFolder, file.name), (e, stats) => {
        if (e) {
          console.log(file, `File doesn't exist.`);
        } else {
          console.log(
            `${path
              .basename(file.name)
              .replace(path.extname(file.name), '')} - ${path
              .extname(file.name)
              .slice(1)} - ${(stats.size / 1024).toFixed(3)}kb`
          );
        }
      });
    }
  });
});
