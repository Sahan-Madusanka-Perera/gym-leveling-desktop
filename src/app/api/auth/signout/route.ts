import { createClient } from '@/lib/supabase/server' 
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient() 

  // Get the current user session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If the user exists, log them out
  if (user) {
    await supabase.auth.signOut()
  }

  return NextResponse.redirect(new URL('/', req.url), {
    status: 302, // Redirect to home page
  })
}
