"use client";

import { ChevronsUpDown, Plus } from "lucide-react";
import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useSDK } from "@/lib/api";
import { usePersistStore } from "@/store/persist";
import { sdk } from "@expotes/sdk";
import { useEffect, useMemo } from "react";

export function TeamSwitcher() {
  const { isMobile } = useSidebar();
  const { teamId, setTeamId } = usePersistStore();
  const { data: teams } = useSDK(sdk.v1.team.list, [], {
    keepPreviousData: true,
  });

  const activeTeam = useMemo(() => {
    if (teamId && teams?.length && teams.length > 0) {
      return teams.find((team) => team.id === teamId);
    }
    return null;
  }, [teams, teamId]);

  useEffect(() => {
    if (!teamId && teams?.length && teams.length > 0) {
      setTeamId(teams[0].id);
    }
  }, [teams, teamId, setTeamId]);

  if (!teams) return null;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {activeTeam ? (
                <>
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    {/* <activeTeam.logo className="size-4" /> */}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {activeTeam.name}
                    </span>
                    {/* <span className="truncate text-xs">{activeTeam.plan}</span> */}
                  </div>
                  <ChevronsUpDown className="ml-auto" />
                </>
              ) : (
                <>
                  <div className="h-8 w-8 animate-pulse rounded-lg bg-sidebar-accent" />
                  <div className="grid flex-1 gap-1">
                    <div className="h-4 w-24 animate-pulse rounded bg-sidebar-accent" />
                  </div>
                  <ChevronsUpDown className="ml-auto" />
                </>
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Teams
            </DropdownMenuLabel>
            {teams.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => setTeamId(team.id)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  {/* <team.logo className="size-4 shrink-0" /> */}
                </div>
                {team.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Add team</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
