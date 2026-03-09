# 🐾 Paws & Preferences

> Discover your favourite kind of cat — one swipe at a time.

A mobile-first single-page web application built for the Cataas coding exercise. Users swipe through cat photos (sourced live from [cataas.com](https://cataas.com)) and receive a personalised summary of their preferences at the end.

**[▶ Live Demo](https://kuberangovindaraju-dev.github.io/paws-and-preferences/)**

---

## Screenshots

| Swiping | Summary |
|---------|---------|
| Stack of cat cards with swipe gestures | Results screen with liked cats grid |

---

## Features

- 🐱 **15 fresh cat photos** per session via the Cataas API
- 👆 **Swipe gestures** — drag right to like, left to pass (mouse & touch)
- 💫 **Smooth animations** — card physics, CUTE/NOPE stamp overlays, fly-out transitions
- 📊 **Results summary** — personalised message, like/pass/total stats, liked cats grid
- 😿 **Error handling** — graceful fallback if API is slow or unreachable, with retry button
- ⏱️ **Per-image timeout** — slow images don't block the loading screen
- 🔄 **Replay** — start a fresh batch any time
- ♿ **Accessible** — ARIA roles, focus-visible styles, `prefers-reduced-motion` support
- 📱 **Mobile-first** — tested on iOS Safari and Android Chrome

---

## Tech Stack

| Concern | Choice | Reason |
|---------|--------|--------|
| Language | Vanilla JS (ES6+) | No build tools needed; demonstrates JS fundamentals clearly |
| Styling | CSS Custom Properties + BEM | Maintainable, consistent design tokens |
| Cat images | [Cataas API](https://cataas.com) | As required. Images loaded via `<img src>` (not fetch) to avoid CORS |
| Hosting | GitHub Pages | Free, zero-config static hosting |
| Fonts | Google Fonts (Playfair Display + DM Sans) | Distinctive pairing; loaded async |

---

## Project Structure

```
paws-and-preferences/
├── index.html              # App shell — markup only, no inline JS or CSS
├── src/
│   ├── css/
│   │   ├── base.css        # Reset, CSS variables, layout
│   │   ├── components.css  # Cards, buttons, loading, summary UI
│   │   └── animations.css  # Keyframes, transitions, reduced-motion
│   └── js/
│       ├── config.js       # Central constants (thresholds, URLs, counts)
│       ├── api.js          # Cataas API calls + image preloading
│       ├── card.js         # Card DOM creation and stack rendering
│       ├── swipe.js        # Drag/touch/mouse swipe interaction
│       ├── summary.js      # Results screen logic
│       └── app.js          # Main controller — orchestrates all modules
└── README.md
```

---

## Architecture Decisions

### Why vanilla JS instead of React/Vue?
The requirements ask for a small focused exercise. Reaching for a framework would introduce build tooling, a `node_modules` folder, and abstraction overhead for what is fundamentally a handful of DOM operations. Vanilla JS keeps the code transparent and easy to evaluate.

### Why `<img src>` instead of `fetch()` for cat images?
Cataas does not send CORS headers. Calling `fetch('https://cataas.com/cat')` triggers a preflight request that the server doesn't handle, causing a browser CORS error. Using the URL directly as `<img src>` bypasses CORS entirely — browsers allow cross-origin image loading by default. The JSON metadata endpoint (`/api/cats`) does support CORS, so `fetch()` is used there.

### Why separate JS modules instead of one file?
Each file has a single responsibility (API, card rendering, swipe logic, etc.), mirroring how a real codebase would be structured before a bundler is introduced. It also makes the code significantly easier to review, test, and extend.

---

## Running Locally

No build step required.

```bash
git clone https://github.com/kuberangovindaraju-dev/paws-and-preferences.git
cd paws-and-preferences

# Option 1 — VS Code Live Server extension (recommended)
# Right-click index.html → "Open with Live Server"

# Option 2 — Python
python -m http.server 8080

# Option 3 — Node
npx serve .
```

Then open `http://localhost:8080` (or whichever port) in your browser.

> ⚠️ Must be served over HTTP (not opened as a `file://` URL) because the
> browser blocks mixed-content image requests from `file://` origins.

---

## If I Had More Time

These are the improvements I would prioritise:

1. **Unit tests** — Jest tests for `api.js` (mocking fetch/Image) and `swipe.js` (simulating pointer events)
2. **Keyboard navigation** — Arrow keys to swipe, Enter to confirm
3. **Undo last swipe** — Store the previous decision and allow one-step undo
4. **Category filtering** — Let users pick cat tags (kittens only, fluffy only, etc.) before starting
5. **Share results** — Generate a shareable image of the liked cats grid using Canvas API
6. **PWA support** — Service worker + web manifest for offline use and Add to Home Screen

---

## License

MIT © 2026 kuberangovindaraju-dev
