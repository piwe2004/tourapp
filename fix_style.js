const fs = require('fs');
const filePath = 'd:\\TOURAPP\\tourapp\\src\\styles\\style.scss';

try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);

    const fixedLines = lines.map((line, index) => {
        // Line 5658 is index 5657.
        if (index < 5657) return line;
        
        // Remove null bytes (\u0000)
        return line.replace(/\0/g, '');
    });

    fs.writeFileSync(filePath, fixedLines.join('\n'));
    console.log('Successfully removed null bytes from style.scss');
} catch (e) {
    console.error('Error fixing file:', e);
    process.exit(1);
}
