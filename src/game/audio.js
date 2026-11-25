/**
 * All sound is synthesised on the fly with the Web Audio API — no audio files,
 * just short oscillator notes stacked into jingles.
 *
 * Everything bails out while muted, and any Web Audio failure (a blocked or
 * unsupported AudioContext, which browsers are picky about) is swallowed:
 * sound is a nicety and must never break an open.
 */
import { ui } from './store.js'
import { isSupreme } from './tiers.js'

/** @type {AudioContext|null} created on first use and reused after that */
let audioContext = null

/**
 * Play one oscillator note.
 *
 * @param hz       start frequency in Hz
 * @param delay    seconds from now before the note starts
 * @param duration seconds
 * @param wave     'sine' | 'square' | 'sawtooth' | 'triangle'
 * @param volume   peak gain, 0–1
 * @param endHz    optional frequency to slide to over the note (a sweep)
 */
function note(hz, delay, duration, wave, volume, endHz) {
  if (ui.muted) return
  try {
    audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)()
    const at = audioContext.currentTime + delay
    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()

    oscillator.type = wave
    oscillator.frequency.setValueAtTime(hz, at)
    if (endHz) oscillator.frequency.exponentialRampToValueAtTime(endHz, at + duration)

    gain.gain.setValueAtTime(volume, at)
    gain.gain.exponentialRampToValueAtTime(0.001, at + duration)

    oscillator.connect(gain)
    gain.connect(audioContext.destination)
    oscillator.start(at)
    oscillator.stop(at + duration)
  } catch {
    /* no audio available — stay silent */
  }
}

/** Raise a frequency by a number of semitones. */
const semitones = (hz, steps) => hz * 2 ** (steps / 12)

/** Jittery rising build-up while the chest charges for `ms` milliseconds. */
export function playChargeSound(ms) {
  const seconds = ms / 1000
  for (let t = 0; t < seconds; t += 0.085) note(1700 + Math.random() * 1500, t, 0.05, 'square', 0.011)
  note(80, 0, seconds, 'sawtooth', 0.035, 640) // low rumble
  note(160, 0, seconds, 'square', 0.014, 1300) // rising whine
  for (let t = 0; t < seconds; t += 0.18) note(900 + t * 520, t, 0.12, 'sine', 0.02) // tension sweep
}

/** The open itself. `reward` is null for a chest with no treasure. */
export function playOpenSound(reward) {
  if (!reward) {
    note(140, 0, 0.3, 'sawtooth', 0.04, 70) // dull thud
    note(660, 0.1, 0.2, 'triangle', 0.05)
    note(880, 0.08, 0.28, 'triangle', 0.05)
    return
  }

  const supreme = isSupreme(reward)
  const root = supreme ? 523 : reward.id === 'giz' ? 392 : 440
  note(300, 0, 0.55, 'sawtooth', 0.09, 40) // lid popping open

  const chord = supreme ? [0, 4, 7, 12] : [0, 7] // full major chord vs a bare fifth
  chord.forEach((step, i) => note(semitones(root, step), 0.08 + i * 0.09, 0.6, 'triangle', 0.08))

  if (supreme) {
    for (let i = 0; i < 8; i++) note(1200 + i * 350, 0.2 + i * 0.06, 0.15, 'sine', 0.03) // sparkle
  }
}

/**
 * A second motif for the kind of treasure that dropped: an engine, a drill, a
 * beat drop, and so on.
 */
export function playRewardTheme(reward) {
  switch (reward.id) {
    case 'veh': // engine revving
      note(60, 0, 0.9, 'sawtooth', 0.07, 300)
      note(400, 0.5, 0.25, 'square', 0.03)
      break
    case 'pick': // two metallic pings
      note(1500, 0, 0.4, 'triangle', 0.07, 900)
      note(2300, 0.02, 0.3, 'sine', 0.05)
      break
    case 'jam': // four-on-the-floor kick with an off-beat tick
      for (const beat of [0, 0.25, 0.5, 0.75]) {
        note(120, beat, 0.15, 'sine', 0.12, 40)
        note(900, beat + 0.125, 0.05, 'square', 0.02)
      }
      break
    case 'load': // rising sweep, like a screen wiping in
      note(200, 0, 0.4, 'sawtooth', 0.03, 1800)
      break
    case 'giz': // pentatonic arpeggio
      for (const [i, step] of [0, 3, 7, 12, 15].entries()) {
        note(semitones(880, step), i * 0.07, 0.2, 'sine', 0.05)
      }
      break
    case 'gold': // fanfare plus a shower of sparkles
      for (const [i, step] of [0, 4, 7, 12, 16, 19].entries()) {
        note(semitones(392, step), i * 0.12, 0.9, 'triangle', 0.07)
      }
      for (let i = 0; i < 14; i++) note(2000 + Math.random() * 2500, 0.2 + i * 0.07, 0.1, 'sine', 0.025)
      break
  }
}
