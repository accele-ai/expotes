import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import React, { useMemo } from 'react'

import { useSDK } from '@/services/api'
import { usePersistStore } from '@/store/persist'
import { sdk } from '@expotes/sdk'

type Application = {
  id: string
  name: string
}

export default function Applications() {
  const { teamId } = usePersistStore()
  const {
    data: applications,
    isLoading,
    error,
  } = useSDK(sdk.v1.application.list, [{ teamId }])

  const columnHelper = createColumnHelper<Application>()

  const columns = React.useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'Team ID',
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor('name', {
        header: 'Name',
        cell: (info) => info.getValue(),
      }),
    ],
    [columnHelper],
  )

  const table = useReactTable({
    data: applications || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <Table aria-label="Applications table">
      <TableHeader>
        {table
          .getHeaderGroups()
          .filter((headerGroup) => headerGroup.headers.length > 0)
          .flatMap((headerGroup) =>
            headerGroup.headers.map((header) => (
              <TableColumn key={header.id}>
                {flexRender(
                  header.column.columnDef.header,
                  header.getContext(),
                )}
              </TableColumn>
            )),
          )}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
