/**
 * The seven reward tiers of R (store.js), addressed by id.
 *
 * The effect code used to compare `r.id === 'gold' || r.id === 'token'` in
 * half a dozen places; these helpers keep that knowledge in one spot.
 */
import { R } from './store.js'

/** { gold: 0, token: 1, veh: 2, … } — the index of each tier in R. */
export const TIER = Object.fromEntries(R.map((reward, index) => [reward.id, index]))

/** Index of the Pirate Shop Access token, the rarest "win" the auto mode hunts for. */
export const TOKEN_TIER = TIER.token

/** The two drops that get the extra-long, extra-loud treatment. */
export function isSupreme(reward) {
  return reward.id === 'gold' || reward.id === 'token'
}

/** The Weekly Gold Outfit: the one drop that always gets the full fanfare. */
export function isGoldOutfit(reward) {
  return reward.id === 'gold'
}
