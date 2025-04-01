"use client"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useState } from "react"
import { Sun, Moon } from "lucide-react"

export function SiteHeader() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // You would typically also apply the theme change to your application here
    // For example: document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">Welcome Back!</h1>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex h-8 w-16 items-center rounded-full bg-gray-200 p-1 dark:bg-gray-700">
            <button
              onClick={toggleTheme}
              className={`flex h-6 w-6 items-center justify-center rounded-full transition-all duration-300 ${
                isDarkMode 
                  ? "translate-x-8 bg-gray-800" 
                  : "bg-white"
              }`}
            >
              {isDarkMode ? (
                <Moon size={14} className="text-white" />
              ) : (
                <Sun size={14} className="text-yellow-500" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}