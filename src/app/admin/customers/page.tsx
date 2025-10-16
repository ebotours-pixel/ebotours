"use client";

import React, { useEffect, useState } from "react";
import { getCustomers as getMockCustomers } from "@/lib/customers";
import type { Customer } from "@/types";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    async function loadCustomers() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("customers")
        .select(
          "id, email, name, source, total_bookings, total_spent, created_at",
        );
      if (!error && data) {
        const transformed: Customer[] = (data as any[]).map((row) => ({
          id: row.id,
          email: row.email,
          name: row.name ?? row.email,
          source: row.source ?? "Booking",
          totalBookings: row.total_bookings ?? 0,
          totalSpent: row.total_spent ?? 0,
          createdAt: row.created_at ?? new Date().toISOString(),
          bookings: [],
        }));
        setCustomers(transformed);
      } else {
        setCustomers(getMockCustomers());
      }
    }
    loadCustomers();
  }, []);

  const handleDeleteCustomer = (customerId: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Customers</h2>
          <p className="text-muted-foreground">
            Manage your customer list from bookings and newsletter
            subscriptions.
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export List
        </Button>
      </div>
      <DataTable
        columns={columns({ onDelete: handleDeleteCustomer })}
        data={customers}
      />
    </div>
  );
}
