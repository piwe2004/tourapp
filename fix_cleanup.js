const fs = require('fs');
const filePath = 'd:\\TOURAPP\\tourapp\\src\\styles\\style.scss';

try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);

    const fixedLines = lines.map((line, index) => {
        if (index < 5657) return line;
        
        let l = line;
        
        // Fix pseudo-selectors: : hover -> :hover
        const pseudos = [
            'hover', 'active', 'focus', 'visited', 'link', 
            'before', 'after', 'checked', 'disabled', 'enabled', 
            'first-child', 'last-child', 'nth-child', 'not', 'empty',
            'first-of-type', 'last-of-type', 'nth-of-type'
        ];
        // Regex: : space pseudo
        l = l.replace(new RegExp(`: (${pseudos.join('|')})`, 'g'), ':$1');
        
        // Fix function calls spaces: rgba ( -> rgba(
        l = l.replace(/(rgba|rgb|hsl|hsla|var|calc|url|min|max|clamp|linear-gradient|radial-gradient) \(/g, '$1(');

        // Fix 0digit -> 0 digit (e.g. 04px -> 0 4px)
        // Be careful not to break 100px. 
        // Only if preceded by space or colon?
        // space 0digit.
        // 0 is typically a standalone 0 value.
        // If we see ` 04px`.
        l = l.replace(/ 0(\d)/g, ' 0 $1');
        l = l.replace(/:0(\d)/g, ':0 $1');
        
        // Fix hex colors that got spaced? # 123456 -> #123456.
        // My previous script didn't add space after #.
        // But `solid#000` -> `solid #000`. Correct.
        // Space before #?
        // If we have `# 6ee`.
        // Hex codes.
        l = l.replace(/# ([0-9a-fA-F]{3,8})/g, '#$1');
        
        // Fix Emerald 300 etc comments?
        // //Emerald 300
        // // Emerald 300.
        l = l.replace(/\/\/([a-zA-Z])/g, '// $1');
        
        // Fix container
        // .start-page-contain er -> .start-page-container
        l = l.replace(/contain er/g, 'container');
        
        // animation:fadeIn 1.5s
        // .bgImageWrapper
        
        // fadein -> fadeIn (case sensitivity was lost?)
        // Null byte removal preserved case. 
        // My fix_spaces didn't change case.
        // But in step 66 I see `@keyframesfadein`.
        // `fadein` vs `fadeIn`.
        // The file originally had CamelCase? `fadeIn`.
        // Step 66 shows `@keyframesfadein`.
        // It seems case was preserved as lowercase?
        // Wait, `debug_char.js` showed `h` `e` `r` `o` (lowercase).
        // Was it lowercase in original corrupted text?
        // `5661: . h e r o - s e c t i o n`
        // `5689: animation: fadeIn`
        // Wait, step 66 output: `5840:       animation: fadeIn 1.5s ease-out;`
        // `5955: @keyframesfadein {`
        // It seems `fadeIn` is used but definition is `fadein`?
        // CSS animation names are case sensitive?
        // If so, `fadeIn` != `fadein`.
        // Originally `fadeIn` was probably `fadeIn`.
        // Why `fadein` in keyframes?
        // `5804: @keyframes slideUpFade` (Step 4 output).
        // `5964: @keyframesslideupfade`.
        // It seems the regex `(\S) ` -> `$1` might have been applied to `slideUpFade` -> `slideupfade`?
        // No, regex preserves match case.
        // Maybe the text WAS lowercase in the corrupted part?
        // `debug_char.js` line 5661: `. h e r o`.
        // Step 4 (original view):
        // `5661:  . h e r o - s e c t i o n {`
        // `5712:                  a n i m a t i o n :   s l i d e U p F a d e   1 s   e a s e - o u t   f o r w a r d s ;`
        // Step 66:
        // `5868:     animation: slideUpFade 1s ease-out forwards;`
        // `5964: @keyframesslideupfade {`
        // Why????
        // Maybe `keyframesslideupfade`.
        // `keyframes` is `k` `e` `y`...
        // `slideUpFade`.
        // If there was no space between `keyframes` and `slide`?
        // `@keyframes slideUpFade`.
        // If corruption removed the space?
        // `keyframes` `slide`...
        // My fix_spaces script separated `keyframes`?
        // `keyframes` is NOT in my keyword list.
        // So `keyframesslideupfade`.
        // I need to separate `@keyframes` from name.
        l = l.replace(/@keyframes([a-zA-Z])/g, '@keyframes $1');

        return l;
    });

    fs.writeFileSync(filePath, fixedLines.join('\n'));
    console.log('Successfully cleaned up style.scss');
} catch (e) {
    console.error('Error:', e);
    process.exit(1);
}
