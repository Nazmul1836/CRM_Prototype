const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawnSync } = require('child_process')

const ROOT = path.resolve(__dirname, '..')
const SPEC_PATH = path.join(ROOT, 'api', 'openapi.yaml')
const IS_WIN = process.platform === 'win32'

const OPENAPI_GENERATOR_BIN = path.join(ROOT, 'node_modules', '.bin', IS_WIN ? 'openapi-generator-cli.cmd' : 'openapi-generator-cli')
const OPENAPI_TYPESCRIPT_BIN = path.join(ROOT, 'scripts', 'api-codegen-tools', 'node_modules', '.bin', IS_WIN ? 'openapi-typescript.cmd' : 'openapi-typescript')

// Keep these additional-properties in sync with any manual trial runs documented in
// docs/adr/0003-api-codegen.md. hideGenerationTimestamp and openApiNullable=false keep the
// output byte-identical across runs with no spec change, which the drift check depends on.
const SPRING_ADDITIONAL_PROPERTIES = [
  'interfaceOnly=true',
  'useTags=false',
  'documentationProvider=none',
  'useSpringBoot3=true',
  'apiPackage=com.crmprototype.app.generated.api',
  'modelPackage=com.crmprototype.app.generated.model',
  'hideGenerationTimestamp=true',
  'openApiNullable=false',
].join(',')

function generateBackend(javaOutDir) {
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'crm-api-backend-'))
  try {
    const result = spawnSync(
      OPENAPI_GENERATOR_BIN,
      ['generate', '-i', SPEC_PATH, '-g', 'spring', '-o', scratch, `--additional-properties=${SPRING_ADDITIONAL_PROPERTIES}`],
      { stdio: 'inherit', shell: IS_WIN },
    )
    if (result.status !== 0) {
      throw new Error('openapi-generator-cli failed')
    }

    const generatedJavaRoot = path.join(scratch, 'src', 'main', 'java')
    fs.rmSync(javaOutDir, { recursive: true, force: true })
    fs.mkdirSync(javaOutDir, { recursive: true })
    fs.cpSync(generatedJavaRoot, javaOutDir, { recursive: true })
  } finally {
    fs.rmSync(scratch, { recursive: true, force: true })
  }
}

function generateFrontend(schemaOutFile) {
  fs.mkdirSync(path.dirname(schemaOutFile), { recursive: true })
  const result = spawnSync(OPENAPI_TYPESCRIPT_BIN, [SPEC_PATH, '-o', schemaOutFile], { stdio: 'inherit', shell: IS_WIN })
  if (result.status !== 0) {
    throw new Error('openapi-typescript failed')
  }
}

module.exports = { ROOT, SPEC_PATH, generateBackend, generateFrontend }
