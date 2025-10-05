'use client';

import { useState } from 'react';
import type { Booking } from "@/types";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { updateBookingStatus, deleteBooking } from '@/lib/supabase/bookings';

interface BookingsClientProps {
  initialBookings: Booking[];
}

export function BookingsClient({ initialBookings }: BookingsClientProps) {
  // Although we revalidate the path, managing state locally provides a more instant UI update.
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);

  const handleUpdateStatus = async (bookingId: string, status: Booking['status']) => {
    await updateBookingStatus(bookingId, status);
    // For an instant UI update, you can update the local state here as well.
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
  };

  const handleDeleteBooking = async (bookingId: string) => {
    await deleteBooking(bookingId);
    // For an instant UI update, you can update the local state here as well.
    setBookings(prev => prev.filter(b => b.id !== bookingId));
  };

  return (
    <DataTable 
      columns={columns({ onUpdateStatus: handleUpdateStatus, onDelete: handleDeleteBooking })} 
      data={bookings} 
    />
  );
}
