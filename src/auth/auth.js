/*
 * The app's auth state, kept in one reactive object.
 *
 * This file no longer touches localStorage: it only remembers who is signed in
 * and forwards the work to the dummy API in ../api/api.js. Because the API keeps
 * accounts in memory, a page reload signs the user out — the router guard then
 * sends them back to /login, which is exactly what a real backend would do with
 * an expired session.
 */
import { reactive } from 'vue'
import { api } from '../api/api.js'

export const auth = reactive({ user: null, token: null })

function startSession({ user, token }) {
  auth.user = user
  auth.token = token
}

function clearSession() {
  auth.user = null
  auth.token = null
}

export async function signup(name, email, password) {
  startSession(await api.signup(name, email, password))
}

export async function login(email, password) {
  startSession(await api.login(email, password))
}

export async function logout() {
  await api.logout()
  clearSession()
}
