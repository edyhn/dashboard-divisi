import { execSync } from 'node:child_process';

const MIN_NODE_MAJOR = 22;

function getMajor(version) {
  return Number(version.split('.')[0]);
}

function runCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

const failures = [];

const nodeVersion = process.version.replace(/^v/, '');
console.log(`node : ${nodeVersion}`);
if (getMajor(nodeVersion) < MIN_NODE_MAJOR) {
  failures.push(`Node.js >= ${MIN_NODE_MAJOR} diperlukan`);
}

const pnpmVersion = runCommand('pnpm --version');
console.log(`pnpm : ${pnpmVersion ?? 'tidak ditemukan'}`);
if (!pnpmVersion) {
  failures.push('pnpm tidak tersedia di PATH');
}

if (failures.length > 0) {
  console.error(failures.map((f) => `- ${f}`).join('\n'));
  process.exit(1);
}

console.log('environment siap');
