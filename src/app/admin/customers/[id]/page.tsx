"use client";

import { useParams, notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { getCustomerById } from "@/lib/customers";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Hash,
  Users,
  DollarSign,
  ShoppingBag,
  Newspaper,
  Home,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;
  const customer = getCustomerById(customerId);

  if (!customer) {
    return notFound();
  }

  const customerNameInitial = customer.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/customers">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to customers</span>
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Customer Details
          </h2>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage
                  src={`https://api.dicebear.com/8.x/lorelei/svg?seed=${customer.name}`}
                  alt={customer.name}
                />
                <AvatarFallback className="text-3xl">
                  {customerNameInitial}
                </AvatarFallback>
              </Avatar>
              <CardTitle>{customer.name}</CardTitle>
              <CardDescription>{customer.email}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Source</span>
                <Badge
                  variant="outline"
                  className={cn(
                    "font-medium",
                    customer.source === "Booking" &&
                      "border-sky-500 text-sky-600",
                    customer.source === "Newsletter" &&
                      "border-amber-500 text-amber-600",
                  )}
                >
                  {customer.source === "Booking" ? (
                    <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
                  ) : (
                    <Newspaper className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  {customer.source}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Customer Since</span>
                <span className="font-semibold">
                  {format(new Date(customer.createdAt), "PPP")}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-semibold">{customer.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold">{customer.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2 grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Lifetime Stats</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <ShoppingBag />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Bookings
                  </p>
                  <p className="font-semibold text-xl">
                    {customer.totalBookings}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                  <DollarSign />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="font-semibold text-xl">
                    ${customer.totalSpent.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Booking History</CardTitle>
              <CardDescription>
                A list of all tours this customer has booked.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tour</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customer.bookings.length > 0 ? (
                    customer.bookings.map((booking) => (
                      <TableRow
                        key={booking.id}
                        onClick={() =>
                          router.push(`/admin/bookings/${booking.id}`)
                        }
                        className="cursor-pointer"
                      >
                        <TableCell className="font-medium">
                          {booking.tourName}
                        </TableCell>
                        <TableCell>
                          {format(new Date(booking.bookingDate), "PP")}
                        </TableCell>
                        <TableCell>
                          ${booking.totalPrice.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              booking.status === "Confirmed"
                                ? "default"
                                : booking.status === "Pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                            className={cn(
                              "text-xs",
                              booking.status === "Confirmed" &&
                                "bg-green-100 text-green-800",
                              booking.status === "Pending" &&
                                "bg-yellow-100 text-yellow-800",
                              booking.status === "Cancelled" &&
                                "bg-red-100 text-red-800",
                            )}
                          >
                            {booking.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24">
                        No bookings found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
