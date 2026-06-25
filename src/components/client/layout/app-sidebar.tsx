"use client"

import * as React from "react"
import { useSession } from "next-auth/react"

import { NavMain } from "@/components/client/layout/nav-main"
import { NavUser } from "@/components/client/layout/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LayoutDashboardIcon, ListIcon, UsersIcon, CommandIcon } from "lucide-react"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/client/dashboard",
      icon: (
        <LayoutDashboardIcon
        />
      ),
    },
    {
      title: "Enquiries",
      url: "/client/enquiry",
      icon: (
        <ListIcon
        />
      ),
    },
    {
      title: "Referrals",
      url: "/client/referral",
      icon: (
        <UsersIcon
        />
      ),
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();

  const userName = session?.user?.name || (session?.user?.email ? session.user.email.split('@')[0] : "User");
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
              <a href="#">
                <CommandIcon className="size-5!" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
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
