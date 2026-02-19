import { AlertTriangle, Search, HelpCircle, Info, ShieldCheck, Building2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { VerdictOutput, VerdictReason } from '@/types/verdict';
import { cn } from '@/lib/utils';

interface VerdictSummaryProps {
  verdict: VerdictOutput;
  showManufacturerWarning?: boolean;
  productType?: 'otc' | 'rx';
}

function ReasonIcon({ severity }: { severity: VerdictReason['severity'] }) {
  switch (severity) {
    case 'critical':
      return <Info className="h-4 w-4 text-muted-foreground" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    case 'info':
    default:
      return <Info className="h-4 w-4 text-primary" />;
  }
}

export function VerdictSummary({ verdict, showManufacturerWarning = false, productType = 'otc' }: VerdictSummaryProps) {
  // Neutral labels — AmanahRx does not issue halal/haram rulings
  const statusConfig = {
    halal: {
      icon: Search,
      title: 'No Flagged Concerns Identified',
      bgClass: 'bg-muted border-border',
      iconClass: 'text-muted-foreground',
    },
    questionable: {
      icon: AlertTriangle,
      title: 'Contains Ingredients Commonly Questioned',
      bgClass: 'bg-muted border-border',
      iconClass: 'text-muted-foreground',
    },
    not_halal: {
      icon: Info,
      title: 'Contains Ingredients Commonly Questioned',
      bgClass: 'bg-muted border-border',
      iconClass: 'text-muted-foreground',
    },
    unknown: {
      icon: HelpCircle,
      title: 'Insufficient Public Disclosure',
      bgClass: 'bg-muted border-border',
      iconClass: 'text-muted-foreground',
    },
  };

  const config = statusConfig[verdict.status];
  const StatusIcon = config.icon;

  // Group reasons by severity
  const criticalReasons = verdict.reasons.filter(r => r.severity === 'critical');
  const warningReasons = verdict.reasons.filter(r => r.severity === 'warning');
  const infoReasons = verdict.reasons.filter(r => r.severity === 'info');

  return (
    <div className="space-y-4">
      {/* Main Summary Card */}
      <div className={cn('rounded-xl border-2 p-6', config.bgClass)}>
        <div className="flex items-start gap-4">
          <div className={cn('rounded-full p-3 bg-background/60')}>
            <StatusIcon className={cn('h-7 w-7', config.iconClass)} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-1">{config.title}</h3>
            <p className="text-foreground/80 text-sm">{verdict.summaryReason}</p>
            
            {verdict.hasAdminOverride && (
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4" />
                <span>Status reviewed by AmanahRx team</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Manufacturer Warning for Rx */}
      {showManufacturerWarning && productType === 'rx' && (
        <Alert variant="default" className="border-border bg-muted/30">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <AlertTitle>Manufacturer Formulation Varies</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            Inactive ingredients vary by manufacturer. This assessment reflects the selected 
            manufacturer variant. Other versions of this medication may have different excipients.
          </AlertDescription>
        </Alert>
      )}

      {/* Generic analysis notice */}
      {verdict.isGenericAssumption && (
        <Alert variant="default" className="border-border bg-muted/30">
          <Info className="h-4 w-4 text-muted-foreground" />
          <AlertTitle>General Formulation Data</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            This assessment uses general ingredient information. Select a specific manufacturer 
            variant for more precise formulation data.
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Reasons */}
      {(criticalReasons.length > 0 || warningReasons.length > 0 || infoReasons.length > 0) && (
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Ingredient Flags
          </h4>
          
          <ul className="space-y-2">
            {[...criticalReasons, ...warningReasons, ...infoReasons].map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <ReasonIcon severity={reason.severity} />
                <span>{reason.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Data Source Indicators */}
      <div className="rounded-lg border bg-card/50 p-4">
        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
          Data Sources Available
        </h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <div className={cn(
              'h-2 w-2 rounded-full',
              verdict.hasManufacturerSource ? 'bg-foreground' : 'bg-muted-foreground/30'
            )} />
            <span className={!verdict.hasManufacturerSource ? 'text-muted-foreground' : ''}>
              Manufacturer source
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn(
              'h-2 w-2 rounded-full',
              verdict.hasCertifierSource ? 'bg-foreground' : 'bg-muted-foreground/30'
            )} />
            <span className={!verdict.hasCertifierSource ? 'text-muted-foreground' : ''}>
              Third-party verification
            </span>
          </div>
          {productType === 'rx' && (
            <div className="flex items-center gap-2">
              <div className={cn(
                'h-2 w-2 rounded-full',
                verdict.hasVariantSpecificData ? 'bg-foreground' : 'bg-muted-foreground/30'
              )} />
              <span className={!verdict.hasVariantSpecificData ? 'text-muted-foreground' : ''}>
                Variant-specific data
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className={cn(
              'h-2 w-2 rounded-full',
              !verdict.isGenericAssumption ? 'bg-foreground' : 'bg-muted-foreground/30'
            )} />
            <span className={verdict.isGenericAssumption ? 'text-muted-foreground' : ''}>
              Verified ingredient list
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
