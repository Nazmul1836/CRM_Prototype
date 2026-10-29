const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')
const { DATA_DIR, pgCtl } = require('./db-config')

function main() {
  console.log('Resetting the local database. This deletes all local data.')

  if (fs.existsSync(DATA_DIR)) {
    if (spawnSync(pgCtl, ['status', '-D', DATA_DIR]).status === 0) {
      console.log('Stopping the running database first...')
      spawnSync(pgCtl, ['stop', '-D', DATA_DIR, '-m', 'fast', '-w'], { stdio: 'inherit' })
    }
    fs.rmSync(DATA_DIR, { recursive: true, force: true })
  }

  const init = spawnSync('node', [path.join(__dirname, 'db-init.js')], { stdio: 'inherit' })
  process.exit(init.status === 0 ? 0 : 1)
}

main()
