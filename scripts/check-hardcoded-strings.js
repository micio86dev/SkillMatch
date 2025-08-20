#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Files and directories to ignore
const IGNORE_PATTERNS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.replit',
  '__pycache__',
  '.pytest_cache',
  'scripts/check-hardcoded-strings.js', // ignore self
  '.env',
  'package-lock.json',
  'package.json',
  'tsconfig.json',
  'vite.config.ts',
  'tailwind.config.ts',
  'drizzle.config.ts',
  '.gitignore',
  'README.md',
  'replit.md'
];

// File extensions to check
const FILE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// Patterns to look for hardcoded strings (but exclude certain cases)
const STRING_PATTERNS = [
  // Double quoted strings
  /"[^"]*\w+[^"]*"/g,
  // Single quoted strings  
  /'[^']*\w+[^']*'/g,
  // Template literals with meaningful content
  /`[^`]*\w+[^`]*`/g
];

// Patterns to exclude (things that should NOT be considered hardcoded strings)
const EXCLUDE_PATTERNS = [
  // Translation keys and function calls
  /t\(["'`][^"'`]+["'`]\)/g,
  /\$\{t\(["'`][^"'`]+["'`]\)\}/g,
  /useTranslation\(\)/g,
  
  // Import/export statements
  /import\s+.*from\s+["'][^"']+["']/g,
  /export\s+.*from\s+["'][^"']+["']/g,
  /import\(["'][^"']+["']\)/g,
  
  // CSS class names and IDs
  /className\s*=\s*["'][^"']*["']/g,
  /class\s*=\s*["'][^"']*["']/g,
  /id\s*=\s*["'][^"']*["']/g,
  
  // URLs, paths, and technical strings
  /https?:\/\/[^\s"'`]+/g,
  /\/[^\s"'`]*\/[^\s"'`]*/g, // file paths
  /\.[a-zA-Z]+$/g, // file extensions
  
  // HTML attributes
  /type\s*=\s*["'][^"']+["']/g,
  /name\s*=\s*["'][^"']+["']/g,
  /value\s*=\s*["'][^"']+["']/g,
  /href\s*=\s*["'][^"']+["']/g,
  /src\s*=\s*["'][^"']+["']/g,
  /alt\s*=\s*["'][^"']+["']/g,
  /placeholder\s*=\s*["'][^"']+["']/g,
  
  // Object keys and properties
  /{\s*["'][^"']+["']\s*:/g,
  /\[\s*["'][^"']+["']\s*\]/g,
  
  // Console and debug statements
  /console\.(log|error|warn|info)\([^)]+\)/g,
  
  // Environment variables
  /process\.env\.[A-Z_]+/g,
  /import\.meta\.env\.[A-Z_]+/g,
  
  // API endpoints and routes
  /\/api\/[^\s"'`]+/g,
  
  // Color codes and CSS values
  /#[0-9a-fA-F]{3,6}/g,
  /\d+px/g,
  /\d+rem/g,
  /\d+em/g,
  /\d+%/g,
  
  // Technical/enum values
  /["'][a-z_]+["']/g, // likely enum values like 'open', 'closed', etc.
  
  // Icon names
  /lucide-react/g,
  /react-icons/g,
  
  // Short technical strings (likely not user-facing)
  /["'][a-zA-Z]{1,3}["']/g, // 1-3 char strings
  
  // Email patterns
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  
  // UUID patterns
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
  
  // Version numbers
  /\d+\.\d+\.\d+/g,
  
  // Date formats
  /\d{4}-\d{2}-\d{2}/g,
  
  // Query keys for React Query
  /\[["'][^"']*\/api\/[^"']*["']\]/g,
  
  // Component props that are technical
  /variant\s*=\s*["'][^"']+["']/g,
  /size\s*=\s*["'][^"']+["']/g,
  
  // Form field names
  /register\(["'][^"']+["']\)/g,
];

// Words that are likely user-facing and should be translated
const USER_FACING_INDICATORS = [
  // Action words
  'submit', 'save', 'delete', 'cancel', 'edit', 'update', 'create', 'add', 'remove', 
  'login', 'logout', 'signin', 'signup', 'register',
  
  // Status words
  'loading', 'error', 'success', 'failed', 'complete', 'pending', 'active', 'inactive',
  
  // UI elements
  'button', 'menu', 'modal', 'dialog', 'form', 'input', 'select', 'option',
  'search', 'filter', 'sort', 'view', 'show', 'hide',
  
  // Common phrases
  'welcome', 'hello', 'goodbye', 'thanks', 'please', 'sorry',
  'yes', 'no', 'ok', 'confirm', 'continue', 'back', 'next', 'previous',
  
  // Content words
  'title', 'description', 'content', 'message', 'comment', 'post', 'article',
  'name', 'email', 'password', 'username', 'profile', 'account',
  
  // Navigation
  'home', 'about', 'contact', 'help', 'settings', 'dashboard', 'profile',
  'projects', 'companies', 'professionals', 'messages',
  
  // Time/Date
  'today', 'yesterday', 'tomorrow', 'week', 'month', 'year', 'date', 'time',
  
  // Numbers and quantities
  'first', 'second', 'third', 'last', 'total', 'count', 'number', 'amount',
];

function shouldIgnorePath(filePath) {
  return IGNORE_PATTERNS.some(pattern => filePath.includes(pattern));
}

function hasUserFacingContent(str) {
  const cleanStr = str.toLowerCase().replace(/[^a-z\s]/g, ' ');
  return USER_FACING_INDICATORS.some(indicator => 
    cleanStr.includes(indicator) || 
    cleanStr.split(' ').some(word => word === indicator)
  );
}

function extractStrings(content) {
  const strings = [];
  
  STRING_PATTERNS.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const str = match[0];
      
      // Skip if it matches any exclude pattern
      let shouldExclude = false;
      for (const excludePattern of EXCLUDE_PATTERNS) {
        if (excludePattern.test(str)) {
          shouldExclude = true;
          break;
        }
      }
      
      if (shouldExclude) continue;
      
      // Skip if it doesn't seem user-facing
      if (!hasUserFacingContent(str)) continue;
      
      // Skip very short strings
      const cleanedStr = str.replace(/["'`]/g, '');
      if (cleanedStr.length < 2) continue;
      
      // Skip strings that are only numbers or special chars
      if (!/[a-zA-Z]/.test(cleanedStr)) continue;
      
      strings.push({
        string: str,
        cleaned: cleanedStr
      });
    }
  });
  
  return strings;
}

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const strings = extractStrings(content);
    
    if (strings.length > 0) {
      return {
        file: filePath,
        strings: strings
      };
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
  }
  
  return null;
}

function scanDirectory(dir) {
  const results = [];
  
  try {
    const entries = fs.readdirSync(dir);
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      
      if (shouldIgnorePath(fullPath)) continue;
      
      const stats = fs.statSync(fullPath);
      
      if (stats.isDirectory()) {
        results.push(...scanDirectory(fullPath));
      } else if (stats.isFile() && FILE_EXTENSIONS.some(ext => fullPath.endsWith(ext))) {
        const result = scanFile(fullPath);
        if (result) {
          results.push(result);
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error.message);
  }
  
  return results;
}

function main() {
  console.log('🔍 Scanning for hardcoded strings...');
  console.log('');
  
  const clientResults = scanDirectory('./client/src');
  const serverResults = scanDirectory('./server');
  const sharedResults = scanDirectory('./shared');
  
  const allResults = [...clientResults, ...serverResults, ...sharedResults];
  
  if (allResults.length === 0) {
    console.log('✅ No hardcoded strings found! All strings appear to be properly internationalized.');
    process.exit(0);
  }
  
  console.log(`❌ Found ${allResults.length} files with potential hardcoded strings:`);
  console.log('');
  
  let totalStrings = 0;
  
  allResults.forEach(result => {
    console.log(`📄 ${result.file}`);
    result.strings.forEach(({ string, cleaned }) => {
      console.log(`   • ${string}`);
      totalStrings++;
    });
    console.log('');
  });
  
  console.log(`💡 Total: ${totalStrings} potential hardcoded strings in ${allResults.length} files`);
  console.log('');
  console.log('Please review these strings and wrap user-facing text with t() function calls.');
  console.log('Remember: Technical strings (IDs, classes, enums) don\'t need translation.');
  
  process.exit(1);
}

// Run the script
main();