const fs = require('fs')
const { spawnSync } = require('child_process')
const { DATA_DIR, LOG_FILE, pgCtl } = require('./db-config')

function main() {
  if (!fs.existsSync(DATA_DIR)) {
    console.log('No local database to stop.')
    return
  }

  if (spawnSync(pgCtl, ['status', '-D', DATA_DIR]).status !== 0) {
    console.log('Local database is not running.')
    return
  }

  console.log('Stopping the local database...')
  const result = spawnSync(pgCtl, ['stop', '-D', DATA_DIR, '-m', 'fast', '-w'], { stdio: 'inherit' })
  if (result.status !== 0) {
    console.error(`Could not stop the local database cleanly. Check ${LOG_FILE} for details.`)
    process.exit(1)
  }
  console.log('Local database stopped.')
}

main()
