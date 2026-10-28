#!/usr/bin/env node
const electron = require('electron');
const { spawn } = require('child_process');
const path = require('path');

// Guarantee that ELECTRON_RUN_AS_NODE is stripped from child environment
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

const appDir = path.resolve(__dirname, '..');
const args = [appDir, ...process.argv.slice(2)];

const child = spawn(electron, args, {
  stdio: 'inherit',
  env,
  windowsHide: false,
});

child.on('error', (err) => {
  console.error('[launch-electron] Failed to launch electron:', err);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
