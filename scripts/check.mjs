import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'
import {
  isHttpsSpawndUrl,
  isSpawndPageUrl,
  isSpawndAssetUrl,
  withUtm,
  parseWorkspaceJson,
  overlayAssets,
  publishedOnly,
  CACHE_MS,
} from '../lib/index.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const fail = (msg) => {
  console.error('FAIL', msg)
  process.exitCode = 1
}

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
assert.equal(pkg.name, 'dsh-free-games')
assert.equal(pkg.dsh?.bundle?.patch, './cordis.patch.yml')
assert.equal(pkg.dsh?.client?.platform, 'web')
assert.equal(pkg.dsh?.client?.immediately, true)
assert.equal(pkg.exports['./client'], './lib/client.js')
assert.equal(pkg.license, 'MIT')
assert.ok(pkg.repository?.url?.includes('Entaum/dsh-free-games'))
assert.ok(!JSON.stringify(pkg).includes('workspace:'))
assert.ok(!pkg.scripts?.prepare)
for (const file of pkg.files) {
  if (!existsSync(join(root, file))) fail('missing packed file ' + file)
}

const patch = readFileSync(join(root, 'cordis.patch.yml'), 'utf8')
assert.match(patch, /^- insert:/m)
assert.match(patch, /id: dsh-free-games/)
assert.match(patch, /name: dsh-free-games/)
assert.ok(existsSync(join(root, 'LICENSE')))
assert.ok(existsSync(join(root, 'README.md')))

const readme = readFileSync(join(root, 'README.md'), 'utf8')
assert.match(readme, /github:Entaum\/dsh-free-games/)
assert.doesNotMatch(readme, /YOUR_OWNER/)
assert.match(readme, /dsh plugin --profile web add/)
assert.match(readme, /dsh plugin --profile web remove dsh-free-games/)

const client = readFileSync(join(root, 'lib/client.js'), 'utf8')
assert.match(client, /window\.__ModuleLoader__\.load/)
assert.match(client, /id: 'dsh-free-games'/)
assert.doesNotMatch(client, /\.hHd-Xa_/)
assert.match(client, /sidebar\.footer\.action/)
assert.match(client, /shell\.overlay/)

assert.equal(isHttpsSpawndUrl('https://www.spawnd.gg/-/games/x'), true)
assert.equal(isSpawndPageUrl('https://spawnd.gg/-/games/x'), true)
assert.equal(isSpawndAssetUrl('https://assets.spawnd.gg/cover.png'), true)
assert.equal(isSpawndPageUrl('https://evil.example/x'), false)
assert.equal(isHttpsSpawndUrl('https://user:pass@www.spawnd.gg/x'), false)
assert.equal(isHttpsSpawndUrl('https://www.spawnd.gg/x\nhttps://evil.test'), false)
assert.equal(withUtm('https://www.spawnd.gg/-/games/x'), 'https://www.spawnd.gg/-/games/x?utm_source=deepseekplugin')
assert.equal(withUtm('https://assets.spawnd.gg/x.png'), '')
assert.ok(CACHE_MS >= 60 * 1000)

const catalogText = readFileSync(join(root, 'data/spawnd_game_list.json'), 'utf8')
const games = publishedOnly(parseWorkspaceJson(catalogText))
assert.ok(games.length >= 1)
for (const game of games) {
  if (game.url && !isSpawndPageUrl(game.url)) fail('bad page url ' + game.id)
  if (game.embed && !isSpawndPageUrl(game.embed)) fail('bad embed url ' + game.id)
}
const overlaid = overlayAssets(games, [])
assert.equal(overlaid.every((game) => Boolean(game.embed)), true)
assert.equal(overlayAssets([{ id: '1', status: 'published', url: 'https://www.spawnd.gg/x' }], []).length, 0)

if (process.exitCode) process.exit(process.exitCode)
console.log('ok', games.length, 'published games')
