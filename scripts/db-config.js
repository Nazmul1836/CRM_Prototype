const path = require('path')

const ROOT = path.resolve(__dirname, '..')
const PG_ROOT = path.join(ROOT, '.local', 'postgres')
const PGSQL_DIR = path.join(PG_ROOT, 'pgsql')
const BIN_DIR = path.join(PGSQL_DIR, 'bin')
const DATA_DIR = path.join(PG_ROOT, 'data')
const LOG_FILE = path.join(PG_ROOT, 'logfile.txt')

const PORT = 55432
const DB_NAME = 'crm_prototype'
const SUPERUSER = 'postgres'

function binPath(name) {
  return path.join(BIN_DIR, `${name}.exe`)
}

module.exports = {
  PG_ROOT,
  PGSQL_DIR,
  BIN_DIR,
  DATA_DIR,
  LOG_FILE,
  PORT,
  DB_NAME,
  SUPERUSER,
  pgCtl: binPath('pg_ctl'),
  psql: binPath('psql'),
  createdb: binPath('createdb'),
  initdb: binPath('initdb'),
}
