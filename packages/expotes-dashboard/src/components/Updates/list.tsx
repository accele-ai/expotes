import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React, { useMemo } from "react";

import { useSDK } from "@/lib/api";

import { usePersistStore } from "@/store/persist";
import { sdk } from "@expotes/sdk";
import type { FindAllUpdatesDto } from "@expotes/sdk/structures";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { DataTable } from "../app-table";
import { Button } from "../ui/button";

type Update = FindAllUpdatesDto;

export default function UpdatesTable() {
  const { teamId } = usePersistStore();
  if (!teamId) return null;

  const [appId] = useQueryState("appId");
  const {
    data: applications,
    isLoading,
    error,
  } = useSDK(sdk.v1.updates.list, [{ appId: appId || undefined }]);

  const columnHelper = createColumnHelper<Update>();

  const columns = React.useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "ID",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("runtimeVersion", {
        header: "Runtime Version",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("createdAt", {
        header: "Created At",
        cell: (info) => info.getValue(),
      }),
      columnHelper.display({
        header: "Actions",
        cell: (info) => (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                // Handle edit action
                console.log("Edit", info.cell);
              }}
            >
              Edit
            </Button>
            <Button
              onClick={() => {
                // Handle delete action
                console.log("Delete", info.getValue());
              }}
            >
              Delete
            </Button>
          </div>
        ),
      }),
    ],
    [columnHelper]
  );

  const table = useReactTable({
    data: applications || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="flex flex-col gap-4">
      <DataTable columns={columns} data={applications || []} />
    </div>
  );
}