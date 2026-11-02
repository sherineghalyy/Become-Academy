// Field checks. Each returns '' when the value is fine, or a short message to show under the field.

const LETTERS = /\p{L}/gu

export const rules = {
  name(v) {
    const s = v.trim()
    if (!s) return 'Enter your full name.'
    if ((s.match(LETTERS) || []).length < 2) return 'Enter your full name.'
    if (!/^[\p{L}\p{M}\s.'\-]+$/u.test(s)) return 'Use letters only in the name.'
    return ''
  },
  company(v) {
    const s = v.trim()
    return s.length >= 2 ? '' : 'Enter the company name.'
  },
  phone(v) {
    const d = v.replace(/[\s\-().]/g, '')
    if (!d) return 'Enter a phone number.'
    return /^\+?\d{8,15}$/.test(d) ? '' : 'Enter a valid phone number, for example 01012345678 or +201012345678.'
  },
  email(v) {
    const s = v.trim()
    if (!s) return 'Enter your email.'
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s) && s.length <= 120 ? '' : 'Enter a valid email, for example name@example.com.'
  },
  contact(v) {
    const s = v.trim()
    if (!s) return 'Enter a phone number or an email.'
    return rules.email(s) === '' || rules.phone(s) === '' ? '' : 'Enter a valid phone number or email.'
  },
  years(v) {
    const n = Number(v)
    if (v === '' || !Number.isInteger(n)) return 'Enter the years as a whole number.'
    return n >= 0 && n <= 60 ? '' : 'Enter a number between 0 and 60.'
  },
  trainees(v) {
    const n = Number(v)
    if (v === '' || !Number.isInteger(n)) return 'Enter the number as a whole number.'
    return n >= 1 && n <= 10000 ? '' : 'Enter a number between 1 and 10,000.'
  },
}

export function validateField(f, value) {
  const v = String(value ?? '')
  if (f.type === 'select') return v ? '' : 'Choose an option.'
  const rule = f.rule || (f.id === 'email' ? (f.type === 'email' ? 'email' : 'contact') : f.id)
  if (rules[rule]) return rules[rule](v)
  return v.trim() ? '' : 'This field is required.'
}

const MAX = 8 * 1024 * 1024
export function validateImage(file) {
  if (!file) return 'Upload this screenshot.'
  if (!file.type.startsWith('image/')) return 'This must be an image (PNG or JPG).'
  if (file.size > MAX) return 'The image must be under 8 MB.'
  return ''
}
