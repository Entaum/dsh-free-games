import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

export const name = 'dsh-plugin-spawnd'
export const inject = ['webServer']

const CATALOG_PATH = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'spawnd_game_list.json')
const UTM = 'utm_source=deepseekplugin'

function withUtm(url) {
  if (!url || typeof url !== 'string') return ''
  if (url.indexOf('spawnd.gg') === -1) return url
  if (url.indexOf('utm_source=') !== -1) return url
  return url + (url.indexOf('?') === -1 ? '?' : '&') + UTM
}

function emptyGame(partial) {
  return {
    id: String(partial.id || ''),
    name: String(partial.name || 'Untitled'),
    slug: String(partial.slug || ''),
    status: String(partial.status || 'unknown'),
    featured: Boolean(partial.featured),
    type: String(partial.type || 'demo'),
    engine: String(partial.engine || ''),
    url: withUtm(String(partial.url || '')),
    embed: withUtm(String(partial.embed || '')),
    cover: String(partial.cover || ''),
    clip: String(partial.clip || ''),
    clipType: String(partial.clipType || ''),
    publishedAt: String(partial.publishedAt || ''),
  }
}

function embedFromCode(code, id) {
  if (typeof code === 'string') {
    const match = code.match(/src="([^"]+)"/)
    if (match && match[1]) return match[1]
  }
  if (id) return 'https://www.spawnd.gg/-/games/embed/' + id + '?description=true'
  return ''
}

function parseStatus(value) {
  const text = String(value || '')
  if (text.indexOf('Published') !== -1) return 'published'
  if (text.indexOf('Draft') !== -1) return 'draft'
  if (text.indexOf('Coming') !== -1) return 'coming_soon'
  return 'unknown'
}

function parseWorkspaceJson(text) {
  const games = []
  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    return games
  }
  if (!Array.isArray(parsed)) return games
  for (const row of parsed) {
    if (!row || typeof row !== 'object') continue
    const id = row.id === undefined || row.id === null ? '' : String(row.id)
    const slug = typeof row.slug === 'string' ? row.slug : ''
    const pageUrl = typeof row['game URL'] === 'string'
      ? row['game URL']
      : (slug ? 'https://www.spawnd.gg/-/games/' + slug : '')
    let type = 'demo'
    if (String(row.game_type || '').indexOf('Tech') !== -1) type = 'tech'
    games.push(emptyGame({
      id,
      name: typeof row.name === 'string' ? row.name : slug,
      slug,
      status: parseStatus(row.status),
      featured: String(row['featured?'] || '').indexOf('Yes') !== -1,
      type,
      engine: row.engine ? String(row.engine) : '',
      url: pageUrl,
      embed: embedFromCode(row.embed_code, id),
      publishedAt: typeof row['published_at (BRT)'] === 'string' ? row['published_at (BRT)'] : '',
    }))
  }
  return games
}

function publishedOnly(games) {
  return games.filter((game) => game && game.status === 'published')
}

function hydrateTable(arr) {
  const memo = Object.create(null)
  const visiting = Object.create(null)
  function rec(value) {
    if (typeof value === 'number' && value >= 0 && value < arr.length && (value % 1) === 0) {
      const key = String(value)
      if (memo[key] !== undefined) return memo[key]
      if (visiting[key]) return null
      visiting[key] = true
      const out = hydrate(arr[value])
      visiting[key] = false
      memo[key] = out
      return out
    }
    return hydrate(value)
  }
  function hydrate(value) {
    if (value === null || value === undefined) return value
    if (Array.isArray(value)) return value.map(rec)
    if (typeof value === 'object') {
      const out = {}
      for (const k of Object.keys(value)) out[k] = rec(value[k])
      return out
    }
    return value
  }
  return rec(0)
}

function attachmentUrl(node) {
  if (!node || typeof node !== 'object') return { url: '', type: '' }
  return {
    url: typeof node.url === 'string' ? node.url : '',
    type: typeof node.contentType === 'string' ? node.contentType : '',
  }
}

function fromLiveGame(node) {
  if (!node || typeof node !== 'object') return null
  const id = node.id === undefined || node.id === null ? '' : String(node.id)
  const slug = typeof node.slug === 'string' ? node.slug : ''
  if (!id && !slug) return null
  const cover = attachmentUrl(node.libraryCapsuleImage)
  const fallbackCover = attachmentUrl(node.mainCapsuleImage)
  const clip = attachmentUrl(node.microtrailerVideo)
  let status = typeof node.status === 'string' ? node.status : 'unknown'
  if (status === 'coming soon') status = 'coming_soon'
  return emptyGame({
    id,
    name: typeof node.name === 'string' ? node.name : slug,
    slug,
    status,
    featured: Boolean(node.isFeatured),
    cover: cover.url || fallbackCover.url,
    clip: clip.url,
    clipType: clip.type,
  })
}

function collectLive(root) {
  const out = []
  if (!root || typeof root !== 'object') return out
  for (const list of [root.featuredGames, root.publishedGames]) {
    if (!Array.isArray(list)) continue
    for (const node of list) {
      const game = fromLiveGame(node)
      if (game) out.push(game)
    }
  }
  return out
}

function gamesFromLiveJson(raw) {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    const nodes = parsed && parsed.nodes
    if (!Array.isArray(nodes)) return []
    for (const node of nodes) {
      if (!node || !Array.isArray(node.data) || node.data.length === 0) continue
      if (!node.data[0] || node.data[0].featuredGames === undefined) continue
      return collectLive(hydrateTable(node.data))
    }
  } catch (err) {
    console.error('[dsh-plugin-spawnd] live json parse failed', err && err.message ? err.message : err)
  }
  return []
}

function parseHtmlAssets(html) {
  const games = []
  if (!html) return games
  let i = 0
  while (i < html.length) {
    const idAt = html.indexOf('data-game-id="', i)
    if (idAt === -1) break
    const idStart = idAt + 14
    const idEnd = html.indexOf('"', idStart)
    if (idEnd === -1) break
    const id = html.slice(idStart, idEnd)
    const slugAt = html.indexOf('data-game-slug="', idEnd)
    if (slugAt === -1 || slugAt - idEnd > 500) { i = idEnd + 1; continue }
    const slugStart = slugAt + 16
    const slugEnd = html.indexOf('"', slugStart)
    if (slugEnd === -1) break
    const slug = html.slice(slugStart, slugEnd)
    const srcAt = html.indexOf('src="https://assets.spawnd.gg/', slugEnd)
    if (srcAt === -1 || srcAt - slugEnd > 800) { i = slugEnd + 1; continue }
    const srcStart = srcAt + 5
    const srcEnd = html.indexOf('"', srcStart)
    if (srcEnd === -1) break
    const cover = html.slice(srcStart, srcEnd)
    let name = slug
    const altAt = html.indexOf('alt="', srcEnd)
    if (altAt !== -1 && altAt - srcEnd < 240) {
      const altStart = altAt + 5
      const altEnd = html.indexOf('"', altStart)
      if (altEnd !== -1) name = html.slice(altStart, altEnd) || slug
    }
    games.push(emptyGame({ id, slug, name, cover, status: 'published' }))
    i = srcEnd + 1
  }
  return games
}

function isSpawndHttpUrl(url) {
  return typeof url === 'string'
    && (url.startsWith('https://www.spawnd.gg/') || url.startsWith('https://assets.spawnd.gg/'))
}

async function fetchText(url) {
  if (!isSpawndHttpUrl(url)) return ''
  try {
    const res = await fetch(url, {
      headers: { 'user-agent': 'dsh-plugin-spawnd/0.1' },
      signal: AbortSignal.timeout(25000),
    })
    if (!res.ok) return ''
    return await res.text()
  } catch (err) {
    console.error('[dsh-plugin-spawnd] fetch failed', url, err && err.message ? err.message : err)
    return ''
  }
}

function overlayAssets(jsonGames, liveGames) {
  const byKey = Object.create(null)
  for (const game of liveGames) {
    if (game.slug) byKey['slug:' + game.slug] = game
    if (game.id) byKey['id:' + game.id] = game
  }
  return jsonGames.map((row) => {
    const game = emptyGame(row)
    const live = byKey['slug:' + game.slug] || byKey['id:' + game.id]
    if (live) {
      if (live.cover) game.cover = live.cover
      if (live.clip) game.clip = live.clip
      if (live.clipType) game.clipType = live.clipType
    }
    game.url = withUtm(game.url)
    game.embed = withUtm(game.embed)
    return game
  })
}

async function readBundledCatalog() {
  const text = await readFile(CATALOG_PATH, 'utf8')
  return publishedOnly(parseWorkspaceJson(text))
}

async function readLiveAssets() {
  const jsonText = await fetchText('https://www.spawnd.gg/en/__data.json')
  const liveGames = gamesFromLiveJson(jsonText)
  const html = await fetchText('https://www.spawnd.gg/en')
  return liveGames.concat(parseHtmlAssets(html))
}

async function buildCatalog() {
  const jsonGames = await readBundledCatalog()
  const liveGames = await readLiveAssets()
  const games = overlayAssets(jsonGames, liveGames)
  return {
    games,
    counts: {
      total: games.length,
      json: jsonGames.length,
      live: liveGames.length,
      covers: games.filter((game) => Boolean(game.cover)).length,
    },
  }
}

function json(res, status, body) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  })
  res.end(JSON.stringify(body))
}

export function apply(ctx) {
  let cache = null
  async function catalog() {
    if (cache && cache.games && cache.games.length > 0) return cache
    cache = await buildCatalog()
    return cache
  }

  const dispose = ctx.webServer.register({
    kind: 'exact',
    path: '/spawnd/games',
    handler: async (req, res) => {
      if (req.method !== 'GET') {
        json(res, 405, { error: 'method not allowed' })
        return
      }
      try {
        json(res, 200, await catalog())
      } catch (err) {
        console.error('[dsh-plugin-spawnd] catalog failed', err && err.message ? err.message : err)
        json(res, 500, { error: 'catalog failed', games: [] })
      }
    },
  })

  return () => {
    cache = null
    if (typeof dispose === 'function') dispose()
  }
}
