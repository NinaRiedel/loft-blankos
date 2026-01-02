import { readFileSync } from 'fs';

const encodings: BufferEncoding[] = [
  'utf-8',
  'latin1',
  'ascii',
  'utf16le',
  'ucs2',
];

async function detectEncoding(filePath: string) {
  const buffer = readFileSync(filePath);
  const firstLine = buffer.toString('utf-8').split('\n')[0];
  
  console.log('Testing different encodings for:', filePath);
  console.log('First line (UTF-8):', firstLine);
  console.log('\n--- Testing encodings ---\n');

  for (const encoding of encodings) {
    try {
      const content = buffer.toString(encoding as BufferEncoding);
      const lines = content.split('\n').slice(0, 3);
      
      // Look for the problematic line with "Tribüne"
      const tribuneLine = lines.find(line => line.includes('Trib') || line.includes('Reihe'));
      
      if (tribuneLine) {
        console.log(`\n${encoding.toUpperCase()}:`);
        console.log(`  Sample: ${tribuneLine.substring(0, 80)}`);
        
        // Show the actual bytes for the "ü" character area
        const match = tribuneLine.match(/Trib[^\s]+/);
        if (match) {
          console.log(`  "Tribüne" area: "${match[0]}"`);
          // Show hex representation
          const hex = Buffer.from(match[0], encoding as BufferEncoding).toString('hex');
          console.log(`  Hex: ${hex}`);
        }
      }
    } catch (error) {
      console.log(`\n${encoding.toUpperCase()}: ERROR - ${error}`);
    }
  }
  
  // Also try Windows-1252 if iconv-lite is available
  try {
    const iconv = await import('iconv-lite');
    const win1252 = iconv.decode(buffer, 'win1252');
    const lines = win1252.split('\n').slice(0, 3);
    const tribuneLine = lines.find(line => line.includes('Trib') || line.includes('Reihe'));
    
    if (tribuneLine) {
      console.log(`\nWindows-1252 (via iconv-lite):`);
      console.log(`  Sample: ${tribuneLine.substring(0, 80)}`);
      const match = tribuneLine.match(/Trib[^\s]+/);
      if (match) {
        console.log(`  "Tribüne" area: "${match[0]}"`);
      }
    }
  } catch (error) {
    console.log('\nWindows-1252: iconv-lite not available');
  }
}

const filePath = process.argv[2] || 'ohne_export.txt';
detectEncoding(filePath).catch(console.error);

