"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({ children, ...props }: React.PropsWithChildren<any>) {
  // Apply no-transition class on initial page load and remove it after a short delay
  React.useEffect(() => {
    // Add a class to prevent transitions during initial page load
    document.documentElement.classList.add('no-transition')
    
    // Force a reflow to ensure the class is applied before any transitions
    // This helps prevent any initial flash of content
    document.documentElement.scrollTop
    
    // Remove the class after a short delay to allow themes to be applied first
    const timeoutId = setTimeout(() => {
      document.documentElement.classList.remove('no-transition')
    }, 300) // Longer timeout to ensure everything is loaded
    
    return () => clearTimeout(timeoutId)
  }, [])

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
} 