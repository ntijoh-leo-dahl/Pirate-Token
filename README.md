# Pirate Token Chest Simulator (Vue 3 + Vuetify 3)

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

- `src/game/store.js` – reward data, reactive state (`ui`, `S`), odds, `itemFor`
- `src/game/engine.js` – chest animation, canvas FX, audio, showcase card, keyboard shortcuts
- `src/components/ChestPanel.vue` / `StatsPanel.vue` – Vuetify UI (v-card, v-btn, v-checkbox, v-table, v-progress-linear)
- `src/components/Overlays.vue` – full-screen effect layers
- `src/styles/legacy.css` – original stylesheet, unchanged; `overrides.css` adapts Vuetify to it
