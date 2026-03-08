'use client';

import { Badge } from '@/components/ui/badge';
import {
  Building2,
  CreditCard,
  Mail,
  Megaphone,
  Bell,
  Shield,
  Activity,
  type LucideIcon,
} from 'lucide-react';
import type { AuditLogEntry } from '@/lib/supabase/audit-log';

const categoryConfig: Record<string, { icon: LucideIcon; color: string; label: string }> = {
  agency: { icon: Building2, color: 'text-blue-500', label: 'Agency' },
  billing: { icon: CreditCard, color: 'text-emerald-500', label: 'Billing' },
  communication: { icon: Mail, color: 'text-purple-500', label: 'Communication' },
  broadcast: { icon: Megaphone, color: 'text-indigo-500', label: 'Broadcast' },
  notification: { icon: Bell, color: 'text-amber-500', label: 'Notification' },
  system: { icon: Shield, color: 'text-zinc-500', label: 'System' },
};

function formatRelativeTime(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function ActivityFeed({ entries }: { entries: AuditLogEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <Activity className="h-8 w-8 mb-2 opacity-50" />
        <p className="text-sm">No activity recorded yet.</p>
        <p className="text-xs">Actions will appear here as they happen.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {entries.map((entry) => {
        const config = categoryConfig[entry.category] || categoryConfig.system;
        const Icon = config.icon;

        return (
          <div
            key={entry.id}
            className="flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/50 transition-colors"
          >
            <div className={`mt-0.5 shrink-0 ${config.color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm">{entry.action}</p>
              <div className="flex items-center gap-2 mt-1">
                {entry.agency_name && (
                  <Badge variant="outline" className="text-[10px] h-5 font-normal">
                    {entry.agency_name}
                  </Badge>
                )}
                <Badge variant="secondary" className="text-[10px] h-5 capitalize">
                  {config.label}
                </Badge>
                <span className="text-[11px] text-muted-foreground">
                  {formatRelativeTime(entry.created_at)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
