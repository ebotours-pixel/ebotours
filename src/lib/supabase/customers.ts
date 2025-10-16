"use server";
import { createClient } from "./server";
import type { Customer } from "@/types";
import * as mock from "@/lib/customers";

type DbCustomer = {
  id: string;
  email: string;
  name: string | null;
  source: string | null;
  total_bookings: number | null;
  total_spent: number | null;
  created_at: string | null;
};

function toCustomer(row: DbCustomer): Customer {
  return {
    id: row.id,
    email: row.email,
    name: row.name ?? row.email,
    source: (row.source as Customer["source"]) ?? "Booking",
    totalBookings: row.total_bookings ?? 0,
    totalSpent: row.total_spent ?? 0,
    createdAt: row.created_at ?? new Date().toISOString(),
    bookings: [],
  };
}

export async function getCustomers(): Promise<Customer[]> {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from("customers")
      .select(
        "id, email, name, source, total_bookings, total_spent, created_at",
      );
    if (error) throw error;
    if (!data) return mock.getCustomers();
    return (data as DbCustomer[]).map(toCustomer);
  } catch (_) {
    return mock.getCustomers();
  }
}