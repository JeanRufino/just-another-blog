// Uses Web Crypto API (available in both Edge and Node.js runtimes)

const COOKIE_NAME = 'admin_session'
const COOKIE_MAX_AGE = 60 * 60 * 8 // 8 hours

function getSecret(): string {
  const secret = process.env.ADMIN_SECRET
  if (!secret) throw new Error('ADMIN_SECRET env var is not set')
  return secret
}

async function getKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

function bufToB64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
}

function b64ToBuf(b64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(b64)
  const buf = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i)
  return buf
}

export async function signSession(email: string): Promise<string> {
  const payload = btoa(JSON.stringify({ email, ts: Date.now() }))
  const key = await getKey(getSecret())
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return `${payload}.${bufToB64(sig)}`
}

export async function verifySession(token: string): Promise<boolean> {
  const dot = token.lastIndexOf('.')
  if (dot === -1) return false
  const payload = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  try {
    const key = await getKey(getSecret())
    return await crypto.subtle.verify(
      'HMAC',
      key,
      b64ToBuf(sig),
      new TextEncoder().encode(payload)
    )
  } catch {
    return false
  }
}

export { COOKIE_NAME, COOKIE_MAX_AGE }
