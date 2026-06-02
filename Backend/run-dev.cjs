/**
 * Arranque de emuladores Firebase (Windows y Linux/macOS).
 * En Windows no requiere bash/WSL.
 */
const { spawnSync } = require('child_process');
const { platform } = require('os');
const path = require('path');

const backendDir = __dirname;
const root = path.join(backendDir, '..');

function run(cmd, args, cwd = backendDir) {
  const result = spawnSync(cmd, args, { stdio: 'inherit', shell: true, cwd });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (platform() === 'win32') {
  const killScript = path.join(root, 'scripts', 'kill-emulator-ports.ps1');
  console.log('→ Liberando puertos 4000, 5001, 8080, 9199…');
  spawnSync(
    'powershell',
    ['-ExecutionPolicy', 'Bypass', '-File', killScript],
    { stdio: 'inherit', shell: true, cwd: root }
  );
  run('npm', ['run', 'build']);
  console.log('→ Iniciando emuladores: functions, firestore, storage (sin UI en puerto 4000)…');
  run(
    'firebase',
    [
      'emulators:start',
      '--only',
      'functions,firestore,storage',
      '--project',
      'campussocial-f56a0',
    ],
    root
  );
} else {
  run('bash', ['run-dev.sh'], backendDir);
}
