// app/path-to-your-page/page.tsx
import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "@/components/data-table"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getMembers } from "../actions/member"

export default async function Page() {
  // Fetch members from Supabase
  const members = await getMembers()

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <DataTable data={members} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}