"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"
import { DayPicker, CaptionProps } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  const today = new Date()
  const [month, setMonth] = React.useState<Date>(today)

  const handleMonthChange = (newMonth: number) => {
    const updatedDate = new Date(month)
    updatedDate.setMonth(newMonth)
    setMonth(updatedDate)
  }

  const handleYearChange = (newYear: number) => {
    const updatedDate = new Date(month)
    updatedDate.setFullYear(newYear)
    setMonth(updatedDate)
  }

  // Custom Caption with ShadCN dropdowns
  function CustomCaption({ displayMonth }: CaptionProps) {
    return (
      <div className="flex justify-between items-center w-full">
        {/* Month Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-1 border rounded-md text-sm bg-background">
            {displayMonth.toLocaleString("default", { month: "long" })}
            <ChevronDown className="size-4 opacity-70" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {Array.from({ length: 12 }, (_, i) => (
              <DropdownMenuItem key={i} onClick={() => handleMonthChange(i)}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Year Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-1 border rounded-md text-sm bg-background">
            {displayMonth.getFullYear()}
            <ChevronDown className="size-4 opacity-70" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {Array.from({ length: 100 }, (_, i) => {
              const year = today.getFullYear() - 50 + i
              return (
                <DropdownMenuItem key={year} onClick={() => handleYearChange(year)}>
                  {year}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      month={month}
      onMonthChange={setMonth}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        caption: "flex justify-between items-center pt-1 relative w-full",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "size-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-x-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-range-end)]:rounded-r-md",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "size-8 p-0 font-normal aria-selected:opacity-100"
        ),
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "day-outside text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Caption: CustomCaption,
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft className={cn("size-4", className)} {...props} />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight className={cn("size-4", className)} {...props} />
        ),
      }}
      {...props}
    />
  )
}

export { Calendar }
