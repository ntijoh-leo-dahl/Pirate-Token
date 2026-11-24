<!-- Battle Bus flies across the sky, players jump, glide down, land and play on the island. -->
<template>
  <canvas ref="cv" class="sky" aria-hidden="true"></canvas>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const cv = ref(null)
const OUTFITS = ['#ff4d6d', '#ffd23f', '#3ddc97', '#b46bff', '#ff8a1f', '#4db8ff', '#f2f2f2', '#2f2f3a']
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
const rand = (a, b) => a + Math.random() * (b - a)
const pick = a => a[(Math.random() * a.length) | 0]

let ctx, w = 0, h = 0, dpr = 1, gy = 0, PS = 1
let sky, land, clouds = [], players = [], raf = 0, last = 0, t = 0, spawnT = 1
const bus = { x: -300, y: 0, speed: 60, s: 1 }

const near = x => gy + Math.sin(x * 0.004) * h * 0.02 + Math.sin(x * 0.011 + 1) * h * 0.012
const far = x => gy - h * 0.05 + Math.sin(x * 0.003 + 2) * h * 0.03

function layer() {
  const c = document.createElement('canvas')
  c.width = w * dpr; c.height = h * dpr
  const g = c.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0)
  return [c, g]
}

function hills(g, fn, fill) {
  g.fillStyle = fill; g.beginPath(); g.moveTo(0, h)
  for (let x = 0; x <= w + 6; x += 6) g.lineTo(x, fn(x))
  g.lineTo(w, h); g.closePath(); g.fill()
}

function buildScene() {
  let g
  ;[sky, g] = layer()
  const sg = g.createLinearGradient(0, 0, 0, gy)
  sg.addColorStop(0, '#1459c9'); sg.addColorStop(0.55, '#3f9ae8'); sg.addColorStop(1, '#a6e0ff')
  g.fillStyle = sg; g.fillRect(0, 0, w, h)
  const sun = g.createRadialGradient(w * 0.82, h * 0.16, 0, w * 0.82, h * 0.16, h * 0.28)
  sun.addColorStop(0, 'rgba(255,246,190,.9)'); sun.addColorStop(1, 'rgba(255,246,190,0)')
  g.fillStyle = sun; g.fillRect(0, 0, w, h)

  ;[land, g] = layer()
  hills(g, far, '#4fae7a')
  const ng = g.createLinearGradient(0, gy - h * 0.04, 0, h)
  ng.addColorStop(0, '#6fd44a'); ng.addColorStop(1, '#2c8a2a')
  hills(g, near, ng)
  for (let i = 0; i < Math.round(w / 55); i++) {          // pine trees
    const x = ((i * 0.7548776662) % 1) * w, y = near(x) + 3, k = 0.8 + ((i * 7) % 5) / 8
    g.fillStyle = '#6b3f1d'; g.fillRect(x - 1.5, y - 8 * k, 3, 8 * k)
    g.fillStyle = i % 2 ? '#1f6b2c' : '#2a8a38'
    for (let j = 0; j < 3; j++) { g.beginPath(); g.moveTo(x - (11 - j * 2) * k, y - (7 + j * 8) * k); g.lineTo(x + (11 - j * 2) * k, y - (7 + j * 8) * k); g.lineTo(x, y - (20 + j * 8) * k); g.fill() }
  }
  ;[[0.12, '#e8c48a', '#d94a4a'], [0.37, '#d8d8e0', '#3a7bff'], [0.62, '#f0d9a8', '#8a3fd0'], [0.86, '#e8c48a', '#e8a21f']].forEach(([f, wall, roof]) => {
    const x = f * w, y = near(x) + 4
    g.fillStyle = wall; g.fillRect(x - 17, y - 24, 34, 24)
    g.fillStyle = roof; g.beginPath(); g.moveTo(x - 22, y - 24); g.lineTo(x, y - 40); g.lineTo(x + 22, y - 24); g.fill()
    g.fillStyle = '#6b3f1d'; g.fillRect(x - 4, y - 13, 8, 13)
  })
}

function initClouds() {
  clouds = Array.from({ length: Math.max(5, Math.round(w / 220)) }, () => ({ x: rand(0, w), y: rand(h * 0.05, h * 0.55), s: rand(0.6, 1.5), v: rand(6, 18) }))
}

function resize() {
  dpr = Math.min(devicePixelRatio || 1, 2)
  w = innerWidth; h = innerHeight
  cv.value.width = w * dpr; cv.value.height = h * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  gy = h * 0.86; PS = Math.min(1.3, Math.max(0.8, w / 900)); bus.s = Math.min(1.15, Math.max(0.7, w / 1100)); bus.y = h * 0.13
  buildScene(); initClouds()
  if (reduce) { bus.x = w * 0.5; draw() }
}

function spawn() {
  players.push({ x: bus.x + rand(-15, 15), y: bus.y + 52 * bus.s, vx: bus.speed * rand(0.6, 0.9), vy: 0, st: 'fall', col: pick(OUTFITS), gcol: pick(OUTFITS), ph: rand(0, 6.28),
    deployY: rand(h * 0.42, h * 0.6), open: 0, gt: 0, dur: rand(4, 8), dir: Math.random() < 0.5 ? -1 : 1, act: 'run', actT: rand(1, 2), wall: null, a: 1 })
}

function update(dt) {
  clouds.forEach(c => { c.x += c.v * dt; if (c.x > w + 160) c.x = -160 })
  bus.x += bus.speed * dt
  if (bus.x > w + 300) { bus.speed = (w + 600) / rand(22, 30); bus.x = -300 - bus.speed * rand(2, 5) }
  bus.y = h * 0.13 + Math.sin(t * 0.8) * 6
  if (bus.x > w * 0.06 && bus.x < w * 0.94 && players.length < 16 && (spawnT -= dt) <= 0) { spawn(); spawnT = rand(0.6, 1.5) }
  players.forEach(p => {
    if (p.st === 'fall') {
      p.vy = Math.min(p.vy + 700 * dt, 460); p.vx *= Math.pow(0.35, dt)
      p.x += p.vx * dt; p.y += p.vy * dt
      if (p.y > p.deployY) p.st = 'glide'
    } else if (p.st === 'glide') {
      p.open = Math.min(1, p.open + dt * 3)
      p.vy += (60 - p.vy) * Math.min(1, 5 * dt); p.vx = Math.sin(t + p.ph) * 22
      p.x += p.vx * dt; p.y += p.vy * dt
      const gg = near(p.x)
      if (p.y >= gg) { p.y = gg; p.st = 'ground'; p.gt = 0 }
    } else {
      p.gt += dt; p.actT -= dt
      if (p.actT <= 0) {
        p.act = pick(['run', 'run', 'pickaxe', 'build', 'emote']); p.actT = rand(1.2, 2.4)
        if (p.act === 'build') p.wall = { x: p.x + p.dir * 16, t: 0 }
      }
      if (p.act === 'run') { p.x += p.dir * 40 * dt; if (p.x < 10 || p.x > w - 10) p.dir *= -1 }
      if (p.wall) p.wall.t += dt
      p.y = near(p.x)
      if (p.gt > p.dur) p.a -= dt
    }
  })
  players = players.filter(p => p.a > 0)
}

function rr(x, y, wd, ht, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + wd, y, x + wd, y + ht, r); ctx.arcTo(x + wd, y + ht, x, y + ht, r)
  ctx.arcTo(x, y + ht, x, y, r); ctx.arcTo(x, y, x + wd, y, r); ctx.closePath()
}
function line(x1, y1, x2, y2, col, wd) { ctx.strokeStyle = col; ctx.lineWidth = wd; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke() }

function drawBus() {
  ctx.save(); ctx.translate(bus.x, bus.y); ctx.scale(bus.s, bus.s)
  ;[[-22, -50, -30, -14], [22, -50, 30, -14], [0, -48, 0, -14]].forEach(r => line(...r, '#1b1140', 1.5))
  ctx.save(); ctx.beginPath(); ctx.ellipse(0, -92, 44, 48, 0, 0, 7); ctx.clip()
  ctx.fillStyle = '#ff6fb0'; ctx.fillRect(-50, -145, 100, 100)
  ;[[34, '#ffd23f'], [22, '#3a7bff'], [10, '#ffe45c']].forEach(([rx, c]) => { ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(0, -92, rx, 48, 0, 0, 7); ctx.fill() })
  ctx.restore()
  ctx.strokeStyle = '#1b1140'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, -92, 44, 48, 0, 0, 7); ctx.stroke()
  rr(-48, -14, 96, 36, 10); ctx.fillStyle = '#3a7bff'; ctx.fill(); ctx.strokeStyle = '#1b1140'; ctx.lineWidth = 3; ctx.stroke()
  ctx.fillStyle = '#fff'; ctx.fillRect(-46, 8, 92, 5)
  ctx.fillStyle = '#bfe3ff'; for (let i = 0; i < 4; i++) { rr(-38 + i * 20, -8, 15, 11, 2); ctx.fill() }
  ctx.fillStyle = '#ffe45c'; ctx.fillRect(44, 4, 5, 6)
  ;[-28, 28].forEach(x => { ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(x, 24, 8, 0, 7); ctx.fill(); ctx.fillStyle = '#bbb'; ctx.beginPath(); ctx.arc(x, 24, 3, 0, 7); ctx.fill() })
  ctx.restore()
}

function drawPlayer(p) {
  ctx.save(); ctx.globalAlpha = Math.max(0, Math.min(1, p.a))
  if (p.wall) {                                   // built wall
    const k = Math.min(1, p.wall.t / 0.4), ht = 24 * PS * k, wx = p.wall.x
    ctx.fillStyle = '#9aa7b8'; ctx.fillRect(wx - 9 * PS, p.y - ht, 18 * PS, ht)
    ctx.strokeStyle = '#5b6b82'; ctx.lineWidth = 1.5; ctx.strokeRect(wx - 9 * PS, p.y - ht, 18 * PS, ht)
    line(wx - 9 * PS, p.y - ht / 2, wx + 9 * PS, p.y - ht / 2, '#5b6b82', 1)
  }
  ctx.translate(p.x, p.y); ctx.scale(PS, PS)
  const d = p.st === 'ground' ? p.dir : 1
  if (p.st === 'fall') { ctx.rotate(Math.PI / 2 + Math.sin(t * 9 + p.ph) * 0.15); ctx.translate(0, 9) }
  else ctx.scale(d, 1)
  const dark = '#27283a'; let lk = 0, la = 0, ra = 0, bob = 0, ay = -13
  if (p.st === 'fall') { line(0, -7, -5, 2, dark, 2.4); line(0, -7, 5, 2, dark, 2.4); line(-4, -13, -10, -9, p.col, 2.4); line(4, -13, 10, -9, p.col, 2.4) }
  else if (p.st === 'glide') {
    const k = p.open, cy = -32
    ctx.fillStyle = p.gcol; ctx.beginPath(); ctx.arc(0, cy, 16 * k, Math.PI, 0); ctx.closePath(); ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.beginPath(); ctx.arc(0, cy, 16 * k, Math.PI * 1.3, Math.PI * 1.7); ctx.lineTo(0, cy); ctx.fill()
    ;[-16, 0, 16].forEach(x => line(x * k, cy, x * 0.2, -14, 'rgba(255,255,255,.85)', 0.8))
    lk = Math.sin(t * 3 + p.ph) * 1.5
    line(0, -7, -3 + lk, 0, dark, 2.4); line(0, -7, 3 - lk, 0, dark, 2.4); line(-4, -13, -2, -20, p.col, 2.2); line(4, -13, 2, -20, p.col, 2.2)
  } else {
    const gt = p.gt
    if (p.act === 'emote') { ctx.rotate(Math.sin(gt * 12) * 0.15); bob = -Math.abs(Math.sin(gt * 10)) * 2; la = -7 - Math.sin(gt * 12) * 3; ra = -7 + Math.sin(gt * 12) * 3 }
    if (p.act === 'run') { lk = Math.sin(gt * 14) * 3.5; la = Math.sin(gt * 14) * 4; ra = -la }
    ctx.translate(0, bob)
    line(0, -7, -3 + lk, 0, dark, 2.4); line(0, -7, 3 - lk, 0, dark, 2.4)
    if (p.act === 'emote') { line(-4, -13, -8, -13 + la - 6, p.col, 2.4); line(4, -13, 8, -13 + ra - 6, p.col, 2.4) }
    else if (p.act === 'pickaxe') {
      const a = Math.sin(gt * 9) * 1.0 - 1
      const hx = 4 + 9 * Math.cos(a), hy = -13 + 9 * Math.sin(a)
      line(-4, -13, -6, -7, p.col, 2.4); line(4, -13, hx, hy, p.col, 2.4)
      line(hx, hy, hx + 8 * Math.cos(a), hy + 8 * Math.sin(a), '#7a4a22', 1.8)
      line(hx + 8 * Math.cos(a) - 3 * Math.sin(a), hy + 8 * Math.sin(a) + 3 * Math.cos(a), hx + 8 * Math.cos(a) + 3 * Math.sin(a), hy + 8 * Math.sin(a) - 3 * Math.cos(a), '#cfd8e6', 2.4)
    } else if (p.act === 'build') { line(-4, -13, 8, -12, p.col, 2.4); line(4, -13, 9, -11, p.col, 2.4) }
    else { line(-4, -13, -4 + la * 0.5, -7, p.col, 2.4); line(4, -13, 4 + ra * 0.5, -7, p.col, 2.4) }
  }
  rr(-4, -14, 8, 8, 2); ctx.fillStyle = p.col; ctx.fill()                         // torso
  ctx.fillStyle = '#f1c9a0'; ctx.beginPath(); ctx.arc(0, -17.5, 3.6, 0, 7); ctx.fill() // head
  ctx.fillStyle = dark; ctx.beginPath(); ctx.arc(0, -18.2, 3.7, Math.PI, 0); ctx.fill() // hair
  ctx.restore()
}

function draw() {
  ctx.drawImage(sky, 0, 0, w, h)
  ctx.fillStyle = 'rgba(255,255,255,.85)'
  clouds.forEach(c => { [[0, 0, 26], [28, -8, 32], [60, 0, 26], [30, 8, 30]].forEach(([dx, dy, r]) => { ctx.beginPath(); ctx.arc(c.x + dx * c.s, c.y + dy * c.s, r * c.s, 0, 7); ctx.fill() }) })
  drawBus()
  ctx.drawImage(land, 0, 0, w, h)
  players.forEach(drawPlayer)
}

function frame(ts) {
  raf = requestAnimationFrame(frame)
  const dt = Math.min(0.05, (ts - last) / 1000 || 0); last = ts; t += dt
  update(dt); draw()
}

onMounted(() => {
  ctx = cv.value.getContext('2d')
  addEventListener('resize', resize)
  bus.speed = (innerWidth + 600) / 26
  resize()
  if (!reduce) raf = requestAnimationFrame(frame)
})
onBeforeUnmount(() => { cancelAnimationFrame(raf); removeEventListener('resize', resize) })
</script>
