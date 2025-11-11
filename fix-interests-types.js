const fs = require('fs');
const filePath = './app/api/interests/route.ts';

let content = fs.readFileSync(filePath, 'utf8');

// Fix the type errors
content = content.replace(
  'let sentInterests = []',
  'let sentInterests: any[] = []'
);
content = content.replace(
  'let receivedInterests = []',
  'let receivedInterests: any[] = []'
);

fs.writeFileSync(filePath, content);
console.log('✅ Fixed TypeScript errors in interests route');
