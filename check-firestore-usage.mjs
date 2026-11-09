import fs from 'fs';
import path from 'path';

const SRC_DIR = './src';
const ALLOWED_DIRECT_SDK_FILES = [
  'src/utils/firestoreAudit.ts',
  'src/lib/firebase.ts',
  'src/server/yearlyResetService.ts',
];

const FORBIDDEN_CALLS = ['getDoc', 'getDocs', 'setDoc', 'updateDoc', 'deleteDoc'];

let hasError = false;

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      const normalizedPath = fullPath.replace(/\\/g, '/');
      if (ALLOWED_DIRECT_SDK_FILES.some((f) => normalizedPath.endsWith(f))) {
        continue;
      }

      const content = fs.readFileSync(fullPath, 'utf8');
      for (const call of FORBIDDEN_CALLS) {
        // Match imports from firebase/firestore of these direct calls
        const directImportRegex = new RegExp(`import\\s*\\{[^}]*\\b${call}\\b[^}]*\\}\\s*from\\s*['"]firebase/firestore['"]`, 'g');
        if (directImportRegex.test(content)) {
          console.error(`[VIOLATION] ${normalizedPath} imports raw Firestore call '${call}' from 'firebase/firestore' instead of using audit wrapper from src/utils/firestoreAudit.ts`);
          hasError = true;
        }
      }
    }
  }
}

console.log('[Firestore Usage Audit] Checking codebase for direct Firestore calls...');
scanDir(SRC_DIR);

if (hasError) {
  console.error('[Firestore Usage Audit] FAILED: Some files bypass firestoreAudit.ts!');
  process.exit(1);
} else {
  console.log('[Firestore Usage Audit] PASSED: All Firestore SDK operations properly route through audit wrapper.');
}
