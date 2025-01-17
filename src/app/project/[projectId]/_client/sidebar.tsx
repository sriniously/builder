"use client";

import { Database, FileJson, Globe } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const menuItems = [
  { icon: FileJson, label: "Resources", href: "/resources" },
  { icon: Globe, label: "API", href: "/api" },
  { icon: Database, label: "Database", href: "/database" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const params = useParams();

  console.log(pathname === `/project/${params.projectId}/resources`);

  return (
    <Sidebar>
      <SidebarHeader>
        <h2 className="text-xl font-bold p-4">Builder</h2>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const targetPath = `/project/${params.projectId}${item.href}`;

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === targetPath}
                    >
                      <Link href={targetPath}>
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
