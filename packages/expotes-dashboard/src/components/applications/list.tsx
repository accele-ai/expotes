import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { useMemo } from "react";

import { useSDK } from "@/lib/api";

import { usePersistStore } from "@/store/persist";
import { sdk } from "@expotes/sdk";
import { DataTable } from "../app-table";
import { Button } from "../ui/button";

type Application = sdk.v1.application.list.Output[number];

export default function Applications() {
	const { teamId } = usePersistStore();
	return teamId ? <ApplicationsTable key={teamId} teamId={teamId} /> : null;
}

function ApplicationsTable({ teamId }: { teamId: string }) {
	const {
		data: applications,
		isLoading,
		error,
	} = useSDK(sdk.v1.application.list, [{ teamId }]);

	const columnHelper = createColumnHelper<Application>();

	const columns = useMemo<ColumnDef<Application>[]>(
		() => [
			columnHelper.accessor("id", {
				header: "ID",
				cell: (info) => info.getValue(),
			}) as ColumnDef<Application>,
			columnHelper.accessor("teamId", {
				header: "Team ID",
				cell: (info) => info.getValue(),
			}) as ColumnDef<Application>,
			columnHelper.accessor("name", {
				header: "Name",
				cell: (info) => info.getValue(),
			}) as ColumnDef<Application>,
			columnHelper.accessor("handle", {
				header: "Handle",
				cell: (info) => info.getValue(),
			}) as ColumnDef<Application>,
			columnHelper.accessor("createdAt", {
				header: "Created At",
				cell: (info) => info.getValue(),
			}) as ColumnDef<Application>,
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
		[columnHelper],
	);

	if (isLoading) return <div>Loading...</div>;
	if (error) return <div>Error: {error.message}</div>;

	return (
		<div className="flex flex-col gap-4">
			<DataTable columns={columns} data={applications || []} />
		</div>
	);
}
