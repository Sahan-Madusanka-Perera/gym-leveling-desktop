import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';
import { headers } from 'next/headers'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });


  const requestHeaders = await headers()
  const ismobile = requestHeaders.get("x-isMobile")


  if (ismobile) {
    const authHeader = requestHeaders.get('Authorization');
    const token = authHeader!.split(' ')[1];
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {

      return new NextResponse(JSON.stringify({ message: 'Unauthorized: Invalid token or user not found' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } else {

    const supabase = await createClient();

    // Get the user from the session (validate session)
    const { data: { user }, error } = await supabase.auth.getUser();
    // If there's no user or session is invalid, redirect to login page
    const protectedRoutes = ['/dashboard']; // List protected routes here
    const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route));

    if (!user && isProtectedRoute) {
      return NextResponse.redirect(new URL('/', request.url));
    }

  }


  // Sync session cookies between Supabase and Next.js
  const cookiesToSet = request.cookies.getAll();
  cookiesToSet.forEach(({ name, value }) => {
    supabaseResponse.cookies.set(name, value); // Sync cookies to response
  });

  return supabaseResponse;
}
