/**
 * Static artwork for the treasure showcase card and the victory banner.
 *
 * These are plain SVG strings injected into #show / #banner; keeping them here
 * keeps the effect code down to behaviour instead of markup. The drawing of
 * each reward is hand-built, so the strings below are intentionally literal —
 * the gradient id "ga" has to stay in sync with the ids they reference.
 */

/** Shared gold gradient, defined once per card. */
const GOLD_GRADIENT =
  '<defs><linearGradient id="ga" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2a8"/><stop offset=".5" stop-color="#f6b800"/><stop offset="1" stop-color="#b86f00"/></linearGradient></defs>'

/** Shared outline for the filled shapes. */
const OUTLINE = 'stroke="#6b3d00" stroke-width="3" stroke-linejoin="round"'

/** The golden emblem that slams in behind a banner. */
export const EMBLEM = `<svg class="emb" viewBox="0 0 120 120"><defs><linearGradient id="eg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3a0"/><stop offset="1" stop-color="#ffa800"/></linearGradient></defs><polygon points="118.0,60.0 95.3,67.0 113.6,82.2 89.9,80.0 101.0,101.0 80.0,89.9 82.2,113.6 67.0,95.3 60.0,118.0 53.0,95.3 37.8,113.6 40.0,89.9 19.0,101.0 30.1,80.0 6.4,82.2 24.7,67.0 2.0,60.0 24.7,53.0 6.4,37.8 30.1,40.0 19.0,19.0 40.0,30.1 37.8,6.4 53.0,24.7 60.0,2.0 67.0,24.7 82.2,6.4 80.0,30.1 101.0,19.0 89.9,40.0 113.6,37.8 95.3,53.0" fill="#ffd23f" opacity=".85"/><rect x="24" y="24" width="72" height="72" rx="6" fill="url(#eg)" stroke="#fff8cc" stroke-width="4"/><rect x="32" y="32" width="56" height="56" rx="3" fill="#ffbe1a" stroke="#9a5800" stroke-width="2"/><circle cx="60" cy="60" r="21" fill="#fff6c9" stroke="#9a5800" stroke-width="3"/><text x="60" y="70" text-anchor="middle" font-size="30" font-weight="900" font-style="italic" fill="#9a5800" font-family="Barlow Condensed,Arial,sans-serif">F</text></svg>`

/** Showcase drawing per reward id, keyed by reward id. */
export const SHOWCASE_ART = {
  outfit: `<svg viewBox="0 0 200 200">${GOLD_GRADIENT}<g fill="url(#ga)" ${OUTLINE}><circle cx="100" cy="42" r="20"/><rect x="76" y="66" width="48" height="62" rx="14"/><rect x="52" y="70" width="20" height="60" rx="10" transform="rotate(12 62 70)"/><rect x="128" y="70" width="20" height="60" rx="10" transform="rotate(-12 138 70)"/><rect x="80" y="124" width="18" height="64" rx="8"/><rect x="102" y="124" width="18" height="64" rx="8"/></g></svg>`,
  pick: `<svg viewBox="0 0 200 200">${GOLD_GRADIENT}<g ${OUTLINE} transform="rotate(35 100 100)"><rect x="94" y="40" width="12" height="150" rx="5" fill="#8a5a2b"/><path d="M24 78Q100 6 176 78Q100 46 24 78Z" fill="url(#ga)"/></g></svg>`,
  back: `<svg viewBox="0 0 200 200">${GOLD_GRADIENT}<g ${OUTLINE}><path d="M72 48Q100 14 128 48" fill="none" stroke-width="8"/><rect x="55" y="45" width="90" height="125" rx="26" fill="url(#ga)"/><rect x="70" y="98" width="60" height="50" rx="12" fill="#1fa89c"/><path d="M78 124q10-14 22 0t22 0" stroke="#fff" stroke-width="4" fill="none"/></g></svg>`,
  veh: `<svg viewBox="0 0 200 200">${GOLD_GRADIENT}<g ${OUTLINE}><path d="M10 138L42 112 84 100 134 102 172 122 192 132V154H10Z" fill="url(#ga)"/><path d="M58 112L90 103 124 104 150 122 60 122Z" fill="#bfe3ff"/></g><g fill="#222" stroke="#aaa" stroke-width="3"><circle cx="54" cy="154" r="18"/><circle cx="150" cy="154" r="18"/></g><g fill="url(#ga)"><circle class="vin" cx="54" cy="154" r="8"/><circle class="vin" cx="150" cy="154" r="8"/></g></svg>`,
  jam: `<svg viewBox="0 0 200 200">${GOLD_GRADIENT}<g class="vin"><circle cx="100" cy="100" r="80" fill="#14141c" stroke="#444" stroke-width="3"/><circle cx="100" cy="100" r="60" fill="none" stroke="#2c2c3a" stroke-width="2"/><circle cx="100" cy="100" r="42" fill="none" stroke="#2c2c3a" stroke-width="2"/><circle cx="100" cy="100" r="24" fill="url(#ga)"/><circle cx="100" cy="100" r="4" fill="#14141c"/></g></svg>`,
  load: `<svg viewBox="0 0 200 200">${GOLD_GRADIENT}<rect x="22" y="30" width="156" height="140" rx="6" fill="url(#ga)" ${OUTLINE}/><rect x="34" y="42" width="132" height="116" fill="#2b4c9a"/><circle cx="130" cy="78" r="16" fill="#ffd23f"/><path d="M34 130q22-18 44 0t44 0 44 0V158H34Z" fill="#1d7ec9"/><path d="M34 146q22-14 44 0t44 0 44 0V158H34Z" fill="#0d4f8a"/></svg>`,
  token: `<svg viewBox="0 0 200 200">${GOLD_GRADIENT}<circle cx="100" cy="100" r="74" fill="url(#ga)" ${OUTLINE}/><circle cx="100" cy="100" r="56" fill="none" stroke="#9a5800" stroke-width="4"/><text x="100" y="128" text-anchor="middle" font-size="78" fill="#7a4a00">☠</text></svg>`
}

/** Reward id -> SHOWCASE_ART key. The Gold Outfit is drawn as an 'outfit'. */
const ART_KEY_BY_REWARD = {
  gold: 'outfit',
  token: 'token',
  veh: 'veh',
  jam: 'jam',
  load: 'load',
  giz: 'giz'
}

/**
 * Which showcase drawing a reward uses. The pickaxe tier covers two kinds of
 * item, so the drop itself decides between a pickaxe and a back bling.
 */
export function artKeyFor(reward, item) {
  if (reward.id === 'pick') return item.type === 'Pickaxe' ? 'pick' : 'back'
  return ART_KEY_BY_REWARD[reward.id]
}

/** A gizmo is drawn as the item's own emoji on a hexagonal tech plate. */
export function gizmoArt(emoji) {
  return `<svg viewBox="0 0 200 200"><polygon points="100,14 176,56 176,144 100,186 24,144 24,56" fill="#10223f" stroke="#8fd3ff" stroke-width="4"/><text x="100" y="128" text-anchor="middle" font-size="80">${emoji}</text></svg>`
}

/** Extra markup for the jam track card: a five-bar equaliser. */
export const EQUALISER = '<div class="eq"><i></i><i></i><i></i><i></i><i></i></div>'
