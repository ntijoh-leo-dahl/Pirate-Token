/**
 * The reveal timeline — the heart of the effect engine.
 *
 * One open runs through four phases:
 *
 *   1. clear   every class from the previous open is taken back off the stage
 *   2. charge  the chest shakes and glows for CHARGE_MS, tinted per tier
 *   3. reveal  the lid pops, the stage lights up, sparks/banner/sound/card fire
 *   4. settle  the chest closes again once the treasure has been admired
 *
 * The classes themselves are styled in styles/legacy.css (cv-<reward id>,
 * tcharge, open, lit, tch …). The order of the calls below is the order the
 * animations and sounds line up in, so keep it if you edit this file.
 */
import { R } from './store.js'
import {
  $,
  setBeam,
  forceReflow,
  restartAnimation,
  GOLD,
  WHITE,
  SPARK_ORANGE,
  SPARK_ICE
} from './dom.js'
import { burst, confetti } from './particles.js'
import { playChargeSound, playOpenSound, playRewardTheme } from './audio.js'
import { spawnLoot, showBanner, showShowcase } from './overlays.js'
import { isSupreme, isGoldOutfit } from './tiers.js'

/** How long each tier shakes and glows before the lid pops, in ms. */
const CHARGE_MS = {
  gold: 4600,
  token: 3400,
  veh: 2800,
  pick: 2200,
  jam: 2600,
  load: 1900,
  giz: 1400
}

const BATCH_CHARGE_MS = 1300 // a ×1,000 run cannot wait four seconds per open
const EMPTY_CHARGE_MS = 0 // an ordinary chest does not charge up at all
const EMPTY_REVEAL_DELAY_MS = 260 // but the closed lid is still held briefly

const SETTLE_SUPREME_MS = 4200 // how long the lit stage stays up afterwards
const SETTLE_TREASURE_MS = 2400
const SETTLE_EMPTY_MS = 1600

const BURST_SUPREME = 200 // sparks flying out of the chest
const BURST_TREASURE = 90
const BURST_PICKAXE = 60
const BURST_GIZMO = 40
const GOLD_CONFETTI = 260

const GOLD_RING_INTERVAL_MS = 800 // ring pulses during a lone gold charge-up
const RING_PULSE_SPACING_GOLD_MS = 350
const RING_PULSE_SPACING_JAM_MS = 200
const SPEED_LINES_MS = 900
const QUAKE_MS = 550

/** Timeout handle for the phase currently scheduled (charge → reveal → settle). */
let revealTimer = 0
/** Interval handle for the gold charge-up rings. */
let goldRingTimer = 0

/** Expand the ring around the chest once. */
function playRing() {
  restartAnimation($('#ring'), 'go')
}

/**
 * Play the whole opening animation for a finished batch.
 *
 * @param reward  the reward to celebrate, or null for an ordinary chest
 * @param isBatch true when many chests were opened at once
 * @param item    the item that drop represented, for the banner and the card
 */
export function playReveal(reward, isBatch, item) {
  const chest = $('#chest')
  const result = $('#result')
  const stage = $('.stage')

  const hasTreasure = !!reward
  const supreme = hasTreasure && isSupreme(reward)
  const color = hasTreasure ? reward.c : GOLD
  const chargeMs = hasTreasure
    ? isBatch
      ? BATCH_CHARGE_MS
      : CHARGE_MS[reward.id]
    : EMPTY_CHARGE_MS

  clearTimeout(revealTimer)
  clearStage(chest, result, stage)

  stage.style.setProperty('--c', color)
  result.style.setProperty('--c', color)
  if (!hasTreasure) setBeam(GOLD)

  if (hasTreasure) startChargeUp(chest, stage, reward, isBatch, chargeMs)

  revealTimer = setTimeout(() => {
    revealTreasure(chest, result, stage, reward, isBatch, item, supreme)
  }, hasTreasure ? chargeMs : EMPTY_REVEAL_DELAY_MS)
}

/** Phase 1: take everything the previous open left behind off the stage. */
function clearStage(chest, result, stage) {
  chest.classList.remove('open', 'intro', 'tcharge', ...R.map(reward => 'cv-' + reward.id))
  clearInterval(goldRingTimer)
  stage.classList.remove('lit', 'tch')
  result.classList.add('hide')
  $('#banner').classList.remove('go')
  $('#ghost').classList.remove('go')
  $('#dim').classList.remove('on')
}

/** Phase 2: shake, tint and soundtrack of the build-up. */
function startChargeUp(chest, stage, reward, isBatch, chargeMs) {
  chest.style.setProperty('--dur', chargeMs + 'ms')
  forceReflow(chest) // make the new --dur take effect before the animation starts
  chest.classList.add('tcharge', 'cv-' + reward.id)
  stage.classList.add('tch')
  playChargeSound(chargeMs)

  // A single gold outfit also pulses a ring while it charges.
  if (isGoldOutfit(reward) && !isBatch) {
    goldRingTimer = setInterval(playRing, GOLD_RING_INTERVAL_MS)
  }
}

/** Phase 3 and 4: the lid pops, everything fires, then the stage calms down. */
function revealTreasure(chest, result, stage, reward, isBatch, item, supreme) {
  const hasTreasure = !!reward

  chest.classList.remove('tcharge', ...R.map(other => 'cv-' + other.id))
  clearInterval(goldRingTimer)
  stage.classList.remove('tch')
  chest.classList.add('open')

  // Wipe the faded result panel and let its content pop in.
  result.classList.remove('hide', 'pop')
  forceReflow(result)
  result.classList.add('pop')

  if (hasTreasure) {
    stage.classList.add('lit')
    playRing()
    burst(reward.c, supreme ? BURST_SUPREME : BURST_TREASURE, true)
    showBanner(reward, isBatch, item)
    playOpenSound(reward)
    playRewardTheme(reward)
    spawnLoot()
    playRewardFlourish(reward)
    showShowcase(reward, item)
    flashScreen()
    quakeScreen()
  } else {
    spawnLoot()
    playOpenSound(null)
  }

  const settleMs = hasTreasure
    ? supreme
      ? SETTLE_SUPREME_MS
      : SETTLE_TREASURE_MS
    : SETTLE_EMPTY_MS

  revealTimer = setTimeout(() => {
    chest.classList.remove('open')
    stage.classList.remove('lit')
  }, settleMs)
}

/** A short extra flourish that suits the particular treasure. */
function playRewardFlourish(reward) {
  const stage = $('.stage')
  $('#ring').style.borderColor = isSupreme(reward) ? WHITE : reward.c

  if (reward.id === 'jam' || isGoldOutfit(reward)) {
    // Extra ring pulses, on the beat for a jam track, fast for the gold outfit.
    const spacing = isGoldOutfit(reward) ? RING_PULSE_SPACING_GOLD_MS : RING_PULSE_SPACING_JAM_MS
    for (const pulse of [1, 2, 3]) setTimeout(playRing, pulse * spacing)
  }

  if (reward.id === 'veh') {
    // Speed lines behind the chest.
    stage.classList.add('speed')
    setTimeout(() => stage.classList.remove('speed'), SPEED_LINES_MS)
  }

  if (reward.id === 'pick') burst(SPARK_ORANGE, BURST_PICKAXE, false)
  if (reward.id === 'giz') burst(SPARK_ICE, BURST_GIZMO, false)

  if (isGoldOutfit(reward)) {
    confetti(GOLD_CONFETTI)
    quakeScreen()
  }
}

/** White flash over the whole page. */
function flashScreen() {
  const flash = $('#flash')
  flash.style.setProperty('--c', WHITE)
  restartAnimation(flash, 'go')
}

/** Shake the page once. */
function quakeScreen() {
  document.body.classList.add('quake')
  setTimeout(() => document.body.classList.remove('quake'), QUAKE_MS)
}
