'use client';

import { useState } from 'react';
import type { Booking } from '@/types';
import { columns } from './columns';
import { DataTable } from './data-table';
import { updateBookingStatus, deleteBooking } from '@/lib/supabase/bookings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Clock, CheckCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BookingsClientProps {
  initialBookings: Booking[];
}

export function BookingsClient({ initialBookings }: BookingsClientProps) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);

  const handleUpdateStatus = async (bookingId: string, status: Booking['status']) => {
    await updateBookingStatus(bookingId, status);
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status } : b)));
  };

  const handleDeleteBooking = async (bookingId: string) => {
    await deleteBooking(bookingId);
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
  };

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice ?? 0), 0);
  const pendingBookings = bookings.filter((b) => b.status === 'Pending').length;
  const confirmedBookings = bookings.filter((b) => b.status === 'Confirmed').length;

  const handleExport = () => {
    // Escape a value for CSV: wrap in quotes if it contains commas, quotes, or newlines
    const esc = (val: string | number | undefined | null): string => {
      if (val === undefined || val === null) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = [
      'Booking ID',
      'Customer Name',
      'Email',
      'Phone',
      'Nationality',
      'Booking Date',
      'Status',
      'Payment Method',
      'Items',
      'Total Price (USD)',
    ];

    const rows = bookings.map((b) => {
      const itemNames = (b.bookingItems || [])
        .map((item) => item.tours?.name ?? item.upsellItems?.name ?? 'Item')
        .join(' | ');

      return [
        esc(b.id),
        esc(b.customerName),
        esc(b.customerEmail),
        esc(b.phoneNumber),
        esc(b.nationality),
        esc(new Date(b.bookingDate).toLocaleDateString('en-GB')),
        esc(b.status),
        esc(b.paymentMethod),
        esc(itemNames),
        esc(b.totalPrice),
      ].join(',');
    });

    // BOM prefix (\uFEFF) ensures Excel and Arabic Windows open the file correctly
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bookings-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From {bookings.length} bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingBookings}</div>
            <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{confirmedBookings}</div>
            <p className="text-xs text-muted-foreground">Ready for departure</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export to CSV
        </Button>
      </div>

      <DataTable
        columns={columns({
          onUpdateStatus: handleUpdateStatus,
          onDelete: handleDeleteBooking,
        })}
        data={bookings}
      />
    </div>
  );
}
