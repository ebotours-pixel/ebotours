'use client';

import { Button } from '@/components/ui/button';
import { FileSpreadsheet } from 'lucide-react';
import type { Booking } from '@/types';

interface BookingExportCsvButtonProps {
  booking: Booking;
}

export function BookingExportCsvButton({ booking }: BookingExportCsvButtonProps) {
  const handleExport = () => {
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

    const itemNames = (booking.bookingItems || [])
      .map((item) => item.tours?.name ?? item.upsellItems?.name ?? 'Item')
      .join(' | ');

    const row = [
      esc(booking.id),
      esc(booking.customerName),
      esc(booking.customerEmail),
      esc(booking.phoneNumber),
      esc(booking.nationality),
      esc(new Date(booking.bookingDate).toLocaleDateString('en-GB')),
      esc(booking.status),
      esc(booking.paymentMethod),
      esc(itemNames),
      esc(booking.totalPrice),
    ].join(',');

    // BOM prefix ensures correct encoding in Excel / Arabic Windows
    const csvContent = '\uFEFF' + [headers.join(','), row].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `booking-${booking.id.slice(0, 8)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button variant="outline" className="w-full" onClick={handleExport}>
      <FileSpreadsheet className="mr-2 h-4 w-4" />
      Export as CSV
    </Button>
  );
}
