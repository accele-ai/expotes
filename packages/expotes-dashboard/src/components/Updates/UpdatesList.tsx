import {
  Button,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
  useDisclosure,
} from '@nextui-org/react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import React from 'react'
import { useLocation, useParams } from 'wouter'
import type {
  CreateUpdatesDto,
  FindAllUpdatesDto,
} from '@expotes/sdk/structures'

import { useTeam } from '@/provider/SessionProvider'
import { useSDK } from '@/services/api'
import { sdk } from '@expotes/sdk'

import { CreateUpdateModal } from './CreateUpdate'

export default function UpdateList() {
  const [_, setLocation] = useLocation()
  const { id: teamId } = useTeam()
  const { appId } = useParams()

  const { isOpen, onOpen, onClose } = useDisclosure()

  const { data: applications } = useSDK(sdk.v1.application.list, [{ teamId }])

  const {
    data: updates,
    isLoading,
    error,
  } = useSDK(sdk.v1.updates.list, [{ appId: appId ?? undefined }])

  const columns: ColumnDef<FindAllUpdatesDto>[] = React.useMemo(
    () => [
      {
        id: 'id',
        Header: 'ID',
        accessorKey: 'id',
      },
      {
        id: 'status',
        Header: 'Status',
        cell: ({ row }) => {
          return (
            <div>
              {row.index === 0 ? (
                <Chip color="success">Working</Chip>
              ) : (
                <Chip color="default">Expired</Chip>
              )}
            </div>
          )
        },
      },
      {
        id: 'type',
        Header: 'Type',
        accessorKey: 'isRollbacked',
        cell: ({ getValue }) => {
          const value = getValue()
          return (
            <div>
              {value ? (
                <Chip color="warning">Rollback</Chip>
              ) : (
                <Chip color="primary">Update</Chip>
              )}
            </div>
          )
        },
      },
      {
        id: 'runtimeVersion',
        Header: 'Runtime Version',
        accessorKey: 'runtimeVersion',
      },
      {
        id: 'createdAt',
        Header: 'Time',
        accessorKey: 'createdAt',
      },
    ],
    [],
  )

  const table = useReactTable({
    data: updates ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isLoading || !applications) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row items-center gap-4">
        <Select
          label="Select App"
          placeholder="Choose an app"
          selectedKeys={appId ? [appId] : []}
          onChange={(e) => {
            setLocation(`/${e.target.value}`)
          }}
        >
          {applications.map((application) => (
            <SelectItem key={application.id} value={application.id}>
              {application.name}
            </SelectItem>
          ))}
        </Select>
        <Button onPress={() => onOpen()}>Create Update</Button>
        <CreateUpdateModal isOpen={isOpen} onClose={onClose} />
      </div>

      <Table>
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
    </div>
  )
}
