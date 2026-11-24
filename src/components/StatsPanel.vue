<template>
  <v-card class="card" variant="flat">
    <div class="stats">
      <div class="stat"><b>{{ fmt(S.opened) }}</b><span>chests opened</span></div>
      <div class="stat"><b>{{ fmt(treasures) }}</b><span>treasures</span></div>
      <div class="stat"><b>{{ fmt(S.hits.token) }}</b><span>Pirate Tokens</span></div>
    </div>
    <h3>Chance of ≥1 Pirate Token so far</h3>
    <v-progress-linear class="luck" :model-value="pr * 100" :height="8" rounded color="#ff8a1f" />
    <div class="row"><span>{{ luckTxt }}</span><span class="mute">{{ S.hits.token ? `last token at chest #${fmt(S.lastTok)}` : '' }}</span></div>

    <v-table class="rt">
      <thead>
        <tr><th>Reward</th><th>Odds</th><th>Hits</th><th>Expected</th></tr>
      </thead>
      <tbody>
        <tr v-for="(r, j) in R" :key="r.id">
          <td :style="{ color: r.c }">{{ r.i }} {{ r.name }}<div class="mute" style="font-size:12px">{{ itemFor(r, 1).name }}</div></td>
          <td>1 in {{ fmt(1 / p[j]) }}<span v-if="boost(r)" class="mute"> ({{ boost(r) }}×)</span></td>
          <td>{{ fmt(S.hits[r.id]) }}<span v-if="S.dupes[r.id]" class="mute"> ({{ S.dupes[r.id] }} dup)</span></td>
          <td>{{ S.expAll[j] < 10 ? S.expAll[j].toFixed(2) : fmt(S.expAll[j]) }}</td>
        </tr>
      </tbody>
    </v-table>

    <h3 style="margin-top:12px">Drop log</h3>
    <ul id="log">
      <li v-if="!S.log.length" class="mute">Nothing yet.</li>
      <li v-for="e in S.log.slice(0, 40)" :key="e.at" :class="{ dupe: e.dupe }">
        <span :style="{ color: R[e.k].c }">{{ R[e.k].i }} {{ e.item.name }}{{ e.dupe ? ' (already owned)' : '' }}</span>
        <span class="mute">#{{ fmt(e.at) }}</span>
      </li>
    </ul>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { ui, S, R, MODES, fmt, probs, itemFor } from '../game/store.js'

const p = computed(() => probs())
const boost = r => MODES[ui.mode].b[r.id]
const treasures = computed(() => Object.values(S.hits).reduce((a, b) => a + b, 0))
const pr = computed(() => 1 - Math.exp(-ui.tokExp))
const luckTxt = computed(() => {
  const v = pr.value
  return (v * 100 < 0.01 && v > 0 ? '<0.01' : (v * 100).toFixed(v > 0.1 ? 1 : 2)) + '%'
})
</script>
