"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ColumnsIcon,
  MoreHorizontalIcon,
  TrashIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AddTrainerDialog } from "./add-trainer-dialog"
import { deleteTrainers } from "@/app/actions/trainer"
import { useRouter } from "next/navigation"
import { type Trainer, type TrainerWithTempId } from "@/types/trainer"
import { EditTrainerDialog } from "./edit-trainer-dialog"

export function TrainerTable({ data: initialData }: { data: Trainer[] }) {
  const router = useRouter()
  
  console.log("TrainerTable: Initial data from server:", initialData);
  
  // Ensure IDs are present for all data items
  const [data, setData] = React.useState<TrainerWithTempId[]>(() => {
    return initialData.map((item, index) => {
      // Log each item to see what we're getting from the server
      console.log(`TrainerTable: Processing item ${index}:`, item);
      
      return {
        ...item,
        // If trainer_id exists, use it as id. Otherwise, if id exists, use that.
        // Only use temp-id as a last resort
        id: item.trainer_id ?? item.id ?? `temp-${index}`,
        // Preserve trainer_id if it exists
        trainer_id: item.trainer_id
      };
    });
  })
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [selectedTrainer, setSelectedTrainer] = React.useState<TrainerWithTempId | null>(null)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)

  // Update the local data state when the initialData prop changes
  React.useEffect(() => {
    if (initialData && Array.isArray(initialData)) {
      setData(initialData.map((item, index) => ({
        ...item,
        // If trainer_id exists, use it as id. Otherwise, if id exists, use that.
        // Only use temp-id as a last resort
        id: item.trainer_id ?? item.id ?? `temp-${index}`,
        // Preserve trainer_id if it exists
        trainer_id: item.trainer_id
      })))
    }
  }, [initialData])

  const columns: ColumnDef<TrainerWithTempId>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
      enableHiding: false,
    },
    {
      accessorKey: "specialization",
      header: "Specialization",
      cell: ({ row }) => <div>{row.getValue("specialization") || "-"}</div>,
    },
    {
      accessorKey: "contact",
      header: "Contact",
      cell: ({ row }) => <div>{row.getValue("contact") || "-"}</div>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const trainer = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
                size="icon"
              >
                <MoreHorizontalIcon className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem
                onClick={() => {
                  // Enhanced debugging to show all details
                  console.log("Edit button clicked for trainer:", JSON.stringify(row.original, null, 2));
                  
                  // Double check that trainer_id is correctly passed
                  if ('trainer_id' in row.original) {
                    console.log("Found trainer_id in row data:", row.original.trainer_id);
                  } else {
                    console.warn("WARNING: trainer_id not found in row data!", row.original);
                  }
                  
                  setSelectedTrainer(row.original)
                  setEditDialogOpen(true)
                }}
                disabled={typeof trainer.id === 'string' && trainer.id.startsWith('temp-')}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(String(trainer.id))
                  toast.success("Copied to clipboard")
                }}
              >
                Copy trainer ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  try {
                    // Only attempt to delete if ID is numeric
                    if (typeof trainer.id === 'number') {
                      await deleteTrainers([trainer.id])
                      toast.success("Trainer deleted successfully")
                      router.refresh()
                    } else {
                      // Try to convert string ID to number if possible
                      const numericId = parseInt(String(trainer.id), 10)
                      if (!isNaN(numericId)) {
                        await deleteTrainers([numericId])
                        toast.success("Trainer deleted successfully")
                        router.refresh()
                      } else {
                        toast.error("Cannot delete: Invalid trainer ID")
                      }
                    }
                  } catch (error) {
                    toast.error("Failed to delete trainer")
                  }
                }}
              >
                Delete trainer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      enableHiding: false,
    },
  ]

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => {
      return String(row.id)
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const handleDeleteSelected = async () => {
    const selectedRows = Object.keys(rowSelection)
    
    if (selectedRows.length === 0) {
      toast.error("No rows selected")
      return
    }
    
    // Filter out only numeric IDs for deletion
    const validIds = selectedRows
      .map(id => {
        const numericId = parseInt(id, 10)
        return isNaN(numericId) ? null : numericId
      })
      .filter((id): id is number => id !== null)
    
    if (validIds.length === 0) {
      toast.error("No valid trainer IDs to delete")
      return
    }
    
    toast.promise(
      deleteTrainers(validIds).then(() => {
        const newData = data.filter(row => {
          const rowId = typeof row.id === 'number' ? row.id : parseInt(String(row.id), 10)
          return isNaN(rowId) || !validIds.includes(rowId)
        })
        setData(newData)
        setRowSelection({})
        router.refresh() // Refresh the page to reflect the changes
        return `${validIds.length} row(s) deleted successfully`
      }),
      {
        loading: "Deleting selected rows...",
        success: (message) => message,
        error: "Failed to delete rows",
      }
    )
  }

  return (
    <div className="flex w-full flex-col justify-start gap-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <ColumnsIcon className="mr-2 h-4 w-4" />
                <span className="hidden lg:inline">Customize Columns</span>
                <span className="lg:hidden">Columns</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDeleteSelected}
            disabled={Object.keys(rowSelection).length === 0}
          >
            <TrashIcon className="mr-2 h-4 w-4" />
            <span className="hidden lg:inline">Delete Selected</span>
          </Button>
          <AddTrainerDialog />
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Filter by name..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        </div>
      </div>
      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-between px-4">
          <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Rows per page
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value))
                }}
              >
                <SelectTrigger className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronsLeftIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <ChevronsRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      {selectedTrainer && (
        <EditTrainerDialog
          trainer={selectedTrainer}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}
    </div>
  )
} 