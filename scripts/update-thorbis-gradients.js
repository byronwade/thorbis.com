import fs from 'fs';
import path from 'path';

const filePath = 'src/components/store/ThorbisStyleProductShowcase.js';

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Replace gradient patterns with solid colors
const replacements = [
  // Replace bg-gradient-to-r with bg-
  { from: /bg-gradient-to-r \${feature\.color}/g, to: 'bg-${feature.color}' },
  // Replace bg-gradient-to-r with bg- for item.color
  { from: /bg-gradient-to-r \${item\.color}/g, to: 'bg-${item.color}' },
  // Replace bg-clip-text text-transparent with text-
  { from: /bg-gradient-to-r \${feature\.color} bg-clip-text text-transparent/g, to: 'text-${feature.color}' },
  { from: /bg-gradient-to-r \${item\.color} bg-clip-text text-transparent/g, to: 'text-${item.color}' },
  // Replace specific gradient patterns
  { from: /bg-gradient-to-br \${item\.color}/g, to: 'bg-${item.color}' },
  { from: /bg-gradient-to-b from-gray-800 to-gray-600/g, to: 'bg-muted' },
  // Replace any remaining gradient patterns
  { from: /bg-gradient-to-[a-z]+ \${[^}]+}/g, to: 'bg-primary' },
];

// Apply replacements
replacements.forEach(({ from, to }) => {
  content = content.replace(from, to);
});

// Write back to file
fs.writeFileSync(filePath, content, 'utf8');

console.log('Updated ThorbisStyleProductShowcase.js - removed gradients');
