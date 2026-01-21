import { useState } from 'react';
import { CreditCard, Sparkles, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useScanCredits } from '@/hooks/useScanCredits';
import { useSubscription } from '@/hooks/useSubscription';
import { useRamadan } from '@/hooks/useRamadan';
import { UpgradeModal } from './UpgradeModal';

interface ScanCreditsBannerProps {
  variant?: 'inline' | 'card';
  className?: string;
}

export function ScanCreditsBanner({ variant = 'inline', className }: ScanCreditsBannerProps) {
  const { isPro, loading: subLoading } = useSubscription();
  const { freeScansRemaining, purchasedCredits, loading: creditsLoading, FREE_RX_SCAN_LIMIT, isRamadan } = useScanCredits();
  const [showUpgrade, setShowUpgrade] = useState(false);

  if (subLoading || creditsLoading) return null;
  if (isPro) return null;

  const totalRemaining = freeScansRemaining + purchasedCredits;
  const isLow = totalRemaining <= 3 && totalRemaining > 0;
  const isEmpty = totalRemaining === 0;

  if (variant === 'inline') {
    return (
      <>
        <div className={`flex items-center gap-2 text-sm ${className}`}>
          {isRamadan ? (
            <Moon className="h-4 w-4 text-amber-600" />
          ) : (
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          )}
          <span className={isEmpty ? 'text-destructive' : isLow ? 'text-amber-600' : 'text-muted-foreground'}>
            {isEmpty 
              ? 'No Rx scans remaining' 
              : `${totalRemaining} Rx scan${totalRemaining !== 1 ? 's' : ''} remaining`
            }
          </span>
          {isRamadan && totalRemaining > 0 && (
            <span className="text-xs text-amber-600">(Ramadan bonus)</span>
          )}
          {(isEmpty || isLow) && (
            <Button 
              variant="link" 
              size="sm" 
              className={`h-auto p-0 ${isRamadan ? 'text-amber-600' : 'text-primary'}`}
              onClick={() => setShowUpgrade(true)}
            >
              {isEmpty ? 'Get more' : 'Upgrade'}
            </Button>
          )}
        </div>
        <UpgradeModal 
          open={showUpgrade} 
          onOpenChange={setShowUpgrade} 
          reason="rx_limit" 
        />
      </>
    );
  }

  return (
    <>
      <div className={`rounded-lg border p-4 ${
        isRamadan 
          ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
          : 'bg-muted/30'
      } ${className}`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {isRamadan ? (
                <Moon className="h-5 w-5 text-amber-600" />
              ) : (
                <CreditCard className="h-5 w-5 text-primary" />
              )}
              <span className="font-medium">
                {isRamadan ? 'Ramadan Rx Credits' : 'Rx Scan Credits'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {freeScansRemaining > 0 && (
                <span>
                  {freeScansRemaining} of {FREE_RX_SCAN_LIMIT} free scans remaining
                  {isRamadan && <span className="text-amber-600"> (doubled for Ramadan)</span>}
                </span>
              )}
              {freeScansRemaining === 0 && purchasedCredits > 0 && (
                <span>{purchasedCredits} purchased credits remaining</span>
              )}
              {isEmpty && (
                <span className="text-destructive">No scans remaining</span>
              )}
            </p>
          </div>
          <Button 
            size="sm" 
            variant={isEmpty ? 'default' : 'outline'}
            className={isEmpty && isRamadan ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600' : ''}
            onClick={() => setShowUpgrade(true)}
          >
            {isRamadan ? (
              <Moon className="h-4 w-4 mr-1" />
            ) : (
              <Sparkles className="h-4 w-4 mr-1" />
            )}
            {isEmpty ? 'Get Scans' : 'Upgrade'}
          </Button>
        </div>
      </div>
      <UpgradeModal 
        open={showUpgrade} 
        onOpenChange={setShowUpgrade} 
        reason="rx_limit" 
      />
    </>
  );
}
