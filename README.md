# userscripts

Collection of Violentmonkey userscripts for various sites, plus a standalone custom RadioKing player.

## Structure

```
site-name/
  script-name.user.js
index.html          ← standalone RadioKing player (GitHub Pages)
```

## Scripts

- **radiochoco** — Enhanced player for Radio Choco with WebGL animated background (Kawarp), blown-up track info, and immersive fullscreen UI.

## Standalone Player

[`index.html`](index.html) is a self-contained custom RadioKing player that works without any userscript or browser extension. Host it on GitHub Pages and pass the station slug as a URL parameter.

### Usage

```
?slug=<radioking-slug>
?stream=<stream-url>   (optional, overrides auto-detected stream)
```

### Supported stations

| Name | Slug | Link |
|---|---|---|
| Radio Choco | `radiochoco-sound` | [→ Listen](?slug=radiochoco-sound) |
| Le Mellotron | `lemellotron-stream` | [→ Listen](?slug=lemellotron-stream) |

### Deploy

1. Push `index.html` to a GitHub repo
2. Enable GitHub Pages on the repo
3. Visit `https://<user>.github.io/<repo>/?slug=radiochoco-sound`

### Features

- Covers-based blurred background + Kawarp WebGL fluid animation
- Track info (title, artist, album) via RadioKing API
- Adaptive progress bar with elapsed / total time
- "Up Next" display with hover history tooltip (last 10 played tracks)
- Play / pause with volume slider
- Station selector dropdown
- Responsive (works on mobile)
- No auto-play (browser policy)

## Install userscript

Open a `.user.js` file in Violentmonkey and it will offer to install it.
