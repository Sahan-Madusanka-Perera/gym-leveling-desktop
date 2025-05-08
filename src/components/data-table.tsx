"use client"

import * as React from "react"
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  ColumnDef,
  ColumnFiltersState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  CheckCircle2Icon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ColumnsIcon,
  GripVerticalIcon,
  MoreVerticalIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react"
import { toast } from "sonner"
import { z } from "zod"
import { useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { AddMemberDialog } from "./add-member-dialog"
import { EditMemberDialog } from "./edit-member-dialog"
import { deleteMembers, assignTrainer } from "@/app/actions/member"
import { getTrainersForDropdown } from "@/app/actions/trainer"


// Define schema based on your Supabase Member table
export const memberSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().nullable().default(""),
  gender: z.string(),
  phoneNumber: z.string(),
  emergencyContact: z.string().nullable().default(""),
  healthInfo: z.string().nullable().default(""),
  activityLevel: z.string(),
  trainer: z.string().default("Assign trainer"),
  trainer_id: z.number().nullable().optional(),
})

export type Member = z.infer<typeof memberSchema>

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  })

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:bg-transparent"
    >
      <GripVerticalIcon className="size-3 text-muted-foreground" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

// Define row component for drag-and-drop
function DraggableRow({ row }: { row: Row<Member> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  })

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

export function DataTable({
  data: initialData,
}: {
  data: Member[]
}) {
  const [data, setData] = React.useState(() => initialData)
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })
  // States for edit dialog
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [selectedMember, setSelectedMember] = React.useState<any>(null)
  
  // Move trainers state to the component level
  const [trainers, setTrainers] = React.useState<{trainer_id: number, name: string}[]>([])
  const [trainersLoading, setTrainersLoading] = React.useState(false)
  
  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  )
  const router = useRouter()

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  )

  // Update the local data state when the initialData prop changes
  // This is necessary for server-side changes to reflect in the UI
  React.useEffect(() => {
    setData(initialData)
  }, [initialData])
  
  // Load trainers once at the component level
  React.useEffect(() => {
    async function loadTrainers() {
      try {
        setTrainersLoading(true)
        const trainersData = await getTrainersForDropdown()
        setTrainers(trainersData)
      } catch (error) {
        console.error("Failed to load trainers:", error)
        toast.error("Failed to load trainers")
      } finally {
        setTrainersLoading(false)
      }
    }
    
    loadTrainers()
  }, [])
  
  // Function to handle trainer assignment at the component level
  const handleTrainerChange = async (memberId: number, trainerId: string) => {
    try {
      // Show loading state
      const toastId = toast.loading("Updating trainer assignment...")
      
      // Convert trainerId to number or null
      const newTrainerId = trainerId === "null" ? null : parseInt(trainerId, 10)
      
      // Call the server action to update the assignment
      await assignTrainer(memberId, newTrainerId)
      
      // Success notification
      toast.dismiss(toastId)
      toast.success("Trainer assignment updated")
      
      // Update local data instead of refreshing the entire page
      setData(prevData => 
        prevData.map(member => {
          if (member.id === memberId) {
            const assignedTrainer = newTrainerId === null ? 
              "Assign trainer" : 
              trainers.find(t => t.trainer_id === newTrainerId)?.name || "Assign trainer"
            
            return {
              ...member,
              trainer: assignedTrainer,
              trainer_id: newTrainerId
            }
          }
          return member
        })
      )
    } catch (error) {
      console.error("Error updating trainer assignment:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update trainer assignment")
    }
  }

  const columns = React.useMemo<ColumnDef<Member>[]>(() => [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.id} />,
    },
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
      cell: ({ row }) => {
        return <div>{row.original.name}</div>
      },
      enableHiding: false,
    },
    {
      accessorKey: "email",
      header: "E-Mail",
      cell: ({ row }) => (
        <div>{row.original.email}</div>
      ),
    },
    {
      accessorKey: "gender",
      header: "Gender",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className="px-1.5 text-muted-foreground"
        >
          {row.original.gender}
        </Badge>
      ),
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone Number",
      cell: ({ row }) => (
        <div>{row.original.phoneNumber}</div>
      ),
    },
    {
      accessorKey: "emergencyContact",
      header: "Emergency Contact Number",
      cell: ({ row }) => (
        <div>{row.original.emergencyContact}</div>
      ),
    },
    {
      accessorKey: "healthInfo",
      header: "Health Info",
      cell: ({ row }) => (
        <div>{row.original.healthInfo}</div>
      ),
    },
    {
      accessorKey: "activityLevel",
      header: "Activity Level",
      cell: ({ row }) => (
        <div>{row.original.activityLevel}</div>
      ),
    },
    {
      accessorKey: "trainer",
      header: "Trainer",
      cell: ({ row }) => {
        const member = row.original;
        const isAssigned = member.trainer !== "Assign trainer";

        if (trainersLoading) {
          return <div className="text-sm text-muted-foreground">Loading trainers...</div>;
        }

        return (
          <>
            <Label htmlFor={`${member.id}-trainer`} className="sr-only">
              Trainer
            </Label>
            <Select 
              defaultValue={member.trainer_id?.toString() || "null"}
              onValueChange={(value) => handleTrainerChange(member.id, value)}
            >
              <SelectTrigger
                className="h-8 w-[180px]"
                id={`${member.id}-trainer`}
              >
                <SelectValue placeholder={isAssigned ? member.trainer : "Assign trainer"} />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectItem value="null">No Trainer</SelectItem>
                {trainers.map((trainer) => (
                  <SelectItem key={trainer.trainer_id} value={trainer.trainer_id.toString()}>
                    {trainer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const member = row.original;
        
        // Function to handle edit action
        const onEdit = async () => {
          try {
            const supabase = await import("@/lib/supabase/client").then(m => m.createClient());
            
            // Get the original member data from Supabase
            const { data, error } = await supabase
              .from("Member")
              .select("*")
              .eq("member_id", member.id)
              .single();
              
            if (error) {
              toast.error(`Error fetching member details: ${error.message}`);
              return;
            }
            
            // Set the selected member with full details for editing
            setSelectedMember(data);
            setEditDialogOpen(true);
          } catch (error) {
            console.error("Error preparing to edit member:", error);
            toast.error("Could not prepare member for editing");
          }
        };
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
                size="icon"
              >
                <MoreVerticalIcon />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  // Delete the member
                  toast.promise(
                    deleteMembers([member.id]).then(() => {
                      const newData = data.filter(row => row.id !== member.id);
                      setData(newData);
                      router.refresh();
                      return "Member deleted successfully";
                    }),
                    {
                      loading: "Deleting member...",
                      success: (message) => message,
                      error: "Failed to delete member",
                    }
                  );
                }}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], [data, router, setEditDialogOpen, setSelectedMember, trainers, trainersLoading, handleTrainerChange]);

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
    getRowId: (row) => row.id.toString(),
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
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(data, oldIndex, newIndex)
      })
    }
  }

  const handleDeleteSelected = async () => {
    const selectedRows = Object.keys(rowSelection).map(Number)
    
    if (selectedRows.length === 0) {
      toast.error("No rows selected")
      return
    }
    
    toast.promise(
      deleteMembers(selectedRows).then(() => {
        const newData = data.filter(row => !selectedRows.includes(row.id))
        setData(newData)
        setRowSelection({})
        router.refresh() // Refresh the page to reflect the changes
        return `${selectedRows.length} row(s) deleted successfully`
      }),
      {
        loading: "Deleting selected rows...",
        success: (message) => message,
        error: "Failed to delete rows",
      }
    )
  }

  return (
    <>
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
            <AddMemberDialog />
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
            <DndContext
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleDragEnd}
              sensors={sensors}
              id={sortableId}
            >
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
                <TableBody className="**:data-[slot=table-cell]:first:w-8">
                  {table.getRowModel().rows?.length ? (
                    <SortableContext
                      items={dataIds}
                      strategy={verticalListSortingStrategy}
                    >
                      {table.getRowModel().rows.map((row) => (
                        <DraggableRow key={row.id} row={row} />
                      ))}
                    </SortableContext>
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
            </DndContext>
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
              <div className="ml-auto flex items-center gap-2 lg:ml-0">
                <Button
                  variant="outline"
                  className="hidden h-8 w-8 p-0 lg:flex"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to first page</span>
                  <ChevronsLeftIcon />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to previous page</span>
                  <ChevronLeftIcon />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to next page</span>
                  <ChevronRightIcon />
                </Button>
                <Button
                  variant="outline"
                  className="hidden size-8 lg:flex"
                  size="icon"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to last page</span>
                  <ChevronsRightIcon />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Edit Member Dialog */}
      {selectedMember && (
        <EditMemberDialog
          member={selectedMember}
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) {
              // Refresh the data when dialog is closed
              router.refresh();
            }
          }}
        />
      )}
    </>
  )
}