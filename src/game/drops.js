/**
 * The dice. Turns "open n chests" into a list of drops and keeps the counters
 * in store.js in sync. Nothing in here touches the DOM — see reveal.js and
 * overlays.js for that.
 */
import { ui, S, R, probs, itemFor } from './store.js'
import { randomFraction } from './rng.js'
import { TOKEN_TIER } from './tiers.js'

/** The drop log is trimmed to this many entries after every batch. */
const MAX_LOG_ENTRIES = 60

/**
 * Roll one chest against the tier probabilities and return its index in R.
 *
 * The published odds do not add up to exactly 1, so a roll can land in the
 * sliver past the last tier. That is a real outcome — an ordinary chest with
 * no treasure — and is reported as -1.
 */
function rollTier(probabilities) {
  let remaining = randomFraction()
  for (let tier = 0; tier < probabilities.length; tier++) {
    if (remaining < probabilities[tier]) return tier
    remaining -= probabilities[tier]
  }
  return -1
}

/**
 * Claim a weekly treasure. Returns true when the drop is a repeat that gives
 * nothing new, i.e. a once-per-week reward that is already owned while the
 * "one-time" checkbox is ticked.
 */
function claimReward(reward, weeklyRewardsAreOneTime) {
  if (!reward.once) return false // Gizmos always stack
  if (weeklyRewardsAreOneTime && S.owned.has(reward.id)) return true
  S.owned.add(reward.id)
  return false
}

/** Count an item in the locker display (store.js `S.locker`). */
function addToLocker(itemName) {
  const entry = S.locker[itemName] || (S.locker[itemName] = { n: 0 })
  entry.n++
}

/**
 * Open `count` chests, updating every counter and the drop log.
 * Returns the drops, oldest first, as { tier, dupe, at, item }.
 */
export function openChests(count) {
  const probabilities = probs()
  const oneTime = ui.once
  const drops = []

  for (let i = 0; i < count; i++) {
    const tier = rollTier(probabilities)
    S.opened++
    if (tier < 0) continue // ordinary loot, no treasure

    const reward = R[tier]
    const dupe = claimReward(reward, oneTime)

    S.hits[reward.id]++
    if (dupe) S.dupes[reward.id]++
    if (tier === TOKEN_TIER) S.lastTok = S.opened

    const drop = { tier, dupe, at: S.opened, item: itemFor(reward) }
    if (!dupe) addToLocker(drop.item.name)

    drops.push(drop)
    S.log.unshift(drop)
  }

  if (S.log.length > MAX_LOG_ENTRIES) S.log.length = MAX_LOG_ENTRIES
  return drops
}

/**
 * Open `count` chests and add the expected values this batch contributes to
 * the stats table (chance-of-a-token and the Expected column).
 */
export function openChestsBatch(count) {
  const probabilities = probs()
  const drops = openChests(count)

  ui.tokExp += probabilities[TOKEN_TIER] * count
  probabilities.forEach((probability, tier) => {
    S.expAll[tier] += probability * count
  })

  return drops
}
