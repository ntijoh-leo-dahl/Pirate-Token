/**
 * Shared DOM helpers for the effect modules.
 *
 * The overlay and stage elements are looked up per call rather than cached at
 * import time. engine.js is only imported after Vue has mounted them (see
 * views/SimulatorView.vue), and lazy lookups also survive a hot reload that
 * re-creates the markup.
 */

/** First element matching `selector`. */
export const $ = selector => document.querySelector(selector)

/** Beam colour while an ordinary, treasure-less chest is being shown. */
export const PLAIN_BEAM = '#9db4d6'
/** Plain gold: the beam and sparks when no tier colour applies. */
export const GOLD = '#ffd23f'
/** Brand colour of the Pirate Shop Access token. */
export const TOKEN_ORANGE = '#ff8a1f'
/** Sparks for the pickaxe tier. */
export const SPARK_ORANGE = '#ff8a1f'
/** Sparks for the gizmo tier. */
export const SPARK_ICE = '#8fd3ff'
/** Plain white: the screen flash and the ring on a supreme drop. */
export const WHITE = '#fff'

/** Aim the light coming out of the chest at `color`. */
export function setBeam(color) {
  $('#beam').setAttribute('fill', color)
}

/**
 * Flush pending style changes by reading a layout property. Removing and
 * re-adding an animation class in the same task only restarts the animation
 * if the browser has seen the removal in between.
 */
export function forceReflow(element) {
  if (element instanceof SVGElement) element.getBoundingClientRect() // <svg> has no offsetWidth
  else void element.offsetWidth
}

/** Replay a CSS animation on an element that already carries `className`. */
export function restartAnimation(element, className) {
  element.classList.remove(className)
  forceReflow(element)
  element.classList.add(className)
}
