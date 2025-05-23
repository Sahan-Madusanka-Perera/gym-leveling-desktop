import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getTrainers } from "../actions/trainer"
import { TrainerTable } from "@/components/trainer-table"

export default async function Page() {
  // Fetch trainers from Supabase
  const trainers = await getTrainers()

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <TrainerTable data={trainers} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}