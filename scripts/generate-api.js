const path = require('path')
const { ROOT, generateBackend, generateFrontend } = require('./api-codegen')

const JAVA_OUT_DIR = path.join(ROOT, 'backend', 'app', 'src', 'generated', 'java')
const SCHEMA_OUT_FILE = path.join(ROOT, 'frontend', 'src', 'api', 'schema.d.ts')

console.log('Generating Spring server interfaces from api/openapi.yaml...')
generateBackend(JAVA_OUT_DIR)

console.log('Generating TypeScript types from api/openapi.yaml...')
generateFrontend(SCHEMA_OUT_FILE)

console.log('Done. Review the changes with "git diff" and commit them.')
