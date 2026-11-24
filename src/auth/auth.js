/*
 * Client-side demo auth. Accounts live in this browser's localStorage only
 * (salted SHA-256). There is no server, so this is NOT real security.
 * Swap signup()/login()/logout() for calls to your API when you have one.
 */
import { reactive } from 'vue'

const USERS = 'ptcs_users'
const SESSION = 'ptcs_session'

const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d } catch { return d } }
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true } catch { return false } }

export const auth = reactive({ user: read(SESSION, null) })

const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')

async function hash(password, salt) {
  if (!globalThis.crypto?.subtle) throw new Error('Secure context required: open the app on https:// or localhost.')
  return hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + password)))
}

export async function signup(name, email, password) {
  name = name.trim(); email = email.trim().toLowerCase()
  if (name.length < 3 || name.length > 20) throw new Error('Username must be 3–20 characters.')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email address.')
  if (password.length < 8) throw new Error('Password must be at least 8 characters.')
  const users = read(USERS, [])
  if (users.some(u => u.email === email)) throw new Error('An account with this email already exists.')
  const salt = hex(crypto.getRandomValues(new Uint8Array(16)))
  users.push({ name, email, salt, hash: await hash(password, salt) })
  if (!write(USERS, users)) throw new Error('Could not save the account (browser storage is unavailable).')
  startSession({ name, email })
}

export async function login(email, password) {
  email = email.trim().toLowerCase()
  const u = read(USERS, []).find(x => x.email === email)
  if (!u || (await hash(password, u.salt)) !== u.hash) throw new Error('Incorrect email or password.')
  startSession({ name: u.name, email: u.email })
}

function startSession(user) { auth.user = user; write(SESSION, user) }

export function logout() {
  auth.user = null
  try { localStorage.removeItem(SESSION) } catch {}
}
