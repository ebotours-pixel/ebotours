import { createClient } from '@/lib/supabase/server';
import { checkSuperAdmin } from '@/app/super-admin/layout';
import { redirect } from 'next/navigation';
import { AgencyDetailClient } from './agency-detail-client';
import type { AgencySettings } from '@/types/agency';

export default async function AgencyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const isSuper = await checkSuperAdmin();
  if (!isSuper) redirect('/admin/dashboard');

  const { id } = await params;
  const supabase = await createClient();

  const { data: agency, error } = await supabase.from('agencies').select('*').eq('id', id).single();

  if (error || !agency) redirect('/super-admin');

  // Fetch booking stats for this agency
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [totalBookingsRes, monthBookingsRes] = await Promise.all([
    supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('agency_id', id),
    supabase
      .from('bookings')
      .select('total_price')
      .eq('agency_id', id)
      .gte('created_at', startOfMonth),
  ]);

  const totalBookings = totalBookingsRes.count ?? 0;
  const revenueThisMonth = (monthBookingsRes.data || []).reduce(
    (sum, b) => sum + (Number(b.total_price) || 0),
    0
  );

  return (
    <AgencyDetailClient
      agency={{
        id: agency.id,
        name: agency.name,
        slug: agency.slug,
        domain: agency.domain || '',
        status: agency.status as 'active' | 'suspended',
        created_at: agency.created_at,
        settings: (agency.settings || {}) as AgencySettings,
        internal_notes: agency.internal_notes || '',
        suspended_reason: agency.suspended_reason || '',
        suspended_at: agency.suspended_at || null,
        last_admin_login_at: agency.last_admin_login_at || null,
      }}
      totalBookings={totalBookings}
      revenueThisMonth={revenueThisMonth}
    />
  );
}
