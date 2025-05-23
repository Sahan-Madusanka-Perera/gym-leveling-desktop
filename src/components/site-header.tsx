"use client"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/hooks/use-auth"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect, useState } from "react"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { UserCircle } from "lucide-react"

export function SiteHeader() {
  const { user, loading } = useAuth()
  const [greeting, setGreeting] = useState("Welcome")
  
  // Get user's first name if available
  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 
                    user?.user_metadata?.name?.split(' ')[0] ||
                    user?.email?.split('@')[0] ||
                    ''

  // Get full name or fallback to email
  const fullName = user?.user_metadata?.full_name || 
                  user?.user_metadata?.name || 
                  user?.email || 
                  'User'

  // Update greeting based on time of day
  useEffect(() => {
    const getTimeBasedGreeting = () => {
      const hour = new Date().getHours()
      if (hour < 12) return "Good morning"
      if (hour < 18) return "Good afternoon"
      return "Good evening"
    }
    
    setGreeting(getTimeBasedGreeting())
    
    // Update greeting every hour
    const intervalId = setInterval(() => {
      setGreeting(getTimeBasedGreeting())
    }, 60 * 60 * 1000)
    
    return () => clearInterval(intervalId)
  }, [])

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        {loading ? (
          <Skeleton className="h-6 w-40" />
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-muted cursor-pointer">
                  {user && <UserCircle className="h-4 w-4 text-muted-foreground" />}
                  <h1 className="text-base font-medium">
                    {firstName ? `${greeting}, ${firstName}!` : "Welcome Back!"}
                  </h1>
                </div>
              </TooltipTrigger>
              {user && (
                <TooltipContent side="bottom" className="p-2">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">{fullName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Last sign in: {new Date(user.last_sign_in_at || '').toLocaleString()}
                    </p>
                  </div>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        )}
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}