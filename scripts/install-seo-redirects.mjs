import { readFile, writeFile, copyFile, lstat, mkdir } from 'node:fs/promises';
import { resolve, basename, dirname, join, relative, isAbsolute } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

const start = '# BEGIN AVBURAK SEO';
const end = '# END AVBURAK SEO';

export function mergeRedirects(original, rules) {
  const first = original.indexOf(start);
  const last = original.indexOf(end);
  if ((first === -1) !== (last === -1) || (first !== -1 && last < first)) throw new Error('Incomplete SEO markers; inspect .htaccess manually.');
  const rest = first === -1 ? original : original.slice(0, first) + original.slice(last + end.length).replace(/^\r?\n/, '');
  return `${start}\n${rules.trim()}\n${end}\n\n${rest.replace(/^\s*\n/, '')}`;
}

async function main() {
  const targetFlag = process.argv.indexOf('--target');
  if (targetFlag < 0 || !process.argv[targetFlag + 1]) throw new Error('Provide --target /absolute/domain/document-root/.htaccess. Default is dry-run; --apply writes a backup first.');
  const target = resolve(process.argv[targetFlag + 1]);
  if (basename(target) !== '.htaccess') throw new Error('Target must be named .htaccess.');
  const existing = await lstat(target).catch((error) => { if (error.code === 'ENOENT') return null; throw error; });
  if (existing?.isSymbolicLink() || (existing && !existing.isFile())) throw new Error('Target must be an ordinary file, not a symlink or directory.');
  const original = existing ? await readFile(target, 'utf8') : '';
  const rules = await readFile(fileURLToPath(new URL('../deployment/cpanel-seo.htaccess', import.meta.url)), 'utf8');
  const merged = mergeRedirects(original, rules);
  if (!process.argv.includes('--apply')) { console.log(`DRY RUN: ${target}\n${merged}`); return; }
  if (merged === original) { console.log('Redirects already installed.'); return; }
  if (existing) {
    const backupDir = join(homedir(), '.avburak-backups');
    const fromDocumentRoot = relative(dirname(target), backupDir);
    if (!fromDocumentRoot.startsWith('..') && !isAbsolute(fromDocumentRoot)) throw new Error('Backup directory must be outside the document root.');
    await mkdir(backupDir, { recursive: true, mode: 0o700 });
    const backup = join(backupDir, `htaccess-${Date.now()}.backup`);
    await copyFile(target, backup);
    console.log(`Backup: ${backup}`);
  }
  await writeFile(target, merged, { mode: existing ? existing.mode : 0o644 });
  console.log(`Installed: ${target}. Verify redirects; restore the backup if the host applies HTTPS earlier.`);
}
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main().catch((error) => { console.error(error); process.exitCode = 1; });
}
