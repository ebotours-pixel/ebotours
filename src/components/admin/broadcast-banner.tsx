import { getActiveBroadcasts } from '@/lib/supabase/broadcasts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

interface BroadcastBannerProps {
  agencyTier?: string;
  agencyStatus?: string;
}

export async function BroadcastBanner({ agencyTier, agencyStatus }: BroadcastBannerProps) {
  const allBroadcasts = await getActiveBroadcasts();

  if (!allBroadcasts || allBroadcasts.length === 0) {
    return null;
  }

  const now = new Date().toISOString();
  const broadcasts = allBroadcasts.filter((b) => {
    // Skip expired broadcasts
    if (b.expires_at && b.expires_at < now) return false;
    // Filter by tier if set
    if (b.target_tier && agencyTier && b.target_tier !== agencyTier) return false;
    // Filter by status if set
    if (b.target_status && agencyStatus && b.target_status !== agencyStatus) return false;
    return true;
  });

  if (broadcasts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2 mb-4">
      {broadcasts.map((broadcast) => {
        let Icon = Info;
        let variant: 'default' | 'destructive' = 'default';
        let className = 'bg-blue-50 text-blue-900 border-blue-200';

        if (broadcast.variant === 'destructive') {
          Icon = XCircle;
          variant = 'destructive';
          className = ''; // Use default destructive style
        } else if (broadcast.variant === 'warning') {
          Icon = AlertCircle;
          className = 'bg-amber-50 text-amber-900 border-amber-200';
        } else if (broadcast.variant === 'success') {
          Icon = CheckCircle;
          className = 'bg-green-50 text-green-900 border-green-200';
        }

        return (
          <Alert key={broadcast.id} variant={variant} className={className}>
            <Icon className="h-4 w-4" />
            <AlertTitle className="capitalize font-semibold">
              {broadcast.variant === 'info' ? 'System Notice' : broadcast.variant}
            </AlertTitle>
            <AlertDescription>{broadcast.message}</AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
}
