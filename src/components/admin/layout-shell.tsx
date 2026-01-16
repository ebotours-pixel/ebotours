
"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AgencySettings } from "@/types/agency";

export function AdminLayoutShell({
  user,
  children,
  settings,
}: {
  user: User;
  children: React.ReactNode;
  settings?: AgencySettings;
}) {
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/admin";
  };

  return (
    <AdminSidebar user={user} handleSignOut={handleSignOut} settings={settings}>
      {children}
    </AdminSidebar>
  );
}
