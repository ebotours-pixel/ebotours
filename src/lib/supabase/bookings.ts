'use server';

import { createClient } from '@/lib/supabase/server';
import type { Booking, CartItem } from '@/types';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Helper function to convert snake_case to camelCase
function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => toCamelCase(v));
  }
  if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, g => g[1].toUpperCase());
      result[camelKey] = toCamelCase(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
}

export async function getBookings(): Promise<Booking[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('bookings')
    .select('*, booking_items(*, tours(name, slug))')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
  return data.map(toCamelCase) as Booking[];
}

export async function getBookingById(id: string): Promise<Booking | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('bookings')
    .select('*, booking_items(*, tours(name, slug))')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching booking by ID ${id}:`, error);
    return null;
  }
  if (!data) return null;

  return toCamelCase(data) as Booking;
}

export async function updateBookingStatus(bookingId: string, status: Booking['status']) {
  const supabase = createClient();
  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId);

  if (error) {
    console.error('Error updating booking status:', error);
    throw new Error('Failed to update booking status.');
  }

  revalidatePath('/admin/bookings');
}

export async function deleteBooking(bookingId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', bookingId);

  if (error) {
    console.error('Error deleting booking:', error);
    throw new Error('Failed to delete booking.');
  }

  revalidatePath('/admin/bookings');
}

interface CreateBookingData {
  customerName: string;
  customerEmail: string;
  phoneNumber: string;
  nationality: string;
  cartItems: CartItem[];
  totalPrice: number;
}

export async function createBooking(data: CreateBookingData) {
  const supabase = createClient();

  // 1. Insert into bookings table
  const { data: bookingData, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      customer_name: data.customerName,
      customer_email: data.customerEmail,
      phone_number: data.phoneNumber, // Assuming you'll add this column to your DB
      nationality: data.nationality, // Assuming you'll add this column to your DB
      total_price: data.totalPrice,
      status: 'Pending', // Default status
      booking_date: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (bookingError || !bookingData) {
    console.error('Error creating booking:', bookingError);
    throw new Error('Failed to create booking.');
  }

  const bookingId = bookingData.id;

  // 2. Insert into booking_items table
  const bookingItemsToInsert = data.cartItems.map(item => ({
    booking_id: bookingId,
    tour_id: item.tour.id,
    adults: item.adults,
    children: item.children,
    item_date: item.date?.toISOString(), // Store the specific date for this item
    price: (() => {
      const totalPeople = (item.adults ?? 0) + (item.children ?? 0);
      const tier = item.tour.priceTiers.find(
        t => totalPeople >= t.minPeople && (t.maxPeople === null || totalPeople <= t.maxPeople)
      );
      if (!tier) return 0;
      return (item.adults ?? 0) * (tier.pricePerAdult ?? 0) + (item.children ?? 0) * (tier.pricePerChild ?? 0);
    })(),
  }));

  const { error: itemsError } = await supabase
    .from('booking_items')
    .insert(bookingItemsToInsert);

  if (itemsError) {
    console.error('Error creating booking items:', itemsError);
    throw new Error('Failed to create booking items.');
  }

  revalidatePath('/admin/bookings');
  revalidatePath('/'); // Revalidate homepage if needed
  revalidatePath('/tours'); // Revalidate tours page if needed

  return { success: true, bookingId };
}
