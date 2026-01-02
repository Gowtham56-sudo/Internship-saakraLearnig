"use client"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

type FetchOptions = RequestInit & { authToken?: string }

export async function apiFetch(path: string, options: FetchOptions = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`

  // Priority: explicit options.authToken > auth token (firebase) > demo token > env demo token
  const token =
    options.authToken ||
    (typeof window !== "undefined" ? window.localStorage.getItem("saakra_auth_token") : null) ||
    (typeof window !== "undefined" ? window.localStorage.getItem("saakra_demo_token") : null) ||
    process.env.NEXT_PUBLIC_DEMO_TOKEN ||
    null

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  let resp: Response
  try {
    resp = await fetch(url, {
      ...options,
      headers,
    })
  } catch (networkErr: any) {
    // Surface network errors with a consistent shape
    throw { status: -1, message: networkErr?.message || "Network error", raw: networkErr }
  }

  const text = await resp.text()
  try {
    const json = text ? JSON.parse(text) : null
    if (!resp.ok) throw { status: resp.status, body: json }
    return json
  } catch (err) {
    // if not json
    if (!resp.ok) throw { status: resp.status, body: text }
    return text
  }
}

export function setAuthToken(token: string) {
  if (typeof window !== "undefined") window.localStorage.setItem("saakra_auth_token", token)
}

export function clearAuthToken() {
  if (typeof window !== "undefined") window.localStorage.removeItem("saakra_auth_token")
}

export function setDemoTokenForUser(uid: string) {
  const token = `demo-token-${uid}`
  if (typeof window !== "undefined") window.localStorage.setItem("saakra_demo_token", token)
  return token
}

export function clearDemoToken() {
  if (typeof window !== "undefined") window.localStorage.removeItem("saakra_demo_token")
}

export default apiFetch
