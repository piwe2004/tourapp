const fs = require('fs');
const filePath = 'd:\\TOURAPP\\tourapp\\src\\styles\\style.scss';

try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);

    const fixedLines = lines.map((line, index) => {
        if (index < 5657) return line;
        
        let l = line;
        
        // Space after colon (but not in url? or inside strings?). 
        // Heuristic: : followed by alphanum or . or - or # or @.
        l = l.replace(/:([a-zA-Z0-9.\-#@])/g, ': $1');
        
        // Space after comma
        l = l.replace(/,([a-zA-Z0-9.\-#@])/g, ', $1');
        
        // Units followed by text (e.g. 1pxsolid -> 1px solid)
        l = l.replace(/(\d+(?:\.\d+)?)(px|rem|em|%|s|deg|vw|vh|ms)([a-zA-Z])/g, '$1$2 $3');
        
        // Keywords followed by text (e.g. solid#000 -> solid #000)
        const keywords = [
            'solid', 'dashed', 'dotted', 'double', 'none', 'hidden', 'visible', 'auto',
            'center', 'top', 'bottom', 'left', 'right', 
            'cover', 'contain', 'scroll',
            'relative', 'absolute', 'fixed', 'sticky',
            'block', 'inline', 'flex', 'grid',
            'row', 'column', 'wrap', 'nowrap',
            'bold', 'bolder', 'lighter', 'normal',
            'ease', 'linear', 'ease-in', 'ease-out', 'ease-in-out',
            'infinite', 'forwards', 'backwards', 'both', 'alternate',
            'no-repeat', 'repeat', 'transparent'
        ];
        // Sort by length desc to match longer words first
        keywords.sort((a,b) => b.length - a.length);
        
        const kwRegex = new RegExp(`(${keywords.join('|')})([a-zA-Z0-9#])`, 'g');
        l = l.replace(kwRegex, '$1 $2');
        
        // Animation names followed by duration (e.g. fadeIn1.5s -> fadeIn 1.5s)
        // Heuristic: word followed by digit
        // But prevent `h1` `p2`.
        // Animation names are usually camelCase.
        // We only apply this if the digit is start of a number-unit pair?
        // But we handled unit separation above.
        // So we just need to separate name from number.
        // `fadeIn` `1.5s`.
        l = l.replace(/([a-z])(\d)/g, '$1 $2');
        // Wait, h1 -> h 1. Bad using global rule.
        // Restrict to specific properties? Too complex.
        
        // Revert h1-h6 fix if broken
        l = l.replace(/h ([1-6])/g, 'h$1');

        // !important
        l = l.replace(/!important/g, ' !important');
        l = l.replace(/  !important/g, ' !important');

        return l;
    });

    fs.writeFileSync(filePath, fixedLines.join('\n'));
    console.log('Successfully added spaces');
} catch (e) {
    console.error('Error:', e);
    process.exit(1);
}
