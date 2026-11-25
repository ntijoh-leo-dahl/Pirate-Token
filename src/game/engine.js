/*
 * Effects engine for the chest simulator.
 *
 * This module drives the canvas, banner, sounds and showcase card directly
 * through the DOM, so it is imported dynamically only after Vue has mounted
 * those elements (see views/SimulatorView.vue). All game *state* lives in
 * store.js; the modules below each own one kind of effect:
 *
 *   drops.js      roll the chests and update the counters   (no DOM at all)
 *   reveal.js     the charge-up → open → reveal → settle timeline
 *   overlays.js   result panel, loot icons, banner, item card
 *   particles.js  sparks and confetti
 *   audio.js      synthesised sound
 *   art.js        the SVG artwork as strings
 *   dom.js        element lookup and small style helpers
 *
 * What ChestPanel.vue calls is exported at the bottom of this file.
 */
import { ui, S, R, fresh } from './store.js'
import { openChestsBatch } from './drops.js'
import { TOKEN_TIER } from './tiers.js'
import { $ } from './dom.js'
import { playReveal } from './reveal.js'
import { paintTokenFound, setResultMessage, hideShowcase } from './overlays.js'

/* ------------------------------------------------------------------- auto */

const AUTO_BATCH_SIZE = 2500 // chests per tick
const AUTO_TICK_MS = 40 // 2500 every 40 ms is a smooth "rolling" count

/** @type {ReturnType<typeof setInterval>|null} the running auto-open, if any */
let autoTimer = null

/** Stop the auto-open run. Exported so ChestPanel.vue can call it via call(). */
export function stopAuto() {
  if (autoTimer) {
    clearInterval(autoTimer)
    autoTimer = null
  }
  ui.auto = false
}

/* ------------------------------------------------------------- public API */

/** Start or stop opening chests until a Pirate Shop Access token drops. */
export function toggleAuto() {
  if (autoTimer) {
    stopAuto()
    return
  }

  ui.auto = true
  autoTimer = setInterval(() => {
    const drops = openChestsBatch(AUTO_BATCH_SIZE)
    const token = drops.find(drop => drop.tier === TOKEN_TIER)
    if (!token) return

    stopAuto()
    paintTokenFound(token)
    playReveal(R[TOKEN_TIER], false, token.item)
  }, AUTO_TICK_MS)
}

/** Let the weekly treasures drop again, as if a new week had started. */
export function newWeek() {
  S.owned.clear()
  setResultMessage('New week — weekly treasures can drop again.')
}

/** Wipe every counter back to zero. */
export function resetAll() {
  stopAuto()
  Object.assign(S, fresh())
  ui.tokExp = 0
  setResultMessage('Open a chest to see what drops.')
}



const EYE_REACH_PX = 300 // pointer travel that counts as a full deflection
const EYE_SHIFT_PX = 3.5 // how far the eyes move at full deflection

/** Let the chest's eyes follow the pointer. */
addEventListener('pointermove', event => {
  const chest = $('#chest').getBoundingClientRect()
  const clamp = value => Math.max(-1, Math.min(1, value / EYE_REACH_PX))
  const dx = clamp(event.clientX - chest.left - chest.width / 2)
  const dy = clamp(event.clientY - chest.top - chest.height * 0.5)

  document
    .querySelectorAll('#chest .eye')
    .forEach(eye => {
      eye.style.translate = `${dx * EYE_SHIFT_PX}px ${dy * EYE_SHIFT_PX}px`
    })
})

/* ------------------------------------------------------- intro and dismiss */

// Close the item card on a click or Escape.
$('#show').onclick = hideShowcase
addEventListener('keydown', event => {
  if (event.key === 'Escape') hideShowcase()
})

// The chest drops in from the top the first time you see it.
const CHEST_INTRO_MS = 1000
$('#chest').classList.add('intro')
setTimeout(() => $('#chest').classList.remove('intro'), CHEST_INTRO_MS)
