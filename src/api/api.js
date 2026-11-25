export class ApiError extends Error {
  constructor(message, status = 400) {
    super(message)
    this.name = 'ApiError'
    this.status = status

  }
}

export class PirateChestApi {
  constructor(baseUrl = 'http://localhost:5288/') {
    this.baseUrl = baseUrl
    this.token = localStorage.getItem('token')
  }

  /** POST /signup — create an account and start a session right away. */
  async signup(name, email, password) {
    
  }

  /** POST /login — check the credentials, hand back a token and the user. */
  async login(username, password) {
    const response = await fetch(`${this.baseUrl}Users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })

    if (!response.ok) throw new ApiError(`Log in failed (HTTP ${response.status})`, response.status)

    const data = await response.json()
    if (!data.token) throw new ApiError('The server replied without a token.')

    this.token = data.token
    localStorage.setItem('token', data.token)

    // the server may send the profile inline or just an id; normalise to { name, email }
    const user = this.publicUser(data.user ?? { name: data.name ?? username, email: data.email ?? username })

    return { user, token: data.token }
  }

  /** DELETE /session — throw the token away. Always "succeeds". */
  async logout() {
    this.token = null
    localStorage.removeItem('token')
  }

  /** GET /me — which user does the current token belong to? */
  async me() {

  }

  async validateToken(token) {
      const response = await fetch(`${this.baseUrl}Users/ValidateToken`, {
          method: "GET",
          headers: {
              "Authorization": `Bearer ${token}`
          }
      });
      console.log(response.status)
      if (response.status.ok) {
          console.log("Token is invalid or expired");
          return false;
      }
      else if(response.status === 200) {
        console.log("204")
        return true;
      }

  }


  normalizeEmail(email) { return (email ?? '').trim().toLowerCase() }

  publicUser({ name, email }) { return { name, email } }

  startSession(user) {
    this.token = { email: user.email, issuedAt: Date.now() }
    return { user, token: `demo-token.${btoa(user.email)}` }
  }

}

/** One shared client for the whole app. */
export const api = new PirateChestApi()
