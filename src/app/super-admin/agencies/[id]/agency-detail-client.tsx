'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Save,
  Ban,
  PlayCircle,
  Copy,
  Trash2,
  Building2,
  Calendar,
  DollarSign,
  ShoppingCart,
  StickyNote,
} from 'lucide-react';
import {
  updateAgencyDetails,
  updateAgencyNotes,
  suspendAgency,
  unsuspendAgency,
  duplicateAgency,
  deleteAgency,
} from '@/app/super-admin/actions';
import type { AgencySettings } from '@/types/agency';

interface AgencyData {
  id: string;
  name: string;
  slug: string;
  domain: string;
  status: 'active' | 'suspended';
  created_at: string;
  settings: AgencySettings;
  internal_notes: string;
  suspended_reason: string;
  suspended_at: string | null;
  last_admin_login_at: string | null;
}

interface AgencyDetailClientProps {
  agency: AgencyData;
  totalBookings: number;
  revenueThisMonth: number;
}

export function AgencyDetailClient({
  agency,
  totalBookings,
  revenueThisMonth,
}: AgencyDetailClientProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // Edit form state
  const [name, setName] = useState(agency.name);
  const [slug, setSlug] = useState(agency.slug);
  const [domain, setDomain] = useState(agency.domain);
  const [tier, setTier] = useState(agency.settings.tier || 'free');
  const [contactEmail, setContactEmail] = useState(agency.settings.contact?.email || '');
  const [contactPhone, setContactPhone] = useState(agency.settings.contact?.phone || '');
  const [contactAddress, setContactAddress] = useState(agency.settings.contact?.address || '');

  // Notes state
  const [notes, setNotes] = useState(agency.internal_notes);

  // Suspend reason state
  const [suspendReason, setSuspendReason] = useState('');

  // Clone dialog state
  const [cloneName, setCloneName] = useState('');
  const [cloneSlug, setCloneSlug] = useState('');

  function handleSaveDetails() {
    startTransition(async () => {
      await updateAgencyDetails(agency.id, {
        name,
        slug,
        domain: domain || null,
        tier,
        contactEmail,
        contactPhone,
        contactAddress,
      });
    });
  }

  function handleSaveNotes() {
    startTransition(async () => {
      await updateAgencyNotes(agency.id, notes);
    });
  }

  function handleSuspend() {
    if (!suspendReason.trim()) return;
    startTransition(async () => {
      await suspendAgency(agency.id, suspendReason.trim());
      setSuspendReason('');
    });
  }

  function handleUnsuspend() {
    startTransition(async () => {
      await unsuspendAgency(agency.id);
    });
  }

  function handleClone() {
    if (!cloneName.trim() || !cloneSlug.trim()) return;
    startTransition(async () => {
      await duplicateAgency(agency.id, cloneName.trim(), cloneSlug.trim());
      setCloneName('');
      setCloneSlug('');
      router.push('/super-admin');
    });
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteAgency(agency.id);
        router.push('/super-admin');
      } catch {
        alert('Cannot delete: agency has bookings. Archive it instead.');
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/super-admin')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">{agency.name}</h1>
            <p className="text-sm text-muted-foreground font-mono">{agency.slug}</p>
          </div>
          <Badge variant={agency.status === 'active' ? 'default' : 'destructive'} className="ml-2">
            {agency.status}
          </Badge>
        </div>
      </div>

      {/* Suspension banner */}
      {agency.status === 'suspended' && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-red-800">Agency Suspended</p>
              {agency.suspended_reason && (
                <p className="text-sm text-red-700 mt-1">Reason: {agency.suspended_reason}</p>
              )}
              {agency.suspended_at && (
                <p className="text-xs text-red-600 mt-1">
                  Since {new Date(agency.suspended_at).toLocaleDateString()}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleUnsuspend}
              disabled={pending}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <PlayCircle className="mr-1.5 h-3.5 w-3.5" />
              Unsuspend
            </Button>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <ShoppingCart className="h-3.5 w-3.5" /> Total Bookings
            </div>
            <p className="text-2xl font-bold">{totalBookings}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <DollarSign className="h-3.5 w-3.5" /> Revenue This Month
            </div>
            <p className="text-2xl font-bold">
              ${revenueThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Calendar className="h-3.5 w-3.5" /> Created
            </div>
            <p className="text-2xl font-bold">{new Date(agency.created_at).toLocaleDateString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Calendar className="h-3.5 w-3.5" /> Last Admin Login
            </div>
            <p className="text-2xl font-bold">
              {agency.last_admin_login_at
                ? new Date(agency.last_admin_login_at).toLocaleDateString()
                : 'Never'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Edit Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agency Details</CardTitle>
              <CardDescription>Edit the core settings for this agency.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Agency Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domain">Custom Domain</Label>
                  <Input
                    id="domain"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="e.g. travel.example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tier">Tier</Label>
                  <Select value={tier} onValueChange={setTier}>
                    <SelectTrigger id="tier">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="starter">Starter</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-medium mb-3">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="agency@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Phone</Label>
                    <Input
                      id="contactPhone"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+1 555 123 4567"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="contactAddress">Address</Label>
                    <Input
                      id="contactAddress"
                      value={contactAddress}
                      onChange={(e) => setContactAddress(e.target.value)}
                      placeholder="123 Main St, City, Country"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveDetails} disabled={pending}>
                  <Save className="mr-1.5 h-4 w-4" />
                  Save Details
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Internal Notes Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StickyNote className="h-4 w-4" />
                Internal Notes
              </CardTitle>
              <CardDescription>
                Private notes visible only to super admins. Use for CRM-style tracking.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add internal notes about this agency..."
                rows={5}
              />
              <div className="flex justify-end">
                <Button variant="outline" onClick={handleSaveNotes} disabled={pending}>
                  <Save className="mr-1.5 h-4 w-4" />
                  Save Notes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Actions */}
        <div className="space-y-6">
          {/* Suspend / Unsuspend Card */}
          <Card>
            <CardHeader>
              <CardTitle>Agency Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {agency.status === 'active' ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <Ban className="mr-1.5 h-4 w-4" />
                      Suspend Agency
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Suspend {agency.name}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will put the agency in maintenance mode and prevent normal operations.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2 py-2">
                      <Label htmlFor="suspendReason">Reason for suspension</Label>
                      <Textarea
                        id="suspendReason"
                        value={suspendReason}
                        onChange={(e) => setSuspendReason(e.target.value)}
                        placeholder="e.g. Payment overdue, policy violation..."
                        rows={3}
                      />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleSuspend}
                        disabled={pending || !suspendReason.trim()}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Suspend
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleUnsuspend}
                  disabled={pending}
                >
                  <PlayCircle className="mr-1.5 h-4 w-4" />
                  Unsuspend Agency
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Clone Agency Card */}
          <Card>
            <CardHeader>
              <CardTitle>Clone Agency</CardTitle>
              <CardDescription>Create a new agency with the same settings.</CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Copy className="mr-1.5 h-4 w-4" />
                    Clone This Agency
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clone {agency.name}</AlertDialogTitle>
                    <AlertDialogDescription>
                      A new agency will be created with the same settings but no content.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-3 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="cloneName">New Agency Name</Label>
                      <Input
                        id="cloneName"
                        value={cloneName}
                        onChange={(e) => setCloneName(e.target.value)}
                        placeholder="My New Agency"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cloneSlug">Slug</Label>
                      <Input
                        id="cloneSlug"
                        value={cloneSlug}
                        onChange={(e) => setCloneSlug(e.target.value)}
                        placeholder="my-new-agency"
                      />
                    </div>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClone}
                      disabled={pending || !cloneName.trim() || !cloneSlug.trim()}
                    >
                      Create Clone
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>

          {/* Delete Agency Card */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-700">Danger Zone</CardTitle>
              <CardDescription>
                Permanently delete this agency. Only possible if it has zero bookings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="mr-1.5 h-4 w-4" />
                    Delete Agency
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete {agency.name}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. The agency and all its data will be permanently
                      removed. This will fail if the agency has any bookings.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={pending}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete Permanently
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
