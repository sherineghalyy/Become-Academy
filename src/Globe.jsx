import { useEffect, useRef } from 'react'
import { CITIES } from './data'

const D = Math.PI / 180
const TILT = 20 * D
const HOME = { n: 'Egypt', lat: 27, lon: 30.8 }

const vec = (lat, lon) => {
  const p = lat * D, l = lon * D
  return [Math.cos(p) * Math.sin(l), Math.sin(p), Math.cos(p) * Math.cos(l)]
}

// great-circle arcs from Egypt to every destination, lifted off the surface
const a0 = vec(HOME.lat, HOME.lon)
const ARCS = CITIES.map((c, i) => {
  const b = vec(c.lat, c.lon)
  const dot = Math.max(-1, Math.min(1, a0[0] * b[0] + a0[1] * b[1] + a0[2] * b[2]))
  const w = Math.acos(dot), sw = Math.sin(w), pts = []
  for (let k = 0; k <= 56; k++) {
    const t = k / 56, f1 = Math.sin((1 - t) * w) / sw, f2 = Math.sin(t * w) / sw
    const lift = 1 + 0.32 * Math.min(1, w / 1.4) * Math.sin(Math.PI * t)
    pts.push([(f1 * a0[0] + f2 * b[0]) * lift, (f1 * a0[1] + f2 * b[1]) * lift, (f1 * a0[2] + f2 * b[2]) * lift])
  }
  return { pts, off: i * 0.061 }
})

export default function Globe() {
  const ref = useRef(null)

  useEffect(() => {
    const cv = ref.current
    const ctx = cv.getContext('2d')
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    let W = 0, H = 0, R = 0, cx = 0, cy = 0, center = 15, visible = true, raf = 0

    const size = () => {
      const r = cv.getBoundingClientRect()
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      W = r.width; H = r.height
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      R = Math.min(W, H) * 0.37; cx = W / 2; cy = H / 2
      if (reduce) draw(0)
    }
    const view = (v) => {
      const c = center * D
      const x = v[0] * Math.cos(c) - v[2] * Math.sin(c), z = v[0] * Math.sin(c) + v[2] * Math.cos(c), y = v[1]
      const y2 = y * Math.cos(TILT) - z * Math.sin(TILT), z2 = y * Math.sin(TILT) + z * Math.cos(TILT)
      return [cx + R * x, cy - R * y2, z2]
    }
    const line = (pts, stroke, w) => {
      ctx.beginPath()
      let pen = false
      for (const p of pts) {
        if (p[2] > 0) { pen ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); pen = true } else pen = false
      }
      ctx.strokeStyle = stroke; ctx.lineWidth = w; ctx.stroke()
    }

    function draw(t) {
      if (!W) return
      ctx.clearRect(0, 0, W, H)
      const g = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.35)
      g.addColorStop(0, 'rgba(170,170,180,.16)'); g.addColorStop(1, 'rgba(170,170,180,0)')
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 1.35, 0, 7); ctx.fill()
      const s = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.05, cx, cy, R)
      s.addColorStop(0, '#3a3a3e'); s.addColorStop(0.55, '#19191b'); s.addColorStop(1, '#09090a')
      ctx.fillStyle = s; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = 1.2; ctx.stroke()

      const gl = 'rgba(255,255,255,.10)'
      for (let i = -150; i < 180; i += 30) { const pts = []; for (let j = -90; j <= 90; j += 5) pts.push(view(vec(j, i))); line(pts, gl, 1) }
      for (let i = -60; i <= 60; i += 30) { const pts = []; for (let j = -180; j <= 180; j += 5) pts.push(view(vec(i, j))); line(pts, i === 0 ? 'rgba(255,255,255,.16)' : gl, 1) }

      ARCS.forEach((a) => {
        const p = a.pts.map(view)
        line(p, 'rgba(210,198,182,.5)', 1.2)
        const k = Math.floor(((t * 0.00011 + a.off) % 1) * (a.pts.length - 1)), q = p[k]
        if (q && q[2] > 0) { ctx.fillStyle = '#f4f1ea'; ctx.beginPath(); ctx.arc(q[0], q[1], 2.3, 0, 7); ctx.fill() }
      })

      const fs = Math.max(10, Math.min(13, W / 48))
      ctx.font = `500 ${fs}px "JetBrains Mono",ui-monospace,monospace`; ctx.textBaseline = 'middle'
      CITIES.forEach((c) => {
        const p = view(vec(c.lat, c.lon))
        if (p[2] <= 0.05) return
        const al = Math.min(1, p[2] * 2.2)
        ctx.fillStyle = `rgba(222,222,226,${al})`; ctx.beginPath(); ctx.arc(p[0], p[1], 3, 0, 7); ctx.fill()
        const sd = c.s || 'r', side = sd === 'r' || sd === 'l'
        ctx.textAlign = sd === 'r' ? 'left' : sd === 'l' ? 'right' : 'center'
        ctx.fillStyle = `rgba(236,235,231,${al * 0.85})`
        ctx.fillText(c.n, sd === 'r' ? p[0] + 9 : sd === 'l' ? p[0] - 9 : p[0], side ? p[1] : sd === 'a' ? p[1] - 14 : p[1] + 15)
      })
      ctx.textAlign = 'left'

      const h = view(vec(HOME.lat, HOME.lon))
      if (h[2] > 0.05) {
        const pu = reduce ? 0 : (t % 2400) / 2400
        ctx.strokeStyle = `rgba(187,166,143,${0.55 * (1 - pu)})`; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(h[0], h[1], 6 + pu * 16, 0, 7); ctx.stroke()
        ctx.fillStyle = '#bba68f'; ctx.beginPath(); ctx.arc(h[0], h[1], 5, 0, 7); ctx.fill()
        ctx.strokeStyle = 'rgba(187,166,143,.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(h[0], h[1], 9, 0, 7); ctx.stroke()
        ctx.font = `600 ${fs + 1}px "JetBrains Mono",ui-monospace,monospace`; ctx.fillStyle = '#f4f1ea'; ctx.textAlign = 'right'; ctx.fillText(HOME.n, h[0] - 14, h[1] - 14); ctx.textAlign = 'left'
      }
    }

    const loop = (t) => {
      if (visible && !document.hidden) { center = (15 + t * 0.0075) % 360; draw(t) }
      raf = requestAnimationFrame(loop)
    }

    size()
    window.addEventListener('resize', size)
    const io = 'IntersectionObserver' in window ? new IntersectionObserver((e) => { visible = e[0].isIntersecting; if (visible) size() }) : null
    io?.observe(cv)
    if (reduce) draw(0); else raf = requestAnimationFrame(loop)

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', size); io?.disconnect() }
  }, [])

  return <canvas id="globe" ref={ref} role="img" aria-label="Rotating globe with routes from Egypt to destinations around the world" />
}
