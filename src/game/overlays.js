/**
 * Everything the engine paints outside the chest itself: the result panel,
 * the loot icons, the victory banner and the showcase card.
 *
 * The markup is built here as HTML strings because these fragments are
 * rewritten wholesale on every open; the elements live in
 * components/Overlays.vue and components/ChestPanel.vue.
 */
import { R, fmt } from './store.js'
import {
  $,
  setBeam,
  forceReflow,
  restartAnimation,
  PLAIN_BEAM,
  TOKEN_ORANGE
} from './dom.js'
import { confetti } from './particles.js'
import { EMBLEM, SHOWCASE_ART, EQUALISER, gizmoArt, artKeyFor } from './art.js'
import { isSupreme, isGoldOutfit } from './tiers.js'

/** Gold used for the headline of the Pirate Shop Access message. */
const TOKEN_HEADLINE = '#ffc83d'

/* ----------------------------------------------------------- result panel */

/** Replace the result panel with `html`. */
export function setResultHtml(html) {
  $('#result').innerHTML = html
}

/** A one-off line in the result panel, e.g. after a reset. */
export function setResultMessage(message) {
  setResultHtml(`<span class="mute">${message}</span>`)
}

/**
 * Paint the result panel and the beam for a finished batch, and return what
 * the reveal animation should play: { reward, isBatch, item }.
 *
 * @param drops         the drops from drops.js, oldest first
 * @param openedCount   how many chests were asked for (shown to the user)
 */
export function paintResults(drops, openedCount) {
  return openedCount === 1 ? paintSingleDrop(drops[0]) : paintBatch(drops, openedCount)
}

function paintSingleDrop(drop) {
  if (!drop) {
    setBeam(PLAIN_BEAM)
    setResultHtml(
      '<b class="mute">Just regular loot</b><div class="mute">No treasure this time</div>'
    )
    return { reward: null, isBatch: false, item: undefined }
  }

  const reward = R[drop.tier]
  setBeam(reward.c)
  setResultHtml(
    `<div style="font-size:30px">${reward.i}</div>` +
      `<b style="color:${reward.c}">${drop.item.name}</b>` +
      `<div class="mute">${drop.item.type}</div>` +
      (drop.dupe
        ? '<div class="mute">Already owned this week — no new reward</div>'
        : '<div class="mute">New treasure!</div>')
  )
  return { reward, isBatch: false, item: drop.item }
}

function paintBatch(drops, openedCount) {
  // One chip per reward tier, with how often it dropped.
  const counts = {}
  for (const drop of drops) {
    const id = R[drop.tier].id
    counts[id] = (counts[id] || 0) + 1
  }
  const chips = R.filter(reward => counts[reward.id])
    .map(
      reward =>
        `<span class="chip" style="color:${reward.c}">${reward.i} ${counts[reward.id]}× ${reward.name}</span>`
    )
    .join('')

  setResultHtml(
    `<b>Opened ${fmt(openedCount)} chests</b><div>${chips || '<span class="mute">No treasures</span>'}</div>`
  )

  // Rarest drop of the batch, i.e. the lowest tier index.
  const best = drops.length ? Math.min(...drops.map(drop => drop.tier)) : undefined
  const bestDrop = best === undefined ? null : drops.find(drop => drop.tier === best)

  setBeam(bestDrop ? R[best].c : PLAIN_BEAM)
  return {
    reward: bestDrop ? R[bestDrop.tier] : null,
    isBatch: true,
    item: bestDrop ? bestDrop.item : null
  }
}

/** Shown when the "open until token" run hits a Pirate Shop Access token. */
export function paintTokenFound(drop) {
  setBeam(TOKEN_ORANGE)
  setResultHtml(
    `<div style="font-size:30px">🪙</div>` +
      `<b style="color:${TOKEN_ORANGE}">Pirate Shop Access!</b>` +
      `<div class="mute">Found on chest #${fmt(drop.at)}${drop.dupe ? ' (already owned)' : ''}</div>`
  )
}

/* -------------------------------------------------------------------- loot */

const LOOT_ICONS = ['🔫', '🛡️', '🧪', '🍎', '💣', '🪓']
const LOOT_GLOW_COLORS = ['#9db4d6', '#3ddc97', '#4db8ff', '#b46bff', '#ff8a1f']
const LOOT_COUNT = 4
const LOOT_STEP_X = 54 // px between the four icons
const LOOT_RISE_MIN = 40 // how far they fly up
const LOOT_RISE_RANGE = 30
const LOOT_CLEAR_MS = 1700

/** Tumble a handful of ordinary loot icons out of the chest. */
export function spawnLoot() {
  const loot = $('#loot')
  loot.innerHTML = ''

  for (let i = 0; i < LOOT_COUNT; i++) {
    const icon = document.createElement('span')
    icon.textContent = LOOT_ICONS[(Math.random() * LOOT_ICONS.length) | 0]
    icon.style.cssText =
      `--dx:${(i - 1.5) * LOOT_STEP_X}px;` +
      `--dy:${LOOT_RISE_MIN + Math.random() * LOOT_RISE_RANGE}px;` +
      `--rc:${LOOT_GLOW_COLORS[(Math.random() * LOOT_GLOW_COLORS.length) | 0]};` +
      `animation-delay:${i * 70}ms`
    loot.appendChild(icon)
  }

  setTimeout(() => {
    loot.innerHTML = ''
  }, LOOT_CLEAR_MS)
}

/* ------------------------------------------------------------------ banner */

const BANNER_SECONDS_GOLD = 6.6
const BANNER_SECONDS_SUPREME = 4.8
const BANNER_SECONDS_PLAIN = 3
const DIM_MS_PER_SECOND = 900 // how long the screen stays dimmed per banner second

let dimTimer = 0

/** Fly the "YOU FOUND …" banner and its ghosted headline across the screen. */
export function showBanner(reward, isBatch, item) {
  const banner = $('#banner')
  const ghost = $('#ghost')
  const supreme = isSupreme(reward)
  const name = (item ? item.name : reward.name).toUpperCase()
  const seconds = isGoldOutfit(reward)
    ? BANNER_SECONDS_GOLD
    : supreme
      ? BANNER_SECONDS_SUPREME
      : BANNER_SECONDS_PLAIN

  banner.style.setProperty('--bd', seconds + 's')
  ghost.style.setProperty('--bd', seconds + 's')

  banner.firstElementChild.innerHTML =
    EMBLEM +
    `<small>${isBatch ? 'BEST OF THE BATCH · ' : ''}YOU FOUND</small>` +
    `<span class="tt">${name}</span>` +
    '<i class="wing l"></i><i class="wing r"></i>'
  ghost.textContent = name

  restartAnimation(banner, 'go')
  restartAnimation(ghost, 'go')

  clearTimeout(dimTimer)
  $('#dim').classList.add('on')
  dimTimer = setTimeout(() => $('#dim').classList.remove('on'), seconds * DIM_MS_PER_SECOND)

  confetti(supreme ? 170 : 90)

  if (reward.id === 'token') {
    setResultHtml(
      '<div style="font-size:30px">🪙</div>' +
        `<b style="color:${TOKEN_HEADLINE}">Pirate Shop Access (2026) + (2027)</b>` +
        '<div class="mute">Your whole squad gets it too. Item Shop → “Plunder the Item Shop” → ' +
        'Activate Now. 2026 token must be activated by Dec 15, 2026.</div>'
    )
  }
}

/* ---------------------------------------------------------------- showcase */

const SHOWCASE_DELAY_GOLD_MS = 1500
const SHOWCASE_DELAY_MS = 900
const SHOWCASE_HOLD_GOLD_MS = 10000
const SHOWCASE_HOLD_SUPREME_MS = 8000
const SHOWCASE_HOLD_MS = 5200

let showcaseDelayTimer = 0
let showcaseHoldTimer = 0

/** Pop the item card with its artwork in the middle of the screen. */
export function showShowcase(reward, item) {
  if (!item) return

  const card = $('#show')
  const supreme = isSupreme(reward)
  const artKey = artKeyFor(reward, item)
  const art = artKey === 'giz' ? gizmoArt(item.e) : SHOWCASE_ART[artKey]
  const equaliser = artKey === 'jam' ? EQUALISER : ''

  clearTimeout(showcaseDelayTimer)
  clearTimeout(showcaseHoldTimer)
  card.classList.remove('on')

  showcaseDelayTimer = setTimeout(() => {
    card.style.setProperty('--c', reward.c)
    card.innerHTML =
      `<div class="ic a-${artKey}${supreme ? ' sup' : ''}">` +
      '<div class="rays2"></div>' +
      `<div class="art">${art}${equaliser}</div>` +
      `<div class="tg">${item.type}${supreme ? ' · Supreme' : ''}</div>` +
      `<div class="nm">${item.name}</div>` +
      `<div class="sb">${item.sub || ''}</div>` +
      '</div>'
    forceReflow(card)
    card.classList.add('on')

    const hold = isGoldOutfit(reward)
      ? SHOWCASE_HOLD_GOLD_MS
      : supreme
        ? SHOWCASE_HOLD_SUPREME_MS
        : SHOWCASE_HOLD_MS
    showcaseHoldTimer = setTimeout(() => card.classList.remove('on'), hold)
  }, isGoldOutfit(reward) ? SHOWCASE_DELAY_GOLD_MS : SHOWCASE_DELAY_MS)
}

/** Dismiss the card (click or Escape). */
export function hideShowcase() {
  $('#show').classList.remove('on')
}
