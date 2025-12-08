const fs = require('fs');
try {
  const data = fs.readFileSync('.env.local', 'utf8');
  const lines = data.split('\n');
  const keys = lines.map(line => line.split('=')[0].trim()).filter(k => k && !k.startsWith('#'));
  console.log('Keys in .env.local:', keys);
} catch (e) {
  console.error(e.message);
}
