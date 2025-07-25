
"use client"

import type { ColumnDef } from "@tanstack/react-table"
import type { Booking } from "@/types"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export const columns: ColumnDef<Booking>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "customerName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Customer
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
     cell: ({ row }) => {
      return (
        <div className="flex flex-col">
            <span className="font-medium">{row.original.customerName}</span>
            <span className="text-xs text-muted-foreground">{row.original.customerEmail}</span>
        </div>
      )
    }
  },
  {
    accessorKey: "tourName",
    header: "Tour",
     cell: ({ row }) => {
        const tourSlug = row.original.tourSlug;
        return (
             <Link href={`/tours/${tourSlug}`} target="_blank" className="font-medium text-primary hover:underline">
                {row.getValue("tourName")}
            </Link>
        )
     }
  },
  {
    accessorKey: "bookingDate",
    header: "Booking Date",
    cell: ({ row }) => {
        const date = new Date(row.getValue("bookingDate"));
        return format(date, "PPP");
    }
  },
  {
    accessorKey: "totalPrice",
    header: "Total Price",
    cell: ({ row }) => {
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(row.getValue("totalPrice"));

      return <div className="font-mono">{formatted}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge 
            variant={
                status === "Confirmed" ? "default" : 
                status === "Pending" ? "secondary" : 
                "destructive"
            } 
            className={cn(
                status === "Confirmed" && "bg-green-100 text-green-800",
                status === "Pending" && "bg-yellow-100 text-yellow-800",
                status === "Cancelled" && "bg-red-100 text-red-800"
            )}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const booking = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>View Booking Details</DropdownMenuItem>
            <DropdownMenuItem>Mark as Confirmed</DropdownMenuItem>
            <DropdownMenuItem>Mark as Cancelled</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
              Delete Booking
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
