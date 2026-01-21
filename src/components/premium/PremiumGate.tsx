import { ReactNode, useState } from 'react';
import { Lock, Sparkles, Users, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSubscription } from '@/hooks/useSubscription';
import { useScanCredits } from '@/hooks/useScanCredits';
import { UpgradeModal, UpgradeReason } from '@/components/upgrade/UpgradeModal';
import { cn } from '@/lib/utils';

interface PremiumGateProps {
  children: ReactNode;
  /** What to show to non-premium users */
  fallback?: ReactNode;
  /** Minimum tier required (defaults to 'pro') */
  requiredTier?: 'pro' | 'clinic';
  /** Custom message for the upgrade prompt */
  upgradeMessage?: string;
  /** Additional CSS classes */
  className?: string;
  /** If true, show a blurred preview of content instead of fallback */
  showBlurredPreview?: boolean;
  /** The reason for gating (affects modal content) */
  gateReason?: UpgradeReason;
  /** If true, this gate is for Rx scans and checks credits too */
  isRxScanGate?: boolean;
}

export function PremiumGate({
  children,
  fallback,
  requiredTier = 'pro',
  upgradeMessage = 'Upgrade to Protect to unlock this feature',
  className,
  showBlurredPreview = false,
  gateReason = 'general',
  isRxScanGate = false,
}: PremiumGateProps) {
  const { isPro, isClinic, loading: subLoading } = useSubscription();
  const { canScanRx, loading: creditsLoading } = useScanCredits();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const loading = subLoading || (isRxScanGate && creditsLoading);

  // Check if user has required access
  const hasTierAccess = requiredTier === 'clinic' ? isClinic : isPro;
  
  // For Rx scan gates, also check if they have credits
  const hasAccess = isRxScanGate ? (hasTierAccess || canScanRx) : hasTierAccess;

  if (loading) {
    return (
      <div className={cn('animate-pulse bg-muted rounded-lg h-24', className)} />
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  // Show custom fallback if provided
  if (fallback && !showBlurredPreview) {
    return <>{fallback}</>;
  }

  const iconMap: Record<UpgradeReason, typeof Lock> = {
    rx_limit: Lock,
    manufacturer_compare: Users,
    export: FileText,
    general: Sparkles,
  };

  const Icon = iconMap[gateReason] || Lock;

  // Default upgrade prompt with optional blurred preview
  return (
    <>
      <div className={cn('relative', className)}>
        {showBlurredPreview && (
          <div className="blur-md pointer-events-none select-none opacity-50">
            {children}
          </div>
        )}
        
        <Card className={cn(
          'p-6 text-center',
          showBlurredPreview && 'absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center'
        )}>
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold mb-2">
            {gateReason === 'manufacturer_compare' ? 'Manufacturer Comparison' : 
             gateReason === 'export' ? 'Export Reports' :
             gateReason === 'rx_limit' ? 'Rx Scans' :
             'Premium Feature'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">
            {upgradeMessage}
          </p>
          <Button className="gap-2" onClick={() => setShowUpgradeModal(true)}>
            <Sparkles className="h-4 w-4" />
            Unlock Feature
          </Button>
        </Card>
      </div>
      
      <UpgradeModal 
        open={showUpgradeModal} 
        onOpenChange={setShowUpgradeModal} 
        reason={gateReason}
      />
    </>
  );
}

/** Inline badge to show premium-only content */
export function PremiumBadge({ className }: { className?: string }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary',
      className
    )}>
      <Sparkles className="h-3 w-3" />
      Pro
    </span>
  );
}

/** Small lock icon for inline use */
export function PremiumLockIcon({ className }: { className?: string }) {
  const { isPro } = useSubscription();
  
  if (isPro) return null;
  
  return (
    <Lock className={cn('h-4 w-4 text-muted-foreground', className)} />
  );
}

/** Banner shown when manufacturer comparison is locked */
export function ManufacturerLockBanner({ className }: { className?: string }) {
  const { isPro, loading } = useSubscription();
  const [showUpgrade, setShowUpgrade] = useState(false);

  if (loading || isPro) return null;

  return (
    <>
      <button
        onClick={() => setShowUpgrade(true)}
        className={cn(
          'w-full p-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 text-left hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors',
          className
        )}
      >
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
            Manufacturer differences detected
          </span>
          <span className="text-xs text-amber-600 dark:text-amber-400 ml-auto">
            Upgrade to view →
          </span>
        </div>
      </button>
      <UpgradeModal 
        open={showUpgrade} 
        onOpenChange={setShowUpgrade} 
        reason="manufacturer_compare" 
      />
    </>
  );
}
