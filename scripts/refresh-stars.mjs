#!/usr/bin/env node
// Updates the stars of every apps/<slug>.json from GitHub (GITHUB_TOKEN required). Apps that were
// removed or archived on GitHub keep their file and are listed, so a maintainer can decide.

import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { root, loadApps, writeJson } from './data.mjs'
import { fetchRepos } from './github.mjs'

const apps = loadApps()
const found = await fetchRepos(apps.map(({ app }) => app.repo))
let updated = 0
for (const { file, app } of apps) {
  const repo = found.get(app.repo)
  if (!repo) {
    console.log(`not found: ${file} (${app.repo})`)
    continue
  }
  if (repo.archived) console.log(`archived: ${file} (${app.repo})`)
  if (app.stars === repo.stars) continue
  // Keep stars as the last key, where the schema and CONTRIBUTING.md show it.
  const { stars, ...rest } = app
  writeFileSync(join(root, file), writeJson({ ...rest, stars: repo.stars }))
  updated++
}
console.log(`Updated stars of ${updated} of ${apps.length} apps.`)
