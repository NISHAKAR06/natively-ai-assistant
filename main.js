const fs = require('fs');
const path = require('path');

const distMain = path.join(__dirname, 'dist-electron', 'electron', 'main.js');

if (fs.existsSync(distMain)) {
  require(distMain);
} else {
  console.log('[Electron] dist-electron/electron/main.js not found. Compiling Electron backend...');
  const { execSync } = require('child_process');
  try {
    execSync('node scripts/build-electron.js', { stdio: 'inherit', cwd: __dirname });
    require(distMain);
  } catch (err) {
    console.error('[Electron] Failed to build electron main process:', err);
    try {
      const { dialog, app } = require('electron');
      dialog.showErrorBox(
        'Build Required',
        'Unable to launch app: dist-electron/electron/main.js was not found and automatic compilation failed.\nPlease run: npm run build:electron'
      );
      app.quit();
    } catch {
      process.exit(1);
    }
  }
}

