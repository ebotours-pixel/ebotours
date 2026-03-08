'use client';

import { useState, useTransition } from 'react';
import { Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { markNotificationsRead } from '@/app/actions';
import type { AgencyNotification } from '@/lib/supabase/notifications';

interface NotificationBellProps {
  agencyId: string;
  initialCount: number;
  initialNotifications: AgencyNotification[];
}

export function NotificationBell({
  agencyId,
  initialCount,
  initialNotifications,
}: NotificationBellProps) {
  const [count, setCount] = useState(initialCount);
  const [notifications] = useState(initialNotifications);
  const [pending, startTransition] = useTransition();

  function handleOpen(open: boolean) {
    if (open && count > 0) {
      startTransition(async () => {
        await markNotificationsRead(agencyId);
        setCount(0);
      });
    }
  }

  const typeColor: Record<string, string> = {
    info: 'text-blue-600',
    warning: 'text-amber-600',
    success: 'text-green-600',
    billing: 'text-purple-600',
  };

  return (
    <Popover onOpenChange={handleOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full" disabled={pending}>
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-[10px]"
            >
              {count > 99 ? '99+' : count}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No notifications yet.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`border-b px-4 py-3 last:border-b-0 ${!n.is_read ? 'bg-blue-50/50' : ''}`}
              >
                <div className="flex items-start gap-2">
                  <div
                    className={`mt-1 h-2 w-2 shrink-0 rounded-full ${!n.is_read ? 'bg-blue-500' : 'bg-transparent'}`}
                  />
                  <div className="min-w-0">
                    <p className={`text-sm font-medium ${typeColor[n.type] || ''}`}>{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(n.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
