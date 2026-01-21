import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useSubscription } from '@/hooks/useSubscription';
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
}

export function PremiumGate({
  children,
  fallback,
  requiredTier = 'pro',
  upgradeMessage = 'Upgrade to Pro to unlock this feature',
  className,
  showBlurredPreview = false,
}: PremiumGateProps) {
  const { isPro, isClinic, loading } = useSubscription();

  // Check if user has required access
  const hasAccess = requiredTier === 'clinic' ? isClinic : isPro;

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

  // Default upgrade prompt
  return (
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
          <Lock className="h-6 w-6 text-primary" />
        </div>
        <h3 className="font-semibold mb-2">Premium Feature</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-xs mx-auto">
          {upgradeMessage}
        </p>
        <Link to="/pricing">
          <Button className="gap-2">
            <Sparkles className="h-4 w-4" />
            Upgrade Now
          </Button>
        </Link>
      </Card>
    </div>
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
