'use client';

import * as React from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AgencySettings } from '@/types/agency';
import type { AgencyNotification } from '@/lib/supabase/notifications';

export function AdminLayoutShell({
  user,
  children,
  settings,
  pendingBookingsCount,
  agencyId,
  unreadNotificationCount,
  notifications,
}: {
  user: User;
  children: React.ReactNode;
  settings?: AgencySettings;
  pendingBookingsCount?: number;
  agencyId?: string;
  unreadNotificationCount?: number;
  notifications?: AgencyNotification[];
}) {
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/admin';
  };

  return (
    <AdminSidebar
      user={user}
      handleSignOut={handleSignOut}
      settings={settings}
      pendingBookingsCount={pendingBookingsCount}
      agencyId={agencyId}
      unreadNotificationCount={unreadNotificationCount}
      notifications={notifications}
    >
      {children}
    </AdminSidebar>
  );
}
