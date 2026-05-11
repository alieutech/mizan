import { NextResponse } from 'next/server'

export async function GET() {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').trim()
  const response = NextResponse.redirect(appUrl)
  response.cookies.delete('qf_session')
  return response
}
