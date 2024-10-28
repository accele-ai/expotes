"use client";

import { Button } from "@/components/ui/button";
import UpdatesTable from "@/components/updates/list";
import { NewUpdateDialog } from "@/components/updates/new";

export default function Update() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full">
      <div className="flex flex-row justify-between w-full">
        <NewUpdateDialog />
      </div>
      <UpdatesTable />
    </div>
  );
}
