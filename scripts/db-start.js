const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')
const { BIN_DIR, DATA_DIR, LOG_FILE, pgCtl } = require('./db-config')

function status() {
  return spawnSync(pgCtl, ['status', '-D', DATA_DIR]).status
}

function start() {
  return spawnSync(pgCtl, ['start', '-D', DATA_DIR, '-l', LOG_FILE, '-w', '-t', '30'], { stdio: 'inherit' }).status === 0
}

function main() {
  if (!fs.existsSync(BIN_DIR) || !fs.existsSync(DATA_DIR)) {
    console.error('The local database has not been set up yet. Run "npm run db:init" first.')
    process.exit(1)
  }

  if (status() === 0) {
    console.log('Local database is already running, reusing it.')
    return
  }

  console.log('Starting the local database...')
  if (start()) {
    console.log('Local database started.')
    return
  }

  // A crash can leave a stale lock file behind. If the server genuinely isn't running,
  // clear it and try once more before giving up.
  console.warn('Start failed, which can happen after a crash left a stale lock file. Retrying...')
  const staleLock = path.join(DATA_DIR, 'postmaster.pid')
  if (fs.existsSync(staleLock) && status() !== 0) {
    fs.unlinkSync(staleLock)
  }

  if (start()) {
    console.log('Local database started.')
    return
  }

  console.error(`Could not start the local database. Check ${LOG_FILE} for details.`)
  process.exit(1)
}

main()
