/**
 * Two independent canvas particle systems, each with its own animation loop
 * that stops as soon as the last particle has faded or fallen off screen:
 *
 *   burst()     coins and sparks shooting out of the chest   (canvas #fx)
 *   confetti()  full-screen confetti for the big wins        (canvas #conf)
 *
 * These use Math.random() on purpose: they are decoration, so they do not need
 * the cryptographic rolls from rng.js.
 */
import { $, GOLD } from './dom.js'

const TAU = Math.PI * 2

/* ------------------------------------------------------------------ sparks */

const SPARK_GRAVITY = 0.28 // px added to the vertical speed every frame
const SPARK_DRAG = 0.99 // horizontal speed kept per frame
const SPARK_FADE = 0.01 // lifetime lost per frame (so a spark lives ~100 frames)
const SPARK_SPIN = 0.25 // radians a coin turns per frame
const SPARK_MIN_SPEED = 4
const SPARK_SPEED_RANGE = 10
const SPARK_MIN_SIZE = 2
const SPARK_SIZE_RANGE = 4
const COIN_EXTRA_RADIUS = 2
const COIN_MIN_FLAT = 0.15 // how thin a coin gets when seen edge-on
const COIN_CHANCE = 0.45
const SPREAD_RADIANS = 2 // total sideways spread around straight up

let sparks = []
let sparksFrame = 0

/**
 * Throw `count` particles from the middle of the chest.
 * `color` is the reward colour (every other spark falls back to gold) and
 * `withCoins` makes some of them spinning coins instead of dots.
 */
export function burst(color, count, withCoins) {
  const stageBox = $('.stage').getBoundingClientRect()
  const chestBox = $('#chest').getBoundingClientRect()

  const canvas = $('#fx')
  canvas.width = stageBox.width // assigning the size also clears the canvas
  canvas.height = stageBox.height

  const originX = chestBox.left - stageBox.left + chestBox.width * 0.5
  const originY = chestBox.top - stageBox.top + chestBox.height * 0.4

  for (let i = 0; i < count; i++) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * SPREAD_RADIANS
    const speed = SPARK_MIN_SPEED + Math.random() * SPARK_SPEED_RANGE
    sparks.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      size: SPARK_MIN_SIZE + Math.random() * SPARK_SIZE_RANGE,
      color: Math.random() < 0.5 ? color : GOLD,
      coin: withCoins && Math.random() < COIN_CHANCE,
      rotation: Math.random() * 6
    })
  }

  if (!sparksFrame) drawSparks()
}

function drawSparks() {
  const canvas = $('#fx')
  const ctx = canvas.getContext('2d')

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  sparks = sparks.filter(spark => spark.life > 0 && spark.y < canvas.height + 20)

  for (const spark of sparks) {
    spark.x += spark.vx
    spark.y += spark.vy
    spark.vy += SPARK_GRAVITY
    spark.vx *= SPARK_DRAG
    spark.life -= SPARK_FADE
    spark.rotation += SPARK_SPIN

    ctx.globalAlpha = Math.max(spark.life, 0)
    ctx.fillStyle = spark.color

    if (spark.coin) {
      // A coin is a circle squashed sideways as it spins.
      ctx.save()
      ctx.translate(spark.x, spark.y)
      ctx.scale(Math.max(Math.abs(Math.cos(spark.rotation)), COIN_MIN_FLAT), 1)
      ctx.beginPath()
      ctx.arc(0, 0, spark.size + COIN_EXTRA_RADIUS, 0, TAU)
      ctx.fill()
      ctx.restore()
    } else {
      ctx.beginPath()
      ctx.arc(spark.x, spark.y, spark.size * Math.max(spark.life, 0.2), 0, TAU)
      ctx.fill()
    }
  }

  ctx.globalAlpha = 1
  sparksFrame = sparks.length ? requestAnimationFrame(drawSparks) : 0
}

/* --------------------------------------------------------------- confetti */

const CONFETTI_GRAVITY = 0.11
const CONFETTI_DRAG = 0.985
const CONFETTI_FADE = 0.006
const CONFETTI_MIN_SPEED = 3
const CONFETTI_SPEED_RANGE = 13
const CONFETTI_MIN_SIZE = 5
const CONFETTI_SIZE_RANGE = 11
const CONFETTI_COLORS = ['#ffd23f', '#ffb300', '#fff3b0', '#ffffff']

let confettiPieces = []
let confettiFrame = 0

/** Drop `count` paper flaps from just above the middle of the screen. */
export function confetti(count) {
  const canvas = $('#conf')
  canvas.width = innerWidth
  canvas.height = innerHeight

  const originX = canvas.width / 2
  const originY = canvas.height * 0.36

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * TAU
    const speed = CONFETTI_MIN_SPEED + Math.random() * CONFETTI_SPEED_RANGE
    confettiPieces.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      // flung upwards, then gravity takes over
      vy: Math.sin(angle) * speed * 0.7 - 2,
      rotation: Math.random() * 6,
      spin: (Math.random() - 0.5) * 0.4,
      size: CONFETTI_MIN_SIZE + Math.random() * CONFETTI_SIZE_RANGE,
      life: 1,
      color: CONFETTI_COLORS[(Math.random() * CONFETTI_COLORS.length) | 0]
    })
  }

  if (!confettiFrame) drawConfetti()
}

function drawConfetti() {
  const canvas = $('#conf')
  const ctx = canvas.getContext('2d')

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  confettiPieces = confettiPieces.filter(p => p.life > 0 && p.y < canvas.height + 30)

  for (const p of confettiPieces) {
    p.x += p.vx
    p.y += p.vy
    p.vy += CONFETTI_GRAVITY
    p.vx *= CONFETTI_DRAG
    p.rotation += p.spin
    p.life -= CONFETTI_FADE

    // The flap is drawn as a triangle whose width follows its rotation.
    ctx.save()
    ctx.globalAlpha = Math.min(1, p.life * 1.6)
    ctx.translate(p.x, p.y)
    ctx.rotate(p.rotation)
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.moveTo(0, -p.size)
    ctx.lineTo(p.size * 0.7, p.size * 0.6)
    ctx.lineTo(-p.size * 0.7, p.size * 0.6)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  }

  ctx.globalAlpha = 1
  confettiFrame = confettiPieces.length ? requestAnimationFrame(drawConfetti) : 0
}
