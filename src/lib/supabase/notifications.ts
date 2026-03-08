import { createClient } from '@/lib/supabase/server';
import { cache } from 'react';

export type AgencyNotification = {
  id: string;
  agency_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
};

export const getUnreadNotificationCount = cache(async (agencyId: string): Promise<number> => {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from('agency_notifications')
    .select('*', { count: 'exact', head: true })
    .eq('agency_id', agencyId)
    .eq('is_read', false);

  if (error) {
    console.error('Error fetching notification count:', error);
    return 0;
  }

  return count || 0;
});

export const getNotifications = cache(
  async (agencyId: string, limit = 20): Promise<AgencyNotification[]> => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('agency_notifications')
      .select('*')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return data as AgencyNotification[];
  }
);
