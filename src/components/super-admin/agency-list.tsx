'use client';

import { Fragment, useState, useTransition } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Building2,
  Globe,
  Search,
  MoreHorizontal,
  Power,
  ChevronDown,
  ChevronRight,
  StickyNote,
  Settings,
  Ban,
  PlayCircle,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  switchAgency,
  suspendAgency,
  unsuspendAgency,
  deleteAgency,
} from '@/app/super-admin/actions';
import { AgencySettings } from '@/types/agency';
import { AgencySettingsDialog } from './agency-settings-dialog';
import type { AgencyHealthRow } from '@/lib/supabase/super-admin';
import Link from 'next/link';

interface AgencyListProps {
  agencies: {
    id: string;
    name: string;
    slug: string;
    domain?: string | null;
    status: string;
    created_at: string;
    settings?: AgencySettings;
    last_admin_login_at?: string | null;
    internal_notes?: string | null;
    subscription_status?: string | null;
    trial_ends_at?: string | null;
    next_billing_date?: string | null;
    monthly_price?: number | null;
  }[];
  currentSlug: string;
  healthData: Record<string, AgencyHealthRow>;
}

function getHealthIndicator(health: AgencyHealthRow | undefined): {
  label: string;
  color: string;
  dot: string;
} {
  if (!health || !health.lastBookingDate) {
    return { label: 'No Activity', color: 'text-red-600', dot: 'bg-red-500' };
  }
  const daysSince = Math.floor(
    (Date.now() - new Date(health.lastBookingDate).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSince <= 14) {
    return { label: 'Active', color: 'text-green-600', dot: 'bg-green-500' };
  }
  if (daysSince <= 30) {
    return { label: 'Low Activity', color: 'text-amber-600', dot: 'bg-amber-500' };
  }
  return { label: 'No Activity', color: 'text-red-600', dot: 'bg-red-500' };
}

function formatRelativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Never';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function getPlanBadge(tier: string | undefined): { label: string; className: string } {
  switch (tier?.toLowerCase()) {
    case 'starter':
      return {
        label: 'Starter',
        className: 'bg-blue-100 text-blue-700 border-blue-200',
      };
    case 'pro':
    case 'professional':
      return {
        label: 'Pro',
        className: 'bg-purple-100 text-purple-700 border-purple-200',
      };
    case 'business':
      return {
        label: 'Business',
        className: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      };
    case 'enterprise':
      return {
        label: 'Enterprise',
        className: 'bg-amber-100 text-amber-700 border-amber-200',
      };
    default:
      return {
        label: 'Free',
        className: 'bg-zinc-100 text-zinc-600 border-zinc-200',
      };
  }
}

function getBillingBadge(
  subscriptionStatus: string | null | undefined,
  trialEndsAt: string | null | undefined
): { label: string; icon: string; className: string } {
  const status = subscriptionStatus || 'active';
  switch (status) {
    case 'trial': {
      const daysLeft = trialEndsAt
        ? Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : null;
      const isExpiring = daysLeft !== null && daysLeft <= 7 && daysLeft > 0;
      const isExpired = daysLeft !== null && daysLeft <= 0;
      return {
        label: isExpired ? 'Trial Expired' : isExpiring ? `Trial (${daysLeft}d)` : 'Trial',
        icon: '⏳',
        className: isExpired
          ? 'bg-red-100 text-red-700 border-red-200'
          : isExpiring
            ? 'bg-amber-100 text-amber-700 border-amber-200'
            : 'bg-sky-100 text-sky-700 border-sky-200',
      };
    }
    case 'past_due':
      return {
        label: 'Past Due',
        icon: '⚠️',
        className: 'bg-red-100 text-red-700 border-red-200',
      };
    case 'cancelled':
      return {
        label: 'Cancelled',
        icon: '❌',
        className: 'bg-zinc-100 text-zinc-500 border-zinc-200',
      };
    default:
      return {
        label: 'Active',
        icon: '✅',
        className: 'bg-green-100 text-green-700 border-green-200',
      };
  }
}

export function AgencyList({ agencies, currentSlug, healthData }: AgencyListProps) {
  const [search, setSearch] = useState('');
  const [pending, startTransition] = useTransition();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = agencies.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search agencies..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>Agency</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Billing</TableHead>
              <TableHead>Health</TableHead>
              <TableHead>Modules</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                  No results found.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((agency) => {
              const health = healthData[agency.id];
              const indicator = getHealthIndicator(health);
              const isExpanded = expandedId === agency.id;

              return (
                <Fragment key={agency.id}>
                  <TableRow>
                    <TableCell className="w-8 px-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setExpandedId(isExpanded ? null : agency.id)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <Link
                            href={`/super-admin/agencies/${agency.id}`}
                            className="flex items-center gap-1.5 hover:underline"
                          >
                            {agency.name}
                            {agency.internal_notes && agency.internal_notes.trim() && (
                              <span title={agency.internal_notes}>
                                <StickyNote className="h-3 w-3 text-amber-500" />
                              </span>
                            )}
                          </Link>
                          {agency.domain && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Globe className="h-3 w-3" /> {agency.domain}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs font-normal">
                        {agency.slug}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge
                          variant={agency.status === 'active' ? 'default' : 'secondary'}
                          className={`w-fit ${agency.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200 shadow-none' : ''}`}
                        >
                          {agency.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const plan = getPlanBadge(agency.settings?.tier);
                        return (
                          <Badge
                            variant="outline"
                            className={`text-xs shadow-none ${plan.className}`}
                          >
                            {plan.label}
                          </Badge>
                        );
                      })()}
                      {agency.monthly_price && agency.monthly_price > 0 ? (
                        <span className="block text-[10px] text-muted-foreground mt-0.5">
                          ${agency.monthly_price}/mo
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const billing = getBillingBadge(
                          agency.subscription_status,
                          agency.trial_ends_at
                        );
                        return (
                          <Badge
                            variant="outline"
                            className={`text-xs shadow-none ${billing.className}`}
                          >
                            {billing.icon} {billing.label}
                          </Badge>
                        );
                      })()}
                      {agency.next_billing_date && (
                        <span className="block text-[10px] text-muted-foreground mt-0.5">
                          Next: {new Date(agency.next_billing_date).toLocaleDateString()}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`h-2 w-2 rounded-full ${indicator.dot}`}
                          title={indicator.label}
                        />
                        <span className={`text-xs font-medium ${indicator.color}`}>
                          {indicator.label}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap max-w-[140px]">
                        {(!agency.settings?.modules || agency.settings.modules.blog !== false) && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1 py-0 h-5 border-blue-200 bg-blue-50 text-blue-700"
                          >
                            Blog
                          </Badge>
                        )}
                        {(!agency.settings?.modules ||
                          agency.settings.modules.upsell !== false) && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1 py-0 h-5 border-purple-200 bg-purple-50 text-purple-700"
                          >
                            Upsell
                          </Badge>
                        )}
                        {(!agency.settings?.modules ||
                          agency.settings.modules.contact !== false) && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1 py-0 h-5 border-orange-200 bg-orange-50 text-orange-700"
                          >
                            Inbox
                          </Badge>
                        )}
                        {agency.settings?.modules &&
                          Object.values(agency.settings.modules).some((v) => v === false) && (
                            <span className="text-[10px] text-muted-foreground ml-1">
                              +Restricted
                            </span>
                          )}
                        {agency.settings?.modules?.maintenance_mode && (
                          <Badge variant="destructive" className="text-[10px] px-1 py-0 h-5">
                            Offline
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <AgencySettingsDialog
                            agencyId={agency.id}
                            initialModules={agency.settings?.modules}
                          />
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(agency.id)}
                          >
                            Copy ID
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {currentSlug !== agency.slug ? (
                            <DropdownMenuItem
                              onSelect={() => startTransition(() => switchAgency(agency.slug))}
                              disabled={pending}
                              className="cursor-pointer"
                            >
                              <Power className="mr-2 h-4 w-4" />
                              Manage Context
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem disabled>
                              <Power className="mr-2 h-4 w-4" />
                              Active Context
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem asChild>
                            <Link href={`/super-admin/agencies/${agency.id}`}>
                              <Settings className="mr-2 h-4 w-4" />
                              Edit Settings
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {agency.status === 'active' ? (
                            <DropdownMenuItem
                              onSelect={() =>
                                startTransition(async () => {
                                  const reason = window.prompt('Reason for suspension:');
                                  if (reason) await suspendAgency(agency.id, reason);
                                })
                              }
                              disabled={pending}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              Suspend
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onSelect={() => startTransition(() => unsuspendAgency(agency.id))}
                              disabled={pending}
                              className="text-green-600 focus:text-green-600"
                            >
                              <PlayCircle className="mr-2 h-4 w-4" />
                              Unsuspend
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onSelect={() =>
                              startTransition(async () => {
                                try {
                                  await deleteAgency(agency.id);
                                } catch {
                                  alert('Cannot delete: agency has bookings.');
                                }
                              })
                            }
                            disabled={pending}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>

                  {/* Expandable Quick Stats Row */}
                  {isExpanded && (
                    <TableRow className="bg-zinc-50/50">
                      <TableCell colSpan={9} className="py-3 px-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground text-xs">Total Bookings</span>
                            <p className="font-semibold text-zinc-900">
                              {health?.totalBookings ?? 0}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-xs">
                              Revenue This Month
                            </span>
                            <p className="font-semibold text-zinc-900">
                              $
                              {(health?.revenueThisMonth ?? 0).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-xs">Last Booking</span>
                            <p className="font-semibold text-zinc-900">
                              {formatRelativeTime(health?.lastBookingDate)}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-xs">Last Admin Login</span>
                            <p className="font-semibold text-zinc-900">
                              {formatRelativeTime(
                                health?.lastAdminLoginAt || agency.last_admin_login_at
                              )}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
