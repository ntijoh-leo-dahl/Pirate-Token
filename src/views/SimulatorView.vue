<template>
  <div>
    <Overlays />
    <div class="wrap">
      <div class="btns userbar">
        <span class="mute">Signed in as <b>{{ auth.user?.name }}</b></span>
        <v-btn variant="flat" @click="signOut">Log out</v-btn>
      </div>
      <h1>🏴‍☠️ Pirate Token <span>Chest Simulator</span></h1>
      <div class="sub">Fortnite Treasure Hunters · uses Epic’s published per-chest drop rates</div>
      <div class="grid">
        <ChestPanel />
        <StatsPanel />
      </div>
      <div class="note">Odds per chest as announced by Epic: Weekly Gold Outfit 1 in 1,562,500 · Pirate Shop Access 1 in 137,500 · Vehicle &amp; Decal 1 in 7,813 · Pickaxe/Back Bling 1 in 568 · Jam Track 1 in 391 · Loading Screen 1 in 272 · Gizmo 1 in 127. Treasure Hour boosts: Pirate Token 1.5× (2× in one earlier round), Gold Outfit 7.5–10×, Vehicle &amp; Decal 10×. Each chest rolls once; rewards are modeled as mutually exclusive. This is a simulation, not affiliated with Epic Games.</div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import Overlays from '../components/Overlays.vue'
import ChestPanel from '../components/ChestPanel.vue'
import StatsPanel from '../components/StatsPanel.vue'
import { engine } from '../game/store.js'
import { auth, logout } from '../auth/auth.js'

// engine.js addresses overlay/stage elements by id, so load it once they exist
onMounted(async () => {
  engine.value = await import('../game/engine.js')
})

// engine.js holds global listeners and canvas refs, so a full reload is the cleanest reset
function signOut() {
  logout()
  location.hash = '#/login'
  location.reload()
}
</script>
