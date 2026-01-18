import { AlertTriangle, CheckCircle, HelpCircle, XCircle, Info, ShieldCheck, Building2 } from 'lucide-react';
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
      return <XCircle className="h-4 w-4 text-status-not-halal" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-status-questionable" />;
    case 'info':
    default:
      return <Info className="h-4 w-4 text-primary" />;
  }
}

export function VerdictSummary({ verdict, showManufacturerWarning = false, productType = 'otc' }: VerdictSummaryProps) {
  // Updated status labels per engine rules
  const statusConfig = {
    halal: {
      icon: CheckCircle,
      title: '✅ Likely Halal',
      bgClass: 'bg-status-halal/10 border-status-halal/30',
      iconClass: 'text-status-halal',
      tooltip: 'Based on available ingredient data, no flagged ingredients were detected. Manufacturer excipients may still vary.',
    },
    questionable: {
      icon: AlertTriangle,
      title: '⚠️ Uncertain',
      bgClass: 'bg-status-questionable/10 border-status-questionable/30',
      iconClass: 'text-status-questionable',
      tooltip: 'Contains ingredients that are often animal-derived or sourcing is unclear. More verification needed.',
    },
    not_halal: {
      icon: XCircle,
      title: '🚫 Not Halal',
      bgClass: 'bg-status-not-halal/10 border-status-not-halal/30',
      iconClass: 'text-status-not-halal',
      tooltip: 'Contains a clearly prohibited ingredient (e.g., explicitly porcine-derived). If medically necessary and no alternative exists, necessity (darura) may apply.',
    },
    unknown: {
      icon: HelpCircle,
      title: '❓ Unknown',
      bgClass: 'bg-muted border-border',
      iconClass: 'text-muted-foreground',
      tooltip: 'Not enough ingredient data was available to confirm. Check manufacturer/NDC or consult your pharmacist.',
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
          <div className={cn('rounded-full p-3', config.bgClass)}>
            <StatusIcon className={cn('h-8 w-8', config.iconClass)} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1">Why this status?</h3>
            <p className="text-foreground/80">{verdict.summaryReason}</p>
            
            {verdict.hasAdminOverride && (
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4" />
                <span>Status verified by administrator</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Manufacturer Warning for Rx */}
      {showManufacturerWarning && productType === 'rx' && (
        <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
          <Building2 className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-700">Manufacturer Matters</AlertTitle>
          <AlertDescription className="text-amber-600/90">
            Inactive ingredients vary by manufacturer. This analysis is specific to the selected 
            manufacturer/variant. Other versions of this medication may have different ingredients.
          </AlertDescription>
        </Alert>
      )}

      {/* Variant-specific data notice */}
      {verdict.isGenericAssumption && (
        <Alert variant="default" className="border-blue-500/50 bg-blue-500/10">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-700">Generic Analysis</AlertTitle>
          <AlertDescription className="text-blue-600/90">
            This analysis is based on generic ingredient information. For higher accuracy, 
            select a specific manufacturer variant.
          </AlertDescription>
        </Alert>
      )}

      {/* Detailed Reasons */}
      {(criticalReasons.length > 0 || warningReasons.length > 0 || infoReasons.length > 0) && (
        <div className="rounded-lg border bg-card p-4 space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Analysis Details
          </h4>
          
          <ul className="space-y-2">
            {criticalReasons.map((reason, idx) => (
              <li key={`critical-${idx}`} className="flex items-start gap-2 text-sm">
                <ReasonIcon severity="critical" />
                <span>{reason.message}</span>
              </li>
            ))}
            {warningReasons.map((reason, idx) => (
              <li key={`warning-${idx}`} className="flex items-start gap-2 text-sm">
                <ReasonIcon severity="warning" />
                <span>{reason.message}</span>
              </li>
            ))}
            {infoReasons.map((reason, idx) => (
              <li key={`info-${idx}`} className="flex items-start gap-2 text-sm">
                <ReasonIcon severity="info" />
                <span>{reason.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Confidence factors */}
      <div className="rounded-lg border bg-card/50 p-4">
        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
          Confidence Factors
        </h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <div className={cn(
              'h-2 w-2 rounded-full',
              verdict.hasManufacturerSource ? 'bg-status-halal' : 'bg-muted'
            )} />
            <span className={verdict.hasManufacturerSource ? '' : 'text-muted-foreground'}>
              Manufacturer source
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn(
              'h-2 w-2 rounded-full',
              verdict.hasCertifierSource ? 'bg-status-halal' : 'bg-muted'
            )} />
            <span className={verdict.hasCertifierSource ? '' : 'text-muted-foreground'}>
              Certifier verification
            </span>
          </div>
          {productType === 'rx' && (
            <div className="flex items-center gap-2">
              <div className={cn(
                'h-2 w-2 rounded-full',
                verdict.hasVariantSpecificData ? 'bg-status-halal' : 'bg-muted'
              )} />
              <span className={verdict.hasVariantSpecificData ? '' : 'text-muted-foreground'}>
                Variant-specific data
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <div className={cn(
              'h-2 w-2 rounded-full',
              !verdict.isGenericAssumption ? 'bg-status-halal' : 'bg-muted'
            )} />
            <span className={!verdict.isGenericAssumption ? '' : 'text-muted-foreground'}>
              Verified ingredients
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
