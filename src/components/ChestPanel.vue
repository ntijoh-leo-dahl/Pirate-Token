<template>
  <v-card class="card" variant="flat">
    <div class="seg" id="modes">
      <v-btn v-for="(m,k) in MODES" :key="k" variant="flat" :data-m="k" :class="{on:k===ui.mode}" @click="ui.mode=k">{{ m.l }}</v-btn>
    </div>
    <div class="seg" id="weeks">
      <v-btn v-for="(w,k) in WK" :key="k" variant="flat" :data-w="k" :title="w.d" :class="{on:+k===ui.W}" @click="setWeek(k)">Wk {{ k }} · {{ w.n }}{{ +k===4 ? ' ★' : '' }}</v-btn>
    </div>

    <div class="stage" :data-hour="ui.mode!=='normal' ? 'true' : null">
      <div id="rays"></div><div id="lbeam"></div><div id="ring"></div><div id="loot"></div><canvas id="fx"></canvas>
      <svg id="chest" viewBox="0 0 300 270" aria-label="Skull treasure chest">
   <defs>
   <radialGradient id="au"><stop offset="0" stop-color="#fff0a0" stop-opacity=".9"/><stop offset=".45" stop-color="#ffb300" stop-opacity=".35"/><stop offset="1" stop-color="#ffb300" stop-opacity="0"/></radialGradient>
   <linearGradient id="wd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a4a22"/><stop offset="1" stop-color="#4a280d"/></linearGradient>
   <linearGradient id="gd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2a8"/><stop offset=".45" stop-color="#f6b800"/><stop offset="1" stop-color="#c47a00"/></linearGradient>
   <linearGradient id="sg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eceee8"/><stop offset="1" stop-color="#8f968a"/></linearGradient>
   <radialGradient id="pg" cx=".35" cy=".3"><stop offset="0" stop-color="#ffd9ff"/><stop offset=".55" stop-color="#d03fe0"/><stop offset="1" stop-color="#64168a"/></radialGradient>
   <radialGradient id="eg" cx=".4" cy=".35"><stop offset="0" stop-color="#ffe9b0"/><stop offset=".5" stop-color="#ff6a2a"/><stop offset="1" stop-color="#a01010"/></radialGradient>
   <radialGradient id="tg" cx=".4" cy=".35"><stop offset="0" stop-color="#d9fffb"/><stop offset="1" stop-color="#1fa89c"/></radialGradient></defs>
   <ellipse id="aura" cx="150" cy="140" rx="150" ry="125" fill="url(#au)"/>
   <ellipse cx="140" cy="250" rx="130" ry="9" fill="rgba(0,0,0,.4)"/>
   <polygon points="232,112 280,94 280,226 232,244" fill="#4a280d" stroke="#2b1707" stroke-width="3"/>
   <polygon points="232,224 280,208 280,226 232,244" fill="url(#gd)" stroke="#2b1707" stroke-width="3"/>
   <polygon points="232,150 280,134 280,142 232,158" fill="url(#gd)" stroke="#2b1707" stroke-width="2.5"/>
   <rect x="30" y="110" width="202" height="134" rx="5" fill="url(#wd)" stroke="#2b1707" stroke-width="3.5"/>
   <path d="M76 114V222M186 114V222" stroke="#2f1707" stroke-width="2" opacity=".7"/>
   <rect x="30" y="224" width="202" height="20" rx="3" fill="url(#gd)" stroke="#2b1707" stroke-width="3"/>
   <rect x="30" y="110" width="24" height="134" fill="url(#gd)" stroke="#2b1707" stroke-width="3"/>
   <rect x="208" y="110" width="24" height="134" fill="url(#gd)" stroke="#2b1707" stroke-width="3"/>
   <circle cx="42" cy="128" r="4" fill="url(#gd)" stroke="#5a3300" stroke-width="1.8"/><circle cx="41" cy="127" r="1.2" fill="#fff" opacity=".8"/><circle cx="42" cy="208" r="4" fill="url(#gd)" stroke="#5a3300" stroke-width="1.8"/><circle cx="41" cy="207" r="1.2" fill="#fff" opacity=".8"/><circle cx="220" cy="128" r="4" fill="url(#gd)" stroke="#5a3300" stroke-width="1.8"/><circle cx="219" cy="127" r="1.2" fill="#fff" opacity=".8"/><circle cx="220" cy="208" r="4" fill="url(#gd)" stroke="#5a3300" stroke-width="1.8"/><circle cx="219" cy="207" r="1.2" fill="#fff" opacity=".8"/><circle cx="70" cy="234" r="4" fill="url(#gd)" stroke="#5a3300" stroke-width="1.8"/><circle cx="69" cy="233" r="1.2" fill="#fff" opacity=".8"/><circle cx="192" cy="234" r="4" fill="url(#gd)" stroke="#5a3300" stroke-width="1.8"/><circle cx="191" cy="233" r="1.2" fill="#fff" opacity=".8"/>
   <ellipse id="beam" cx="131" cy="110" rx="108" ry="16" fill="#ffd23f"/>
   <g id="lid">
    <path d="M232 112L280 94V68Q274 34 238 28Q214 26 192 40Q232 46 232 84Z" fill="#5a3314" stroke="#2b1707" stroke-width="3"/>
    <path d="M30 112V84Q30 38 131 38Q232 38 232 84V112Z" fill="url(#wd)" stroke="#2b1707" stroke-width="3.5"/>
    <path d="M80 46V112M131 38V112M182 46V112" stroke="#2f1707" stroke-width="2" opacity=".6"/>
    <path d="M30 84Q30 38 131 38Q232 38 232 84" fill="none" stroke="#5a3300" stroke-width="11"/><path d="M30 84Q30 38 131 38Q232 38 232 84" fill="none" stroke="#ffcf2e" stroke-width="7"/>
    <path d="M44 112V86Q44 52 90 43" fill="none" stroke="#5a3300" stroke-width="27"/><path d="M44 112V86Q44 52 90 43" fill="none" stroke="url(#gd)" stroke-width="22"/>
    <path d="M218 112V86Q218 52 172 43" fill="none" stroke="#5a3300" stroke-width="27"/><path d="M218 112V86Q218 52 172 43" fill="none" stroke="url(#gd)" stroke-width="22"/>
    <rect x="30" y="98" width="202" height="16" fill="url(#gd)" stroke="#2b1707" stroke-width="3"/>
    <circle cx="44" cy="106" r="4" fill="url(#gd)" stroke="#5a3300" stroke-width="1.8"/><circle cx="43" cy="105" r="1.2" fill="#fff" opacity=".8"/><circle cx="218" cy="106" r="4" fill="url(#gd)" stroke="#5a3300" stroke-width="1.8"/><circle cx="217" cy="105" r="1.2" fill="#fff" opacity=".8"/><circle cx="131" cy="106" r="4" fill="url(#gd)" stroke="#5a3300" stroke-width="1.8"/><circle cx="130" cy="105" r="1.2" fill="#fff" opacity=".8"/><circle cx="44" cy="80" r="4" fill="url(#gd)" stroke="#5a3300" stroke-width="1.8"/><circle cx="43" cy="79" r="1.2" fill="#fff" opacity=".8"/><circle cx="218" cy="80" r="4" fill="url(#gd)" stroke="#5a3300" stroke-width="1.8"/><circle cx="217" cy="79" r="1.2" fill="#fff" opacity=".8"/><circle cx="88" cy="106" r="4" fill="url(#gd)" stroke="#5a3300" stroke-width="1.8"/><circle cx="87" cy="105" r="1.2" fill="#fff" opacity=".8"/><circle cx="174" cy="106" r="4" fill="url(#gd)" stroke="#5a3300" stroke-width="1.8"/><circle cx="173" cy="105" r="1.2" fill="#fff" opacity=".8"/>
    <ellipse cx="131" cy="43" rx="10" ry="7" fill="url(#tg)" stroke="#5a3300" stroke-width="2.5"/>
    <circle cx="52" cy="66" r="14" fill="url(#gd)" stroke="#5a3300" stroke-width="2.5"/><circle cx="52" cy="66" r="11" fill="url(#pg)" stroke="#4a0f6a" stroke-width="1.5"/><ellipse cx="48.7" cy="62.1" rx="3.8" ry="2.4" fill="#fff" opacity=".8"/><circle cx="210" cy="64" r="14" fill="url(#gd)" stroke="#5a3300" stroke-width="2.5"/><circle cx="210" cy="64" r="11" fill="url(#pg)" stroke="#4a0f6a" stroke-width="1.5"/><ellipse cx="206.7" cy="60.1" rx="3.8" ry="2.4" fill="#fff" opacity=".8"/>
    <path class="gl" style="animation-delay:0s" transform="translate(52,62) scale(1.1)" d="M0-10L2.2-2.2 10 0 2.2 2.2 0 10-2.2 2.2-10 0-2.2-2.2Z" fill="#fff"/><path class="gl" style="animation-delay:1.1s" transform="translate(210,60) scale(1.1)" d="M0-10L2.2-2.2 10 0 2.2 2.2 0 10-2.2 2.2-10 0-2.2-2.2Z" fill="#fff"/><path class="gl" style="animation-delay:0.6s" transform="translate(128,40) scale(0.8)" d="M0-10L2.2-2.2 10 0 2.2 2.2 0 10-2.2 2.2-10 0-2.2-2.2Z" fill="#fff"/>
   </g>
   <g id="chL"><ellipse cx="36" cy="190" rx="10" ry="6" fill="none" stroke="#5a3300" stroke-width="7.5"/><ellipse cx="36" cy="190" rx="10" ry="6" fill="none" stroke="#ffd23f" stroke-width="4.2"/><ellipse cx="48" cy="193" rx="4.5" ry="7.5" fill="none" stroke="#5a3300" stroke-width="7.5"/><ellipse cx="48" cy="193" rx="4.5" ry="7.5" fill="none" stroke="#ffd23f" stroke-width="4.2"/><ellipse cx="60" cy="195" rx="10" ry="6" fill="none" stroke="#5a3300" stroke-width="7.5"/><ellipse cx="60" cy="195" rx="10" ry="6" fill="none" stroke="#ffd23f" stroke-width="4.2"/><ellipse cx="72" cy="196" rx="4.5" ry="7.5" fill="none" stroke="#5a3300" stroke-width="7.5"/><ellipse cx="72" cy="196" rx="4.5" ry="7.5" fill="none" stroke="#ffd23f" stroke-width="4.2"/><ellipse cx="84" cy="195" rx="10" ry="6" fill="none" stroke="#5a3300" stroke-width="7.5"/><ellipse cx="84" cy="195" rx="10" ry="6" fill="none" stroke="#ffd23f" stroke-width="4.2"/><ellipse cx="96" cy="193" rx="4.5" ry="7.5" fill="none" stroke="#5a3300" stroke-width="7.5"/><ellipse cx="96" cy="193" rx="4.5" ry="7.5" fill="none" stroke="#ffd23f" stroke-width="4.2"/></g><g id="chR"><ellipse cx="168" cy="193" rx="10" ry="6" fill="none" stroke="#5a3300" stroke-width="7.5"/><ellipse cx="168" cy="193" rx="10" ry="6" fill="none" stroke="#ffd23f" stroke-width="4.2"/><ellipse cx="180" cy="195" rx="4.5" ry="7.5" fill="none" stroke="#5a3300" stroke-width="7.5"/><ellipse cx="180" cy="195" rx="4.5" ry="7.5" fill="none" stroke="#ffd23f" stroke-width="4.2"/><ellipse cx="192" cy="196" rx="10" ry="6" fill="none" stroke="#5a3300" stroke-width="7.5"/><ellipse cx="192" cy="196" rx="10" ry="6" fill="none" stroke="#ffd23f" stroke-width="4.2"/><ellipse cx="204" cy="195" rx="4.5" ry="7.5" fill="none" stroke="#5a3300" stroke-width="7.5"/><ellipse cx="204" cy="195" rx="4.5" ry="7.5" fill="none" stroke="#ffd23f" stroke-width="4.2"/><ellipse cx="216" cy="193" rx="10" ry="6" fill="none" stroke="#5a3300" stroke-width="7.5"/><ellipse cx="216" cy="193" rx="10" ry="6" fill="none" stroke="#ffd23f" stroke-width="4.2"/><ellipse cx="228" cy="191" rx="4.5" ry="7.5" fill="none" stroke="#5a3300" stroke-width="7.5"/><ellipse cx="228" cy="191" rx="4.5" ry="7.5" fill="none" stroke="#ffd23f" stroke-width="4.2"/><ellipse cx="238" cy="198" rx="10" ry="6" fill="none" stroke="#5a3300" stroke-width="7.5"/><ellipse cx="238" cy="198" rx="10" ry="6" fill="none" stroke="#ffd23f" stroke-width="4.2"/><ellipse cx="240" cy="212" rx="4.5" ry="7.5" fill="none" stroke="#5a3300" stroke-width="7.5"/><ellipse cx="240" cy="212" rx="4.5" ry="7.5" fill="none" stroke="#ffd23f" stroke-width="4.2"/></g>
   <path d="M86 166Q84 114 131 112Q178 114 176 166Q176 184 160 190L102 190Q86 184 86 166Z" fill="url(#sg)" stroke="#35352f" stroke-width="3.5"/>
   <ellipse cx="102" cy="128" rx="12" ry="6" fill="#5f8a2e" opacity=".85"/><ellipse cx="164" cy="176" rx="11" ry="6" fill="#4a7522" opacity=".85"/><ellipse cx="146" cy="122" rx="8" ry="4" fill="#6f9a37" opacity=".8"/>
   <circle cx="112" cy="150" r="17" fill="#ece8dc" stroke="#35352f" stroke-width="3"/><g class="eye"><polygon points="112,137 123,150 112,163 101,150" fill="url(#eg)" stroke="#6e0d0d" stroke-width="2"/><path d="M101 150L123 150M112 137L112 163" stroke="#ffd2a0" stroke-width="1" opacity=".55"/><ellipse cx="109" cy="145" rx="3" ry="2" fill="#fff" opacity=".8"/></g><circle cx="150" cy="150" r="17" fill="#ece8dc" stroke="#35352f" stroke-width="3"/><g class="eye"><polygon points="150,137 161,150 150,163 139,150" fill="url(#eg)" stroke="#6e0d0d" stroke-width="2"/><path d="M139 150L161 150M150 137L150 163" stroke="#ffd2a0" stroke-width="1" opacity=".55"/><ellipse cx="147" cy="145" rx="3" ry="2" fill="#fff" opacity=".8"/></g>
   <path d="M131 164L124 178H138Z" fill="#35352f"/>
   <g id="jaw"><path d="M104 188H158V216Q158 222 152 222H110Q104 222 104 216Z" fill="url(#sg)" stroke="#35352f" stroke-width="3"/>
    <path d="M114 190V220M124 190V220M134 190V220M144 190V220" stroke="#35352f" stroke-width="2"/><ellipse cx="148" cy="212" rx="8" ry="4" fill="#4a7522" opacity=".8"/></g>
   <circle cx="210" cy="206" r="15" fill="url(#gd)" stroke="#5a3300" stroke-width="2.5"/><circle cx="210" cy="206" r="12" fill="url(#pg)" stroke="#4a0f6a" stroke-width="1.5"/><ellipse cx="206.4" cy="201.8" rx="4.2" ry="2.6" fill="#fff" opacity=".8"/><path class="gl" style="animation-delay:0.4s" transform="translate(210,202) scale(1)" d="M0-10L2.2-2.2 10 0 2.2 2.2 0 10-2.2 2.2-10 0-2.2-2.2Z" fill="#fff"/>
   <path class="gl" style="animation-delay:0.9s" transform="translate(112,146) scale(0.8)" d="M0-10L2.2-2.2 10 0 2.2 2.2 0 10-2.2 2.2-10 0-2.2-2.2Z" fill="#fff"/><path class="gl" style="animation-delay:1.6s" transform="translate(150,146) scale(0.8)" d="M0-10L2.2-2.2 10 0 2.2 2.2 0 10-2.2 2.2-10 0-2.2-2.2Z" fill="#fff"/>
      </svg>
    </div>

    <div class="btns">
      <v-btn v-for="b in OPEN" :key="b.n" variant="flat" :class="{p:b.n===1}" :data-n="b.n" @click="openMany(b.n)">{{ b.l }}</v-btn>
    </div>
    <div class="btns">
      <v-btn id="auto" class="p" variant="flat" @click="call('toggleAuto')">{{ ui.auto ? '■ Stop' : '▶ Open until Pirate Token' }}</v-btn>
      <v-btn id="week" variant="flat" @click="call('newWeek')">New week</v-btn>
      <v-btn id="reset" variant="flat" @click="call('resetAll')">Reset all</v-btn>
      <v-btn id="mute" variant="flat" title="Sound" @click="ui.muted=!ui.muted">{{ ui.muted ? '🔇' : '🔊' }}</v-btn>
    </div>
    <div class="chkw">
      <v-checkbox id="once" v-model="ui.once" color="#ff8a1f" density="compact" hide-details label="Weekly treasures are one-time (Gizmos repeat)" />
    </div>
    <div id="result"><span class="mute">Open a chest to see what drops.</span></div>
    <div id="slots">
      <div v-for="r in R" :key="r.id" class="slot" :class="{has:S.hits[r.id],ping:ping[r.id]}" :style="{'--c':r.c}" :title="r.name">{{ r.i }}<b v-if="S.hits[r.id]">{{ S.hits[r.id] }}</b></div>
    </div>
    <div class="hint">Keys: Space = open · 1–5 = ×1 / 10 / 100 / 1k / 10k · A = auto · M = mute</div>
  </v-card>
</template>

<script setup>
import { reactive, watch, nextTick } from 'vue'
import { ui, S, R, MODES, WK, engine, setWeek } from '../game/store.js'
import { openChestsBatch } from '../game/drops.js'

const OPEN = [
  { n: 1, l: 'Open 1' }, { n: 10, l: '×10' }, { n: 100, l: '×100' },
  { n: 1000, l: '×1,000' }, { n: 10000, l: '×10,000' }
]
const call = (fn, ...args) => engine.value?.[fn]?.(...args)

/**
 * Open `count` chests. All five buttons above call this with b.n, so write
 * the opening once and it works for ×1 through ×10,000.
 *
 * Tools you can reach from here:
 *   openChestsBatch(count)            rolls the chests, updates every counter
 *                                     in S, returns drops oldest-first as
 *                                     { tier, dupe, at, item }
 *   call('stopAuto')                  stop the "Open until Pirate Token" run
 *   paintResults(drops, count)        from overlays.js — the #result panel and
 *                                     the beam; returns { reward, isBatch, item }
 *   playReveal(reward, isBatch, item) from reveal.js — charge-up, lid, sparks
 *
 * openChestsBatch is imported below because it touches no DOM. The two paint
 * helpers only use the DOM inside their functions, so importing them here is
 * safe too — engine.js is the only module that touches the DOM on load.
 */
function openMany(count) {
  console.log(count)
}

// Slot "ping" animation when a reward count goes up
const ping = reactive({})
const timers = {}
watch(() => ({ ...S.hits }), (now, before) => {
  for (const id in now) {
    if (now[id] > (before[id] || 0)) {
      ping[id] = false
      clearTimeout(timers[id])
      nextTick(() => {
        ping[id] = true
        timers[id] = setTimeout(() => { ping[id] = false }, 700)
      })
    }
  }
})
</script>
