"use client";

import { AppSidebar } from "@/components/app-sidebar";
import NavBreadcrumb from "@/components/nav/nav-breadcrumb";

import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SessionGuard } from "@/provider/session-provider";
import type React from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionGuard>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <NavBreadcrumb />
            </div>
          </header>
          <main className="px-4">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </SessionGuard>
  );
}
