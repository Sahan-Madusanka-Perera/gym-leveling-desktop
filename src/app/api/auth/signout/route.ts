import { createClient } from '@/lib/supabase/server' 
import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: NextRequest) {
  const supabase = await createClient() 
  const cookieStore = cookies()

  // Get the current user session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If there's an active session, log them out
  if (session) {
    await supabase.auth.signOut()
  }

  // Create a response that redirects to the home page
  const response = NextResponse.redirect(new URL('/', req.url), {
    status: 302, // Redirect to home page
  })

  // Clear auth cookies by setting them to expire in the past
  const authCookies = ['sb-access-token', 'sb-refresh-token', 'sb-auth-token']
  authCookies.forEach(name => {
    response.cookies.set({
      name,
      value: '',
      expires: new Date(0),
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
  })

  // Also set cache control headers to prevent caching
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')

  return response
}
