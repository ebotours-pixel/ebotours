
import { getBookings } from "@/lib/bookings";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export default function BookingsPage() {
  const bookings = getBookings();

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Bookings Management</h2>
            <p className="text-muted-foreground">
                Here's a list of all tour bookings from your customers.
            </p>
        </div>
      </div>
      <DataTable columns={columns} data={bookings} />
    </div>
  );
}
