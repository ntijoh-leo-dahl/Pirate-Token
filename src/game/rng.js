/**
 * Random numbers for the chest rolls.
 *
 * The whole simulator stands or falls on unbiased rolls, so we use the
 * browser's cryptographic generator instead of Math.random(). Calling it once
 * per chest would be wasteful, so we fill one buffer of 32-bit words and hand
 * out fractions of it, refilling when we run out.
 */

const BUFFER_WORDS = 8192
const UINT32_RANGE = 4294967296 // 2 ** 32, the number of values one word can hold

const words = new Uint32Array(BUFFER_WORDS)
let nextWord = BUFFER_WORDS // starts "spent" so the first call fills the buffer

/** A random float in [0, 1). */
export function randomFraction() {
  if (nextWord >= words.length) {
    crypto.getRandomValues(words)
    nextWord = 0
  }
  return words[nextWord++] / UINT32_RANGE
}
