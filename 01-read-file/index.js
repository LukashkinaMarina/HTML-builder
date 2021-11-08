const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'text.txt');

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

readFileAsString(file).then((result) => {
  console.log(result);
});
