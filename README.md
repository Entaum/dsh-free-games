# dsh-plugin-spawnd

A [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Web plugin that adds a **Games** button above Settings. It opens a Spawnd.gg cabinet: published demos from the bundled catalog, cover art with hover clips, search/sort, and a minimizable 16:9 embed player.

This is an independent community plugin. It is **not** an official DeepSeek or Spawnd product.

## Install

From a public GitHub repository (replace `YOUR_OWNER` after you push):

```sh
dsh plugin --profile web add github:YOUR_OWNER/dsh-plugin-spawnd
```

Pin a commit for production:

```sh
dsh plugin --profile web add github:YOUR_OWNER/dsh-plugin-spawnd#<40-character-commit>
```

From this checkout (development link — keep the directory in place):

```sh
dsh plugin --profile web add ./dsh-plugin-spawnd
```

Restart `dsh web`, then refresh the GUI. Uninstall:

```sh
dsh plugin --profile web remove dsh-plugin-spawnd
```

## What it does

- Sidebar **Games** control in `sidebar.footer.action` (order 80, above Settings), matching Settings chrome.
- Cabinet grid of **published** games from `data/spawnd_game_list.json` only.
- Live Spawnd data fills **covers and hover clips** only; it does not add extra games.
- Search by name. Sort: **Newest** (default, `published_at`), **Name**, **Recently played**.
- Recently played is stored in the browser (`localStorage` key `dsh-plugin-spawnd:recent`).
- Click a cover to open the 16:9 embed. Minimize keeps the iframe mounted. On narrow screens, minimize hides the player; Games restores it.
- Back / Next around a clickable Spawnd logo. Next picks a random other published game.
- Outbound Spawnd links use `utm_source=deepseekplugin` and `rel="noopener noreferrer"`.

## Network

The Host half fetches only:

- `https://www.spawnd.gg/en/__data.json`
- `https://www.spawnd.gg/en`

The Client loads covers/clips from `https://assets.spawnd.gg/` and embeds `https://www.spawnd.gg/-/games/embed/{id}`. Game iframes run third-party Spawnd code.

## Compatibility

Tested against DeepSeek Harness Web (`dsh web`) around `0.1.0-rc` with `@deepseek-ai/cordis` `^4.0.1`. Requires the web profile (Host `webServer` + Client slots).

## Marketplace submit

1. Push this directory as a **public** GitHub repository you control.
2. Add the GitHub topic **`dsh-plugin`**.
3. Open the bilingual submit page at [dsh.pub/en/submit](https://dsh.pub/en/submit/) and paste the repo URL.
4. Propose the pre-filled `submissions/*.json` as a PR to the dsh.pub catalog.

Do not publish under the reserved `@deepseek-ai` npm scope. Listing is not a security audit or official endorsement. Review [develop-plugin.md](https://dsh.pub/develop-plugin.md) before changing packaging.

## License

MIT. Game names, covers, clips, and embeds belong to their respective authors and [Spawnd](https://www.spawnd.gg/).
