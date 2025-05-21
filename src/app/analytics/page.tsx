import { AppSidebar } from "@/components/app-sidebar"
import GymDashboardCharts from "@/components/gym-dashboard-charts"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"



export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col min-h-screen">
          <div className="@container/main flex flex-1 flex-col gap-2 pl-4">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {/* Use a grid with sidebar layout */}
              <GymDashboardCharts />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}