import { FORM_ENDPOINT } from './config'

const KEY = 'become:last-submit'
const COOLDOWN_MS = 20000

export function cooldownLeft() {
  try {
    const t = Number(localStorage.getItem(KEY)) || 0
    return Math.max(0, COOLDOWN_MS - (Date.now() - t))
  } catch {
    return 0
  }
}

const clean = (v) => String(v ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').slice(0, 2000)

/**
 * Sends a form to the owner's email.
 * rows  : [[label, value], ...]
 * files : { fieldName: File }
 * Returns { status: 'sent' | 'failed' | 'wait', text, seconds? }
 */
export async function submit(kind, rows, files = {}) {
  const text = kind + '\n' + rows.map(([k, v]) => `${k}: ${clean(v)}`).join('\n')
  const left = cooldownLeft()
  if (left > 0) return { status: 'wait', seconds: Math.ceil(left / 1000), text }

  const fd = new FormData()
  fd.append('_subject', 'BECOME: ' + clean(kind))
  fd.append('_template', 'table')
  fd.append('_captcha', 'false')
  rows.forEach(([k, v]) => {
    fd.append(clean(k), clean(v))
    if (k === 'Email') fd.append('_replyto', clean(v))
  })
  Object.entries(files).forEach(([k, f]) => f && fd.append(k, f))

  try {
    const r = await fetch(FORM_ENDPOINT, { method: 'POST', headers: { Accept: 'application/json' }, body: fd })
    const j = await r.json().catch(() => ({}))
    const ok = r.ok && String(j.success) !== 'false'
    if (ok) {
      try {
        localStorage.setItem(KEY, String(Date.now()))
      } catch {}
    }
    return { status: ok ? 'sent' : 'failed', text }
  } catch {
    return { status: 'failed', text }
  }
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
