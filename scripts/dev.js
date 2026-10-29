const path = require('path')
const { spawn, spawnSync } = require('child_process')

function runDbScript(script) {
  return spawnSync('node', [path.join(__dirname, script)], { stdio: 'inherit' }).status === 0
}

if (!runDbScript('db-start.js')) {
  process.exit(1)
}

const child = spawn(
  'npx',
  ['concurrently', '--kill-others', '-n', 'backend,frontend', '-c', 'blue,green', 'npm:dev:backend', 'npm:dev:frontend'],
  { stdio: 'inherit', shell: process.platform === 'win32' },
)

let stopping = false
function stopDatabaseAndExit(code) {
  if (stopping) return
  stopping = true
  runDbScript('db-stop.js')
  process.exit(code)
}

child.on('exit', (code) => stopDatabaseAndExit(code === null ? 1 : code))
process.on('SIGINT', () => {
  child.kill('SIGINT')
  stopDatabaseAndExit(0)
})
process.on('SIGTERM', () => {
  child.kill('SIGTERM')
  stopDatabaseAndExit(0)
})
