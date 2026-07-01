"use client"

import * as React from "react"
import { useSession } from "next-auth/react"

import { NavMain } from "@/components/partner/layout/nav-main"
import { NavUser } from "@/components/partner/layout/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ListIcon, FileTextIcon, CommandIcon } from "lucide-react"
import Link from "next/link"

const data = {
  navMain: [
    {
      title: "My Enquiries",
      url: "/clients/enquiries",
      icon: (
        <ListIcon />
      ),
    },
    {
      title: "My Invoices",
      url: "/clients/invoices",
      icon: (
        <FileTextIcon />
      ),
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();

  const userName = session?.user?.name || (session?.user?.email ? session.user.email.split('@')[0] : "Client");
  const userEmail = session?.user?.email || "";
  const userAvatar = session?.user?.image || "";

  const activeUser = {
    name: userName,
    email: userEmail,
    avatar: userAvatar,
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/">
                <CommandIcon className="size-5!" />
                <span className="text-base font-semibold">SpendSmart</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={activeUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
