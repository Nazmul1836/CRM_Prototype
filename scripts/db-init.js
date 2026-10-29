const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')
const {
  PGSQL_DIR,
  BIN_DIR,
  DATA_DIR,
  LOG_FILE,
  PORT,
  DB_NAME,
  SUPERUSER,
  pgCtl,
  psql,
  createdb,
  initdb,
} = require('./db-config')

function run(cmd, args) {
  return spawnSync(cmd, args, { stdio: 'inherit' }).status === 0
}

function ensureBinariesPresent() {
  if (fs.existsSync(BIN_DIR)) {
    return true
  }
  console.error(`Portable PostgreSQL was not found at ${PGSQL_DIR}.`)
  console.error('Download the official "no installer" zip (ask before fetching it if you have not already):')
  console.error('  File:   postgresql-17.11-5-windows-x64-binaries.zip')
  console.error('  Source: https://get.enterprisedb.com/postgresql/postgresql-17.11-5-windows-x64-binaries.zip')
  console.error('  Size:   ~364 MB')
  console.error(`Unzip it so that ${path.join(BIN_DIR, 'postgres.exe')} exists, then run "npm run db:init" again.`)
  return false
}

function createCluster() {
  if (fs.existsSync(DATA_DIR)) {
    console.log('Local database cluster already exists, skipping initdb.')
    return true
  }

  console.log('Creating the local database cluster...')
  fs.mkdirSync(path.dirname(DATA_DIR), { recursive: true })
  if (!run(initdb, ['-D', DATA_DIR, '-U', SUPERUSER, '-A', 'trust', '--locale=C', '--encoding=UTF8'])) {
    console.error('initdb failed.')
    return false
  }

  const confPath = path.join(DATA_DIR, 'postgresql.conf')
  let conf = fs.readFileSync(confPath, 'utf8')
  // Accept connections only from this machine (no password is set), on a fixed, non-default port.
  conf = conf.replace(/#?listen_addresses = 'localhost'.*/, "listen_addresses = 'localhost'")
  conf = conf.replace(/#?port = 5432.*/, `port = ${PORT}`)
  fs.writeFileSync(confPath, conf)
  return true
}

function ensureDatabaseExists() {
  if (!run(pgCtl, ['start', '-D', DATA_DIR, '-l', LOG_FILE, '-w', '-t', '30'])) {
    console.error(`Could not start Postgres to finish setup. Check ${LOG_FILE} for details.`)
    return false
  }

  const check = spawnSync(
    psql,
    ['-h', 'localhost', '-p', String(PORT), '-U', SUPERUSER, '-tAc', `SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'`],
    { encoding: 'utf8' },
  )

  if (check.stdout.trim() === '1') {
    console.log(`Database "${DB_NAME}" already exists.`)
  } else {
    console.log(`Creating database "${DB_NAME}"...`)
    run(createdb, ['-h', 'localhost', '-p', String(PORT), '-U', SUPERUSER, DB_NAME])
  }

  run(pgCtl, ['stop', '-D', DATA_DIR, '-m', 'fast', '-w'])
  return true
}

function main() {
  if (!ensureBinariesPresent()) process.exit(1)
  if (!createCluster()) process.exit(1)
  if (!ensureDatabaseExists()) process.exit(1)
  console.log('Local database setup is complete. Run "npm run dev" to start the app.')
}

main()
