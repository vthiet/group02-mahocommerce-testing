'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const Module = require('node:module');

const projectDir = __dirname;
const specFile = '23130238_VuChauHoaiPhong_ASM7.spec.js';
const dependencyRoots = [
  projectDir,
  path.resolve(projectDir, '..', 'Test'),
  process.cwd(),
  ...(process.env.NODE_PATH || '').split(path.delimiter).filter(Boolean),
];

function findDependencies() {
  for (const root of dependencyRoots) {
    try {
      const playwrightTest = require.resolve('@playwright/test', { paths: [root] });
      const xlsx = require.resolve('xlsx', { paths: [root] });
      const cli = require.resolve('@playwright/test/cli', { paths: [root] });
      return { root, playwrightTest, xlsx, cli };
    } catch {}
  }
  return null;
}

const dependencies = findDependencies();
if (!dependencies) {
  console.error('Missing test dependencies. From this folder, install them with:');
  console.error('  npm install @playwright/test xlsx');
  console.error('  npx playwright install chromium');
  process.exit(1);
}

process.env.NODE_PATH = [
  path.join(dependencies.root, 'node_modules'),
  process.env.NODE_PATH || '',
].filter(Boolean).join(path.delimiter);
Module._initPaths();

require(path.join(projectDir, 'environment.ts'));

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'asm7-playwright-'));
const configFile = path.join(tempDir, 'playwright.config.cjs');
const config = {
  testDir: projectDir,
  testMatch: specFile,
  fullyParallel: false,
  workers: 1,
  outputDir: path.join(tempDir, 'output'),
  reporter: [
    ['list'],
    ['html', { outputFolder: path.join(projectDir, 'playwright-report'), open: 'never' }],
  ],
  use: {
    browserName: 'chromium',
    viewport: { width: 1366, height: 768 },
    locale: 'en-US',
    ignoreHTTPSErrors: true,
  },
};

try {
  fs.writeFileSync(configFile, `module.exports = ${JSON.stringify(config)};\n`);
  const result = spawnSync(
    process.execPath,
    [dependencies.cli, 'test', '--config', configFile, ...process.argv.slice(2)],
    { stdio: 'inherit', env: process.env },
  );
  if (result.error) throw result.error;
  process.exitCode = result.status === null ? 1 : result.status;
} finally {
  fs.rmSync(tempDir, { recursive: true, force: true });
}
