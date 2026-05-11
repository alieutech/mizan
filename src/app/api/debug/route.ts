import { NextResponse } from "next/server"

export async function GET() {
  const clientId = process.env.QF_CLIENT_ID
  const clientSecret = process.env.QF_CLIENT_SECRET
  const authUrl =
    process.env.QF_AUTH_URL ?? "https://oauth2.quran.foundation/oauth2/token"

  const results: Record<string, any> = {}

  // ── 1. Env vars present? ──
  results.env = {
    QF_CLIENT_ID: clientId ? `${clientId.slice(0, 8)}… ✓` : "MISSING ✗",
    QF_CLIENT_SECRET: clientSecret ? "set ✓" : "MISSING ✗",
    QF_AUTH_URL: authUrl,
  }

  // ── 2. OAuth2 token fetch ──
  try {
    const res = await fetch(authUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: "grant_type=client_credentials&scope=content",
    })
    const text = await res.text()
    if (res.ok) {
      const data = JSON.parse(text)
      results.oauth2 = {
        status: res.status,
        result: "✓ token received",
        token_type: data.token_type,
        expires_in: data.expires_in,
        token_preview: data.access_token?.slice(0, 20) + "…",
      }

      // ── 3. Test candidate content API URLs with the token ──
      const token = data.access_token
      const candidateUrls = [
        "https://apis.quran.foundation/content/api/v4",
        "https://prelive-apis.quran.foundation/content/api/v4",
        "https://staging.quran.foundation/content/api/v4",
      ]
      results.qf_content_api = {}
      for (const base of candidateUrls) {
        const apiRes = await fetch(`${base}/chapters?language=en`, {
          headers: { "x-auth-token": token, "x-client-id": clientId! },
        })
        const apiText = await apiRes.text()
        results.qf_content_api[base] = {
          status: apiRes.status,
          ok: apiRes.ok,
          preview: apiText.slice(0, 150),
        }
      }
    } else {
      results.oauth2 = {
        status: res.status,
        result: "✗ token failed",
        body: text.slice(0, 300),
      }
    }
  } catch (err: any) {
    results.oauth2 = { result: "✗ fetch error", error: err.message }
  }

  // ── 4. Public API fallback (api.quran.com) ──
  try {
    const res = await fetch("https://api.quran.com/api/v4/chapters?language=en")
    results.public_api = { status: res.status, ok: res.ok }
  } catch (err: any) {
    results.public_api = { result: "✗ unreachable", error: err.message }
  }

  return NextResponse.json(results, { status: 200 })
}
