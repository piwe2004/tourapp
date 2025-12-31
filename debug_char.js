const fs = require('fs');
const filePath = 'd:\\TOURAPP\\tourapp\\src\\styles\\style.scss';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split(/\r?\n/);
let lineIndex = 5660; // Line 5661
if (lines.length <= lineIndex) lineIndex = lines.length - 1;

const line = lines[lineIndex];
console.log('Line length:', line.length);
console.log('Line content:', line);

for (let i = 0; i < Math.min(line.length, 50); i++) {
   console.log(`${i}: '${line[i]}' (${line.charCodeAt(i)})`);
}
