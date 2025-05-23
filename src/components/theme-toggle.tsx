"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [isAnimating, setIsAnimating] = React.useState(false)
  
  // Only show the toggle after mounting to avoid hydration mismatch
  React.useEffect(() => setMounted(true), [])
  
  const toggleTheme = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setTheme(resolvedTheme === "dark" ? "light" : "dark")
      setTimeout(() => {
        setIsAnimating(false)
      }, 300) // Match this to the animation duration
    }, 150) // Half of the animation to switch at midpoint
  }
  
  if (!mounted) return (
    <div className="flex h-8 w-16 items-center rounded-full bg-gray-200 dark:bg-gray-700 p-1">
      <div className="h-6 w-6 rounded-full bg-white"></div>
    </div>
  )

  return (
    <div className="flex h-8 w-16 items-center rounded-full bg-gray-200 dark:bg-gray-700 p-1 relative overflow-hidden">
      <button
        onClick={toggleTheme}
        className={`flex h-6 w-6 items-center justify-center rounded-full transition-all duration-300 ${
          resolvedTheme === "dark" 
            ? "translate-x-8 bg-gray-800" 
            : "bg-white"
        }`}
        aria-label="Toggle theme"
      >
        <div className="relative w-4 h-4 overflow-hidden">
          <div 
            className={`absolute inset-0 flex justify-center items-center transition-transform duration-300 ease-in-out ${
              isAnimating 
                ? resolvedTheme === "dark" 
                  ? "translate-y-full" 
                  : "-translate-y-full" 
                : "translate-y-0"
            }`}
          >
            {resolvedTheme === "dark" ? (
              <Moon size={14} className="text-white" />
            ) : (
              <Sun size={14} className="text-yellow-500" />
            )}
          </div>
          <div 
            className={`absolute inset-0 flex justify-center items-center transition-transform duration-300 ease-in-out ${
              isAnimating 
                ? resolvedTheme === "dark" 
                  ? "translate-y-0" 
                  : "translate-y-0" 
                : resolvedTheme === "dark" 
                  ? "-translate-y-full" 
                  : "translate-y-full"
            }`}
          >
            {resolvedTheme === "dark" ? (
              <Sun size={14} className="text-yellow-500" />
            ) : (
              <Moon size={14} className="text-white" />
            )}
          </div>
        </div>
      </button>
    </div>
  )
} 