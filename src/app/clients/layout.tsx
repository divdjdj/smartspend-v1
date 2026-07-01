import { AppSidebar } from "@/components/clients/layout/app-sidebar"
import { SiteHeader } from "@/components/clients/layout/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
