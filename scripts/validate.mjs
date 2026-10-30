#!/usr/bin/env node
// Validates categories.json and every apps/<slug>.json, then (with GITHUB_TOKEN) checks each repo on
// GitHub. Exits 1 and lists every problem on failure.
//
// Usage: node scripts/validate.mjs [--changed-since <git ref>]
//
// With --changed-since, apps added or edited since that ref must have at least MIN_STARS stars and
// not be archived; for the rest those are only warnings, so an old app losing stars or being
// archived doesn't block an unrelated pull request.

import { execFileSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { root, readJson, loadApps, loadCategories } from './data.mjs'
import { fetchRepos, MIN_STARS } from './github.mjs'

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/
const errors = []
const warnings = []
const error = (file, message) => errors.push(`${file}: ${message}`)

const ajv = new Ajv2020({ allErrors: true, strict: true })
addFormats(ajv, ['uri'])
const check = (kind, file, value) => {
  const validate = ajv.getSchema(kind) ?? ajv.addSchema(readJson(join(root, 'schema', `${kind}.schema.json`)), kind).getSchema(kind)
  if (validate(value)) return true
  for (const e of validate.errors) {
    const extra = e.params?.additionalProperty ? ` "${e.params.additionalProperty}"` : ''
    error(file, `${e.instancePath || '(root)'} ${e.message}${extra}`)
  }
  return false
}

// ---- Files ----

let categories = []
try {
  categories = loadCategories()
  check('categories', 'categories.json', categories)
} catch (e) {
  error('categories.json', e.message)
}
const categorySlugs = new Set(categories.map((c) => c.slug))
if (categorySlugs.size !== categories.length) error('categories.json', 'duplicate slug')

for (const name of readdirSync(join(root, 'apps'))) {
  if (!name.endsWith('.json')) error(`apps/${name}`, 'unexpected file (only <slug>.json belongs here)')
}

let apps = []
try {
  apps = loadApps()
} catch (e) {
  error('apps/', `not valid JSON: ${e.message}`)
}
const repos = new Map()
for (const { slug, file, app } of apps) {
  if (!SLUG.test(slug)) error(file, `"${slug}" is not a valid file name (lowercase words joined by hyphens)`)
  if (!check('app', file, app)) continue
  if (!categorySlugs.has(app.category)) error(file, `unknown category "${app.category}" (see categories.json)`)
  const key = app.repo.toLowerCase()
  if (repos.has(key)) error(file, `${app.repo} is already listed in ${repos.get(key)}`)
  repos.set(key, file)
}

// ---- GitHub ----

const changedIndex = process.argv.indexOf('--changed-since')
const changed = new Set(
  changedIndex === -1
    ? []
    : execFileSync('git', ['diff', '--name-only', '--diff-filter=AMR', `${process.argv[changedIndex + 1]}...HEAD`, '--', 'apps/'], { cwd: root, encoding: 'utf8' })
        .split('\n')
        .filter(Boolean),
)

if (process.env.GITHUB_TOKEN && errors.length === 0) {
  const found = await fetchRepos(apps.map(({ app }) => app.repo))
  for (const { file, app } of apps) {
    const repo = found.get(app.repo)
    const report = (message) => (changed.has(file) ? error(file, message) : warnings.push(`${file}: ${message}`))
    if (!repo) report(`${app.repo} was not found on GitHub`)
    else {
      if (repo.nameWithOwner !== app.repo) report(`${app.repo} moved to ${repo.nameWithOwner}, use the new name`)
      if (repo.archived) report(`${app.repo} is archived`)
      if (repo.stars < MIN_STARS) report(`${app.repo} has ${repo.stars} stars, the minimum is ${MIN_STARS}`)
    }
  }
} else if (!process.env.GITHUB_TOKEN) {
  console.log('GITHUB_TOKEN is not set: skipped the GitHub checks (stars, archived, renamed).')
}

for (const w of warnings) console.log(`warning: ${w}`)
if (errors.length) {
  console.error(`\n${errors.length} problem(s):`)
  for (const e of errors) console.error(`  ${e}`)
  process.exit(1)
}
console.log(`OK: ${apps.length} apps in ${categories.length} categories.`)
