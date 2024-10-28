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

import { useSDK, useSDKFetcher } from "@/lib/api";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { usePersistStore } from "@/store/persist";
import { sdk } from "@expotes/sdk";
import type {
  FindAllUpdatesDto,
  FindAllUpdatesEntity,
} from "@expotes/sdk/structures";
import { CopyIcon } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";
import useSWRInfinite from "swr/infinite";
import { DataTable } from "../app-table";
import { Button } from "../ui/button";

type Update = FindAllUpdatesEntity;

export default function UpdatesTable() {
  const { teamId } = usePersistStore();
  if (!teamId) return null;

  const [appId] = useQueryState("appId");
  const updatesFetcher = useSDKFetcher(sdk.v1.updates.list);
  const {
    data: updates,
    isLoading,
    error,
    size,
    setSize,
  } = useSWRInfinite(
    (pageIndex, previousPageData) => {
      const args = { appId: appId || undefined, size: 10 };

      if (previousPageData && previousPageData.length < 10) return null;
      if (pageIndex === 0) return args;

      return {
        ...args,
        cursor: previousPageData[previousPageData.length - 1].id,
      };
    },
    (args) => updatesFetcher([args])
  );

  const columnHelper = createColumnHelper<Update>();

  const columns = React.useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "ID",
        cell: (info) => (
          <div className="flex flex-row items-center gap-2">
            <span>{info.getValue()}</span>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="icon" variant="ghost">
                  <CopyIcon />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] max-w-[50vw] overflow-auto">
                <DialogTitle>Updates Details</DialogTitle>
                <pre>{JSON.stringify(info.row.original, null, 4)}</pre>
              </DialogContent>
            </Dialog>
          </div>
        ),
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

  const updatesData = useMemo(
    () => (size ? updates?.[size - 1] : []) || [],
    [updates, size]
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="flex flex-col gap-4 w-full">
      <DataTable
        columns={columns}
        data={updatesData || []}
        pagination={{
          page: size,
          onPageChange: setSize,
          hasPreviousPage: size > 0,
          hasNextPage: updatesData.length === 10,
        }}
      />
    </div>
  );
}
