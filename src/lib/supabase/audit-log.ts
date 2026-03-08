import { createClient } from '@/lib/supabase/server';
import { cache } from 'react';

export type AuditLogEntry = {
  id: string;
  agency_id: string | null;
  actor_id: string | null;
  action: string;
  category: string;
  metadata: Record<string, unknown>;
  created_at: string;
  agency_name?: string;
};

export type AuditCategory =
  | 'agency'
  | 'billing'
  | 'communication'
  | 'broadcast'
  | 'booking'
  | 'system';

/** Log an audit event. Call from server actions. */
export async function logAudit(params: {
  agencyId?: string | null;
  action: string;
  category: AuditCategory;
  metadata?: Record<string, unknown>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.from('audit_log').insert({
    agency_id: params.agencyId || null,
    actor_id: user?.id || null,
    action: params.action,
    category: params.category,
    metadata: params.metadata || {},
  });
}

/** Get recent platform-wide activity (for super admin dashboard). */
export const getRecentActivity = cache(async (limit = 30): Promise<AuditLogEntry[]> => {
  const supabase = await createClient();

  const { data: logs, error } = await supabase
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching audit log:', error);
    return [];
  }

  // Enrich with agency names
  const agencyIds = [...new Set((logs || []).map((l) => l.agency_id).filter(Boolean))];
  if (agencyIds.length > 0) {
    const { data: agencies } = await supabase
      .from('agencies')
      .select('id, name')
      .in('id', agencyIds);

    const agencyMap = new Map((agencies || []).map((a) => [a.id, a.name]));
    return (logs || []).map((l) => ({
      ...l,
      agency_name: l.agency_id ? agencyMap.get(l.agency_id) || 'Unknown' : undefined,
    }));
  }

  return (logs || []) as AuditLogEntry[];
});

/** Get audit logs for a specific agency. */
export const getAgencyAuditLog = cache(
  async (agencyId: string, limit = 50): Promise<AuditLogEntry[]> => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching agency audit log:', error);
      return [];
    }

    return (data || []) as AuditLogEntry[];
  }
);

/** Get super admin actions only (logged by super admin actors). */
export const getSuperAdminActions = cache(async (limit = 50): Promise<AuditLogEntry[]> => {
  const supabase = await createClient();

  // Get current super admin user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: logs, error } = await supabase
    .from('audit_log')
    .select('*')
    .eq('actor_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching super admin actions:', error);
    return [];
  }

  // Enrich with agency names
  const agencyIds = [...new Set((logs || []).map((l) => l.agency_id).filter(Boolean))];
  if (agencyIds.length > 0) {
    const { data: agencies } = await supabase
      .from('agencies')
      .select('id, name')
      .in('id', agencyIds);

    const agencyMap = new Map((agencies || []).map((a) => [a.id, a.name]));
    return (logs || []).map((l) => ({
      ...l,
      agency_name: l.agency_id ? agencyMap.get(l.agency_id) || 'Unknown' : undefined,
    }));
  }

  return (logs || []) as AuditLogEntry[];
});
