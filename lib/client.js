window.__ModuleLoader__.load({
  id: 'dsh-plugin-spawnd',
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    var React = require('react');
    var inject = ['slots'];

    function apiGet(path) {
      return fetch(path, { method: 'GET', headers: { accept: 'application/json' } }).then(function (res) {
        if (!res.ok) throw new Error('spawnd ' + path + ' ' + res.status)
        return res.json()
      })
    }

    var RECENT_KEY = 'dsh-plugin-spawnd:recent'

    function loadRecent() {
      try {
        var raw = localStorage.getItem(RECENT_KEY)
        var parsed = JSON.parse(raw)
        if (!Array.isArray(parsed)) return []
        return parsed.filter(function (id) { return typeof id === 'string' && id })
      } catch (err) {
        return []
      }
    }

    function saveRecent(ids) {
      var out = []
      var seen = Object.create(null)
      for (var i = 0; i < ids.length && out.length < 80; i++) {
        var id = String(ids[i] || '')
        if (!id || seen[id]) continue
        seen[id] = true
        out.push(id)
      }
      try { localStorage.setItem(RECENT_KEY, JSON.stringify(out)) } catch (err) {}
      return out
    }

const SPAWND_HOME = 'https://www.spawnd.gg/?utm_source=deepseekplugin'
const SPAWND_LOGO = 'https://www.spawnd.gg/spawnd-logo.png'

const CSS = [
  '@keyframes spawnd-cabinet-in{from{transform:translateX(-18px);opacity:0}to{transform:none;opacity:1}}',
  '@keyframes spawnd-stage-in{from{transform:translateY(14px) scale(.985);opacity:0}to{transform:none;opacity:1}}',
  '.spawnd-root{position:absolute;inset:0;pointer-events:none !important;z-index:30}',
  '.spawnd-hit{pointer-events:auto}',
  '.hHd-Xa_footerActions{flex-direction:column;align-items:stretch;width:100%}',
  '.spawnd-footwrap{width:100%;min-width:0;flex:none}',
  '.spawnd-foot{box-sizing:border-box;cursor:pointer;width:calc(100% + 4px);height:42px;color:var(--dsw-alias-label-primary);background:transparent;border:none;border-radius:12px;flex:none;align-items:center;gap:8px;margin:4px -2px;padding:0 10px 0 8px;font-family:inherit;font-size:14px;line-height:22px;display:flex;overflow:hidden}',
  '.spawnd-foot:hover{background:var(--dsw-alias-interactive-bg-hover)}',
  '.spawnd-foot:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}',
  '.spawnd-foot.is-rail{border-radius:50%;justify-content:center;gap:0;width:36px;height:36px;margin:8px 0 10px;padding:0}',
  '.spawnd-footLabel{white-space:nowrap;overflow:hidden}',
  '.spawnd-footIcon{flex:none;width:16px;height:16px}',
  '.spawnd-foot.is-rail .spawnd-footIcon{width:18px;height:18px}',
  '.spawnd-scrim{position:absolute;inset:0;background:rgba(6,4,3,.46);border:0;padding:0;margin:0;cursor:pointer}',
  '.spawnd-cabinet{position:absolute;top:10px;bottom:10px;left:10px;width:min(368px,calc(100vw - 24px));display:flex;flex-direction:column;background:#16110d;color:#f6e7d4;border:1px solid #3a2a1f;border-radius:18px;box-shadow:0 24px 60px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,214,170,.08);overflow:hidden;animation:spawnd-cabinet-in .22s cubic-bezier(.2,.8,.2,1);z-index:3}',
  '.spawnd-head{flex:none;display:flex;align-items:center;gap:10px;padding:14px 14px 10px}',
  '.spawnd-logoLink{display:flex;min-width:0;flex:1;align-items:center;height:28px;text-decoration:none}',
  '.spawnd-logo{height:24px;width:auto;max-width:160px;object-fit:contain;display:block}',
  '.spawnd-sub{font:500 11px/14px ui-sans-serif, system-ui, sans-serif;color:#c9a888}',
  '.spawnd-iconbtn{flex:none;width:28px;height:28px;border:0;border-radius:8px;background:transparent;color:#e8d2b8;cursor:pointer;display:grid;place-items:center}',
  '.spawnd-iconbtn:hover{background:#2a211b}',
  '.spawnd-iconbtn:focus-visible{outline:2px solid #f47e2f;outline-offset:2px}',
  '.spawnd-iconbtn:disabled{opacity:.35;cursor:default}',
  '.spawnd-toolbar{flex:none;display:flex;flex-direction:column;gap:8px;padding:0 14px 12px}',
  '.spawnd-search,.spawnd-sort{box-sizing:border-box;width:100%;height:34px;border:1px solid #4a3122;border-radius:10px;background:#1a120d;color:#f6e7d4;padding:0 10px;font:500 13px/18px ui-sans-serif, system-ui, sans-serif}',
  '.spawnd-search:focus,.spawnd-sort:focus{outline:2px solid #f47e2f;outline-offset:1px}',
  '.spawnd-search::placeholder{color:#c9a888}',
  '.spawnd-random{flex:none;height:36px;border:0;border-radius:999px;cursor:pointer;color:#1a0f08;background:linear-gradient(180deg,#ffb266,#f47e2f);font:700 12px/16px ui-rounded, "Avenir Next Condensed", sans-serif;letter-spacing:.08em;text-transform:uppercase;display:flex;align-items:center;justify-content:center;gap:8px}',
  '.spawnd-random:hover{filter:brightness(1.06)}',
  '.spawnd-random:focus-visible{outline:2px solid #ffd7a8;outline-offset:2px}',
  '.spawnd-random:disabled{opacity:.55;cursor:default;filter:none}',
  '.spawnd-gridwrap{flex:1;min-height:0;overflow:auto;padding:0 14px 16px}',
  '.spawnd-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}',
  '.spawnd-card{position:relative;display:block;width:100%;padding:0;border:0;border-radius:10px;overflow:hidden;cursor:pointer;background:#241910;aspect-ratio:11/16;box-shadow:0 8px 18px rgba(0,0,0,.28)}',
  '.spawnd-card:hover,.spawnd-card:focus-visible{box-shadow:0 0 0 2px #f47e2f, 0 10px 22px rgba(0,0,0,.35)}',
  '.spawnd-card:focus-visible{outline:none}',
  '.spawnd-cover,.spawnd-clip{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;z-index:1}',
  '.spawnd-clip{opacity:0;transition:opacity .16s ease}',
  '.spawnd-card.is-hot .spawnd-clip{opacity:1}',
  '.spawnd-fallback{position:absolute;inset:0;display:grid;place-items:center;padding:10px;text-align:center;background:radial-gradient(circle at 30% 20%,#5a3318,#1a120d);color:#f6e7d4;font:700 12px/16px ui-rounded, sans-serif}',
  '.spawnd-meta{position:absolute;left:0;right:0;bottom:0;padding:28px 8px 8px;background:linear-gradient(180deg,transparent,#120c09 78%);text-align:left}',
  '.spawnd-name{display:block;font:700 11px/14px ui-sans-serif, system-ui, sans-serif;color:#fff6ea;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
  '.spawnd-flag{display:inline-block;margin-top:4px;padding:1px 6px;border-radius:999px;background:#f47e2f;color:#1a0f08;font:700 9px/14px ui-sans-serif, system-ui, sans-serif;letter-spacing:.04em;text-transform:uppercase}',
  '.spawnd-empty,.spawnd-status{padding:24px 8px;text-align:center;color:#c9a888;font:13px/18px ui-sans-serif, system-ui, sans-serif}',
  '.spawnd-play{position:absolute;z-index:4;display:flex;flex-direction:column;background:#120c09;color:#f6e7d4;border:1px solid #4a3122;overflow:hidden}',
  '.spawnd-play.is-full{left:50%;top:50%;right:auto;bottom:auto;transform:translate(-50%,-50%);width:min(1080px,calc(100vw - 56px),calc((100vh - 96px) * 16 / 9));height:auto;border-radius:16px;box-shadow:0 30px 80px rgba(0,0,0,.55);animation:spawnd-stage-in .2s cubic-bezier(.2,.8,.2,1)}',
  '.spawnd-play.is-mini{right:16px;bottom:16px;left:auto;top:auto;width:min(320px,calc(100vw - 32px));height:auto;border-radius:14px;box-shadow:0 18px 40px rgba(0,0,0,.45)}',
  '.spawnd-stagebar{flex:none;display:flex;align-items:center;gap:8px;padding:10px 12px;background:#1c1410;border-bottom:1px solid #3a2a1f}',
  '.spawnd-stagetitle{min-width:0;flex:1;font:700 13px/18px ui-sans-serif, system-ui, sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
  '.spawnd-navrow{flex:none;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 12px;background:#1c1410;border-bottom:1px solid #3a2a1f}',
  '.spawnd-navbtn{flex:none;width:25%;min-width:88px;max-width:140px;height:36px;border:0;border-radius:999px;cursor:pointer;color:#1a0f08;background:linear-gradient(180deg,#ffb266,#f47e2f);font:700 12px/16px ui-rounded, "Avenir Next Condensed", sans-serif;letter-spacing:.08em;text-transform:uppercase;display:flex;align-items:center;justify-content:center;gap:8px}',
  '.spawnd-navlogo{flex:none;display:flex;align-items:center;height:28px;text-decoration:none}',
  '.spawnd-navlogo img{height:24px;width:auto;max-width:120px;object-fit:contain;display:block}',
  '.spawnd-navbtn:hover{filter:brightness(1.06)}',
  '.spawnd-navbtn:focus-visible{outline:2px solid #ffd7a8;outline-offset:2px}',
  '.spawnd-navbtn:disabled{opacity:.45;cursor:default;filter:none}',
  '.spawnd-play.is-mini .spawnd-navrow{display:none}',
  '.spawnd-framebox{position:relative;width:100%;flex:none;aspect-ratio:16/9;background:#000}',
  '.spawnd-frame{position:absolute;inset:0;width:100%;height:100%;border:0;background:#000}',
  '.spawnd-cta{flex:none;display:block;padding:10px 14px 12px;text-align:center;color:#ffb266;font:600 13px/18px ui-sans-serif, system-ui, sans-serif;text-decoration:none}',
  '.spawnd-cta:hover{color:#ffd7a8;text-decoration:underline}',
  '.spawnd-play.is-mini .spawnd-cta{display:none}',
  '@media (max-width:720px){.spawnd-play.is-mini{left:-9999px;top:auto;right:auto;bottom:auto;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;box-shadow:none;border:0}}',
  '@media (prefers-reduced-motion:reduce){.spawnd-cabinet,.spawnd-play{animation:none}}',
].join('')

const listeners = []
let store = {
  cabinet: false,
  loading: true,
  error: '',
  games: [],
  hoverId: '',
  playing: null,
  minimized: false,
  history: [],
  historyIndex: -1,
  query: '',
  sort: 'newest',
  recentIds: [],
}

function publish(patch) {
  const next = {}
  const keys = Object.keys(store)
  for (let i = 0; i < keys.length; i++) next[keys[i]] = store[keys[i]]
  const names = Object.keys(patch)
  for (let i = 0; i < names.length; i++) next[names[i]] = patch[names[i]]
  store = next
  for (let i = 0; i < listeners.length; i++) listeners[i](store)
}

function useStore() {
  const pair = React.useState(store)
  const snap = pair[0]
  const setSnap = pair[1]
  React.useEffect(function () {
    listeners.push(setSnap)
    setSnap(store)
    return function () {
      const idx = listeners.indexOf(setSnap)
      if (idx >= 0) listeners.splice(idx, 1)
    }
  }, [])
  return snap
}

let loadStarted = false
function ensureCatalog() {
  if (loadStarted) return
  loadStarted = true
  publish({ recentIds: loadRecent() })
  apiGet('/spawnd/games').then(function (result) {
    const games = published(result && Array.isArray(result.games) ? result.games : [])
    publish({ games: games, loading: false, error: games.length ? '' : 'No games found' })
  }).catch(function () {
    publish({ loading: false, error: 'Could not load the Spawnd catalog' })
  })
}

function h(type, props) {
  const args = [type, props || null]
  for (let i = 2; i < arguments.length; i++) args.push(arguments[i])
  return React.createElement.apply(React, args)
}

function IconGamepad() {
  return h('svg', { className: 'spawnd-footIcon', viewBox: '0 0 16 16', fill: 'currentColor', 'aria-hidden': true },
    h('path', { d: 'M5.2 4.2h5.6c2.3 0 4.2 1.8 4.2 4.1 0 1.7-1 3.2-2.5 3.8-.3.1-.6 0-.8-.2l-1.2-1.5H5.5L4.3 11.9c-.2.2-.5.3-.8.2C2 11.5 1 10 1 8.3c0-2.3 1.9-4.1 4.2-4.1zm.8 2.1c-.4 0-.7.3-.7.7v.6h-.6c-.4 0-.7.3-.7.7s.3.7.7.7h.6v.6c0 .4.3.7.7.7s.7-.3.7-.7v-.6h.6c.4 0 .7-.3.7-.7s-.3-.7-.7-.7H6.7v-.6c0-.4-.3-.7-.7-.7zm5.3 1.1a.9.9 0 1 0 0 1.8.9.9 0 0 0 0-1.8zm1.6 1.6a.9.9 0 1 0 0 1.8.9.9 0 0 0 0-1.8z' }),
  )
}

function IconClose() {
  return h('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, 'aria-hidden': true },
    h('path', { d: 'M4 4l8 8M12 4l-8 8' }),
  )
}

function IconMin() {
  return h('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, 'aria-hidden': true },
    h('path', { d: 'M3.5 8h9' }),
  )
}

function IconMax() {
  return h('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, 'aria-hidden': true },
    h('rect', { x: 3.5, y: 3.5, width: 9, height: 9, rx: 1.2 }),
  )
}

function IconShuffle() {
  return h('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, 'aria-hidden': true },
    h('path', { d: 'M2 5h3.2L9 11h2.4' }),
    h('path', { d: 'M11.4 5H14M11.4 11H14' }),
    h('path', { d: 'M12.2 3.4L14 5l-1.8 1.6' }),
    h('path', { d: 'M12.2 9.4L14 11l-1.8 1.6' }),
    h('path', { d: 'M2 11h3.2L6.7 9' }),
  )
}

function IconBack() {
  return h('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, 'aria-hidden': true },
    h('path', { d: 'M10 3.5L4.5 8 10 12.5' }),
  )
}

function IconNext() {
  return h('svg', { width: 14, height: 14, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, 'aria-hidden': true },
    h('path', { d: 'M6 3.5L11.5 8 6 12.5' }),
  )
}

function statusLabel(game) {
  if (game.featured) return 'Featured'
  if (game.status === 'published') return ''
  if (game.status === 'coming_soon') return 'Soon'
  if (game.status === 'draft') return 'Draft'
  return ''
}

function published(games) {
  const out = []
  for (let i = 0; i < games.length; i++) {
    if (games[i] && games[i].status === 'published') out.push(games[i])
  }
  return out
}

function playable(games) {
  const out = []
  for (let i = 0; i < games.length; i++) {
    if (games[i] && games[i].embed && games[i].status === 'published') out.push(games[i])
  }
  return out
}

function visibleGames(games, query, sort, recentIds) {
  const q = String(query || '').trim().toLowerCase()
  const filtered = []
  for (let i = 0; i < games.length; i++) {
    const game = games[i]
    if (!game) continue
    if (q && String(game.name || '').toLowerCase().indexOf(q) === -1) continue
    filtered.push(game)
  }
  const rank = Object.create(null)
  for (let i = 0; i < recentIds.length; i++) rank[recentIds[i]] = i
  filtered.sort(function (a, b) {
    if (sort === 'name') return String(a.name || '').localeCompare(String(b.name || ''))
    if (sort === 'recent') {
      const ra = rank[a.id]
      const rb = rank[b.id]
      const ha = ra === undefined ? 9999 : ra
      const hb = rb === undefined ? 9999 : rb
      if (ha !== hb) return ha - hb
      return String(b.publishedAt || '').localeCompare(String(a.publishedAt || ''))
    }
    return String(b.publishedAt || '').localeCompare(String(a.publishedAt || ''))
  })
  return filtered
}

function sameGame(a, b) {
  if (!a || !b) return false
  if (a.id && b.id) return a.id === b.id
  return a.slug === b.slug
}

function launch(game) {
  if (!game || !game.embed) return
  const history = store.history.slice(0, store.historyIndex + 1)
  const last = history[history.length - 1]
  if (!last || !sameGame(last, game)) history.push(game)
  publish({
    playing: game,
    minimized: false,
    cabinet: false,
    history: history,
    historyIndex: history.length - 1,
  })
  if (game.id) {
    const next = [game.id]
    const current = store.recentIds || []
    for (let i = 0; i < current.length; i++) {
      if (current[i] !== game.id) next.push(current[i])
    }
    publish({ recentIds: saveRecent(next) })
  }
}

function playBack() {
  if (store.historyIndex <= 0) return
  const nextIndex = store.historyIndex - 1
  publish({
    playing: store.history[nextIndex],
    historyIndex: nextIndex,
    minimized: false,
    cabinet: false,
  })
}

function playNext() {
  if (store.historyIndex >= 0 && store.historyIndex < store.history.length - 1) {
    const nextIndex = store.historyIndex + 1
    publish({
      playing: store.history[nextIndex],
      historyIndex: nextIndex,
      minimized: false,
      cabinet: false,
    })
    return
  }
  const pool = playable(visibleGames(store.games, store.query, store.sort, store.recentIds || []))
  if (pool.length === 0) return
  const current = store.playing
  const choices = []
  for (let i = 0; i < pool.length; i++) {
    if (!sameGame(pool[i], current)) choices.push(pool[i])
  }
  const source = choices.length > 0 ? choices : pool
  launch(source[Math.floor(Math.random() * source.length)])
}

function launchRandom() {
  const pool = playable(visibleGames(store.games, store.query, store.sort, store.recentIds || []))
  if (pool.length === 0) return
  launch(pool[Math.floor(Math.random() * pool.length)])
}

function toggleCabinet() {
  if (store.playing && store.minimized) {
    publish({ minimized: false, cabinet: false })
    return
  }
  publish({ cabinet: !store.cabinet })
}

function GameCard(props) {
  const game = props.game
  const hot = props.hot
  const flag = statusLabel(game)
  return h('button', {
    type: 'button',
    className: hot ? 'spawnd-card is-hot' : 'spawnd-card',
    onMouseEnter: function () { publish({ hoverId: game.id }) },
    onMouseLeave: function () { if (store.hoverId === game.id) publish({ hoverId: '' }) },
    onFocus: function () { publish({ hoverId: game.id }) },
    onBlur: function () { if (store.hoverId === game.id) publish({ hoverId: '' }) },
    onClick: function () { launch(game) },
    title: game.name,
  },
    h('div', { className: 'spawnd-fallback' }, game.name),
    game.cover
      ? h('img', {
        className: 'spawnd-cover',
        src: game.cover,
        alt: '',
        loading: 'lazy',
        referrerPolicy: 'no-referrer',
        onError: function (event) {
          const node = event && event.currentTarget
          if (node) node.style.display = 'none'
        },
      })
      : null,
    hot && game.clip
      ? h('video', {
        className: 'spawnd-clip',
        src: game.clip,
        muted: true,
        loop: true,
        autoPlay: true,
        playsInline: true,
      })
      : null,
    h('span', { className: 'spawnd-meta' },
      h('span', { className: 'spawnd-name' }, game.name),
      flag ? h('span', { className: 'spawnd-flag' }, flag) : null,
    ),
  )
}

function isSpawndEmbed(url) {
  return typeof url === 'string' && url.indexOf('https://www.spawnd.gg/') === 0
}

function EmbedFrame(props) {
  const game = props.game
  if (!game || !isSpawndEmbed(game.embed)) return null
  return h('iframe', {
    className: 'spawnd-frame',
    src: game.embed,
    title: game.name,
    allow: 'autoplay; encrypted-media; clipboard-write; clipboard-read; web-share; fullscreen; gamepad',
    allowFullScreen: true,
    referrerPolicy: 'strict-origin-when-cross-origin',
  })
}

function StageChrome(props) {
  const game = props.game
  return h('div', { className: 'spawnd-stagebar' },
    h('div', { className: 'spawnd-stagetitle' }, game ? game.name : 'Spawnd'),
    h('button', {
      type: 'button',
      className: 'spawnd-iconbtn',
      title: props.minimized ? 'Restore' : 'Minimize',
      'aria-label': props.minimized ? 'Restore game' : 'Minimize game',
      onClick: function (event) {
        event.stopPropagation()
        publish({ minimized: !store.minimized, cabinet: false })
      },
    }, props.minimized ? h(IconMax) : h(IconMin)),
    h('button', {
      type: 'button',
      className: 'spawnd-iconbtn',
      title: 'Close',
      'aria-label': 'Close game',
      onClick: function (event) {
        event.stopPropagation()
        publish({ playing: null, minimized: false, history: [], historyIndex: -1 })
      },
    }, h(IconClose)),
  )
}

function ArcadeOverlay() {
  const snap = useStore()
  React.useEffect(function () {
    ensureCatalog()
  }, [])
  const games = snap.games || []
  const shown = visibleGames(games, snap.query, snap.sort, snap.recentIds || [])
  const nodes = []
  if (!snap.cabinet && !snap.playing) return null
  if (snap.cabinet) {
    const cards = []
    for (let i = 0; i < shown.length; i++) {
      const game = shown[i]
      cards.push(h(GameCard, { key: game.id || game.slug || String(i), game: game, hot: snap.hoverId === game.id }))
    }
    nodes.push(
      h('button', {
        key: 'scrim',
        type: 'button',
        className: 'spawnd-scrim spawnd-hit',
        'aria-label': 'Close games',
        onClick: function () { publish({ cabinet: false }) },
      }),
      h('aside', { key: 'cabinet', className: 'spawnd-cabinet spawnd-hit', role: 'dialog', 'aria-label': 'Spawnd games' },
        h('div', { className: 'spawnd-head' },
          h('a', {
            className: 'spawnd-logoLink',
            href: SPAWND_HOME,
            target: '_blank',
            rel: 'noopener noreferrer',
            title: 'Open spawnd.gg',
          },
            h('img', {
              className: 'spawnd-logo',
              src: SPAWND_LOGO,
              alt: 'spawnd',
              referrerPolicy: 'no-referrer',
            }),
          ),
          h('button', {
            type: 'button',
            className: 'spawnd-iconbtn',
            'aria-label': 'Close games',
            onClick: function () { publish({ cabinet: false }) },
          }, h(IconClose)),
        ),
        h('div', { className: 'spawnd-toolbar' },
          h('input', {
            className: 'spawnd-search',
            type: 'search',
            placeholder: 'Search games',
            value: snap.query,
            onChange: function (event) {
              publish({ query: event.target.value })
            },
          }),
          h('select', {
            className: 'spawnd-sort',
            value: snap.sort,
            onChange: function (event) {
              publish({ sort: event.target.value })
            },
          },
            h('option', { value: 'newest' }, 'Newest'),
            h('option', { value: 'name' }, 'Name'),
            h('option', { value: 'recent' }, 'Recently played'),
          ),
          h('button', {
            type: 'button',
            className: 'spawnd-random',
            disabled: playable(shown).length === 0,
            onClick: launchRandom,
          }, h(IconShuffle), 'Random'),
        ),
        h('div', { className: 'spawnd-gridwrap' },
          snap.loading ? h('div', { className: 'spawnd-status' }, 'Warming the cabinet…') : null,
          !snap.loading && snap.error && games.length === 0 ? h('div', { className: 'spawnd-empty' }, snap.error) : null,
          !snap.loading && shown.length === 0 && games.length > 0 ? h('div', { className: 'spawnd-empty' }, 'No matching games') : null,
          !snap.loading && shown.length > 0 ? h('div', { className: 'spawnd-grid' }, cards) : null,
        ),
      ),
    )
  }
  if (snap.playing) {
    const mini = Boolean(snap.minimized)
    nodes.push(
      mini ? null : h('div', { key: 'stage-scrim', className: 'spawnd-scrim spawnd-hit', style: { background: 'rgba(6,4,3,.62)' } }),
      h('div', {
        key: 'play',
        className: mini ? 'spawnd-play is-mini spawnd-hit' : 'spawnd-play is-full spawnd-hit',
        role: 'dialog',
        'aria-modal': mini ? undefined : 'true',
        'aria-label': snap.playing.name,
      },
        h(StageChrome, { game: snap.playing, minimized: mini }),
        h('div', { className: 'spawnd-navrow' },
          h('button', {
            type: 'button',
            className: 'spawnd-navbtn',
            disabled: snap.historyIndex <= 0,
            onClick: playBack,
          }, h(IconBack), 'Back'),
          h('a', {
            className: 'spawnd-navlogo',
            href: SPAWND_HOME,
            target: '_blank',
            rel: 'noopener noreferrer',
            title: 'Open spawnd.gg',
          },
            h('img', {
              src: SPAWND_LOGO,
              alt: 'spawnd',
              referrerPolicy: 'no-referrer',
            }),
          ),
          h('button', {
            type: 'button',
            className: 'spawnd-navbtn',
            disabled: playable(games).length < 2 && snap.historyIndex >= snap.history.length - 1,
            onClick: playNext,
          }, 'Next', h(IconNext)),
        ),
        h('div', { className: 'spawnd-framebox' },
          h(EmbedFrame, { game: snap.playing }),
        ),
        h('a', {
          className: 'spawnd-cta',
          href: SPAWND_HOME,
          target: '_blank',
          rel: 'noopener noreferrer',
        }, 'Play more free games on spawnd.gg!'),
      ),
    )
  }
  return h('div', { className: 'spawnd-root' }, nodes)
}

function FooterTrigger(props) {
  const snap = useStore()
  React.useEffect(function () {
    ensureCatalog()
  }, [])
  const wide = Boolean(props && props.wide)
  const pressed = snap.cabinet || (snap.playing && !snap.minimized)
  return h('div', { className: 'spawnd-footwrap' },
    h('button', {
      type: 'button',
      className: wide ? 'spawnd-foot' : 'spawnd-foot is-rail',
      title: 'Games',
      'aria-label': 'Open Spawnd games',
      'aria-pressed': pressed ? 'true' : 'false',
      onClick: toggleCabinet,
    },
      h(IconGamepad),
      wide ? h('span', { className: 'spawnd-footLabel' }, 'Games') : null,
    ),
  )
}

    function apply(ctx) {
      const slots = ctx.slots
      ctx.effect(function () {
        if (typeof document === 'undefined') return function () {}
        var existing = document.querySelector('style[data-dsh-plugin-spawnd]')
        if (existing) return function () {}
        var tag = document.createElement('style')
        tag.setAttribute('data-dsh-plugin-spawnd', '1')
        tag.textContent = CSS
        document.head.appendChild(tag)
        return function () { tag.remove() }
      })
      slots.inject('sidebar.footer.action', function () {
        return slots.register(
          { name: 'sidebar.footer.action', id: 'spawnd-games', order: 80, label: 'Games' },
          FooterTrigger,
        )
      })
      slots.inject('shell.overlay', function () {
        return slots.register(
          { name: 'shell.overlay', id: 'spawnd-arcade', order: 60, label: 'Spawnd Arcade' },
          ArcadeOverlay,
        )
      })
    }

    exports.apply = apply
    exports.inject = inject
    return module.exports
  },
})
