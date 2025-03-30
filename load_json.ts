import * as fs from 'fs';
import * as path from 'path';

function readIndexJson(filePath: string): any | null {
  try {
    // Get correct path relative to project root
    const fullPath = path.resolve(process.cwd(), filePath);
    
    // Verify file exists before reading
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found at: ${fullPath}`);
    }
    
    const data = fs.readFileSync(fullPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading index.json:', error);
    return null;
  }
}

const jsonData = readIndexJson('samples/index.json');
export const catalog = jsonData?.message?.catalog?.['bpp/providers'][0]

