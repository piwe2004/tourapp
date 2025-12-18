const fs = require('fs');
const path = require('path');

try {
  const envPath = path.resolve('.env.local');
  if (!fs.existsSync(envPath)) {
    console.log('.env.local not found');
    process.exit(1);
  }

  const data = fs.readFileSync(envPath, 'utf8');
  const lines = data.split('\n');
  
  let kmaKey = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    const [key, ...values] = trimmed.split('=');
    const val = values.join('=').trim();
    
    if (key.trim() === 'NEXT_PUBLIC_KMA_API_KEY') {
      kmaKey = val;
      break;
    }
  }

  if (kmaKey) {
    // Remove quotes if present
    const cleanKey = kmaKey.replace(/^['"](.*)['"]$/, '$1');
    console.log(`[Check] NEXT_PUBLIC_KMA_API_KEY Found.`);
    console.log(`[Check] Raw Length: ${cleanKey.length}`);
    console.log(`[Check] First 5 chars: ${cleanKey.substring(0, 5)}`);
    console.log(`[Check] Last 5 chars: ${cleanKey.substring(cleanKey.length - 5)}`);
    
    if (cleanKey.length < 50) {
      console.error(`[ERROR] Key is too short (${cleanKey.length} chars). Expected 80+ chars.`);
    } else {
      console.log(`[OK] Key length looks valid.`);
    }
  } else {
    console.error(`[ERROR] NEXT_PUBLIC_KMA_API_KEY not found in .env.local`);
  }

} catch (e) {
  console.error("Error reading file:", e.message);
}
