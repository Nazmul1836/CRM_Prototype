const fs = require('fs')
const os = require('os')
const path = require('path')
const { ROOT, generateBackend, generateFrontend } = require('./api-codegen')

const JAVA_COMMITTED = path.join(ROOT, 'backend', 'app', 'src', 'generated', 'java')
const SCHEMA_COMMITTED = path.join(ROOT, 'frontend', 'src', 'api', 'schema.d.ts')
const JAVA_COMMITTED_LABEL = 'backend/app/src/generated/java'
const SCHEMA_COMMITTED_LABEL = 'frontend/src/api/schema.d.ts'

function listFiles(dir) {
  if (!fs.existsSync(dir)) return []
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...listFiles(full))
    else out.push(full)
  }
  return out
}

// Normalized on top of .gitattributes forcing LF, as a defense-in-depth measure so this check
// never fails on line-ending differences alone.
function readNormalized(file) {
  return fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n')
}

function filesDiffer(committedFile, freshFile) {
  if (!fs.existsSync(committedFile) || !fs.existsSync(freshFile)) return true
  return readNormalized(committedFile) !== readNormalized(freshFile)
}

function main() {
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'crm-api-check-'))
  const mismatches = []

  try {
    const freshJavaDir = path.join(scratch, 'java')
    const freshSchemaFile = path.join(scratch, 'schema.d.ts')

    generateBackend(freshJavaDir)
    generateFrontend(freshSchemaFile)

    for (const freshFile of listFiles(freshJavaDir)) {
      const rel = path.relative(freshJavaDir, freshFile)
      if (filesDiffer(path.join(JAVA_COMMITTED, rel), freshFile)) {
        mismatches.push(path.join(JAVA_COMMITTED_LABEL, rel))
      }
    }
    for (const committedFile of listFiles(JAVA_COMMITTED)) {
      const rel = path.relative(JAVA_COMMITTED, committedFile)
      if (!fs.existsSync(path.join(freshJavaDir, rel))) {
        mismatches.push(`${path.join(JAVA_COMMITTED_LABEL, rel)} (should be removed)`)
      }
    }

    if (filesDiffer(SCHEMA_COMMITTED, freshSchemaFile)) {
      mismatches.push(SCHEMA_COMMITTED_LABEL)
    }
  } finally {
    fs.rmSync(scratch, { recursive: true, force: true })
  }

  if (mismatches.length > 0) {
    console.error('Generated API code is stale. It does not match api/openapi.yaml:')
    for (const file of mismatches) console.error(`  - ${file}`)
    console.error('Run "npm run api", review the changes, and commit them.')
    process.exit(1)
  }

  console.log('Generated API code is up to date with api/openapi.yaml.')
}

main()
