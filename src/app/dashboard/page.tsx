import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { PopularSessions } from "@/components/popular-sessions"
import { SessionTimeline } from "@/components/session-timeline"

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 px-4 lg:px-6">
                <div className="lg:col-span-3 flex flex-col gap-4">
                  <SectionCards />
                  <div className="w-full">
                    <ChartAreaInteractive />
                  </div>
                </div>
                <div className="lg:col-span-1">
                  <PopularSessions />
                </div>
                <div className="lg:col-span-4">
                  <SessionTimeline />
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
