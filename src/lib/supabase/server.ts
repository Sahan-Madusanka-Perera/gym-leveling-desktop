import { createServerClient } from '@supabase/ssr'
import { cookies, headers } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()


  const requestHeaders = await headers()
  const ismobile = requestHeaders.get("x-isMobile")

  const cookieHeader = requestHeaders.get('cookie') ?? '';

  const cookiesheaders = cookieHeader.split(';')
    .map((cookieValue) => {
      const [name, value] = cookieValue.trim().split('=');
      return {
        name,
        value,
        path: '/'
      };
    });

  const allCookies = ismobile ? cookiesheaders : cookieStore.getAll();


  // Create a server's supabase client with newly configured cookie,
  // which could be used to maintain user's session
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return allCookies;
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
          }
        },
      },
    }
  )
}