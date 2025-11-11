const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

pkg.scripts.postinstall = 'prisma generate';

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log('✅ Added postinstall script');
