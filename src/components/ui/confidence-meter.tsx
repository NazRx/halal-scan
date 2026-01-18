import { cn } from "@/lib/utils";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSubscription } from "@/hooks/useSubscription";
import type { UIStatus } from "@/lib/status-labels";

interface ConfidenceMeterProps {
  value: number; // 0-100
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showDisclaimer?: boolean;
  compact?: boolean; // Minimal view for lists
  status?: UIStatus; // Status determines bar color logic
}

type ConfidenceLevel = 'high' | 'medium' | 'low';

interface ConfidenceLevelConfig {
  level: ConfidenceLevel;
  label: string;
  description: string;
}

// Updated thresholds: 80+ = High, 50-79 = Moderate, <50 = Low
function getConfidenceConfig(value: number): ConfidenceLevelConfig {
  if (value >= 80) {
    return {
      level: 'high',
      label: 'High Confidence',
      description: 'Comprehensive ingredient data with manufacturer or certifier verification.',
    };
  }
  if (value >= 50) {
    return {
      level: 'medium',
      label: 'Moderate Confidence',
      description: 'Partial ingredient data available. Some ingredients may need verification.',
    };
  }
  return {
    level: 'low',
    label: 'Low Confidence',
    description: 'Limited ingredient data available. More verification needed.',
  };
}

// Get bar/text colors based on STATUS (not confidence level)
// Green ONLY if Likely Halal, Yellow if Uncertain, Neutral gray/blue if Not Halal
function getStatusColors(status: UIStatus | undefined, level: ConfidenceLevel) {
  if (status === 'not-halal') {
    // Neutral colors for "Not Halal" - confidence shows certainty of prohibition
    return {
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/50',
      barColor: 'bg-slate-500',
    };
  }
  if (status === 'questionable') {
    // Yellow/amber for uncertain status
    return {
      color: 'text-status-questionable',
      bgColor: 'bg-status-questionable/10',
      barColor: 'bg-status-questionable',
    };
  }
  if (status === 'halal') {
    // Green ONLY for Likely Halal
    return {
      color: 'text-status-halal',
      bgColor: 'bg-status-halal/10',
      barColor: 'bg-status-halal',
    };
  }
  // Unknown status - use neutral
  return {
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
    barColor: 'bg-muted-foreground',
  };
}

const levelEmoji = {
  high: '🟢',
  medium: '🟡',
  low: '🔴',
};

// Override emojis for "Not Halal" status - use neutral indicator
const neutralEmoji = {
  high: '⚫',
  medium: '⚫',
  low: '⚫',
};

export function ConfidenceMeter({ 
  value, 
  className, 
  showLabel = true,
  size = 'md',
  showDisclaimer = true,
  compact = false,
  status,
}: ConfidenceMeterProps) {
  const { isPro, isClinic } = useSubscription();
  const isPremium = isPro || isClinic;
  const config = getConfidenceConfig(value);
  const colors = getStatusColors(status, config.level);
  
  // Dynamic title based on status
  const confidenceTitle = status === 'not-halal' 
    ? 'Confidence in This Assessment'
    : 'Confidence Based on Available Evidence';

  const sizeClasses = {
    sm: { bar: 'h-2', text: 'text-xs', gap: 'gap-1.5' },
    md: { bar: 'h-2.5', text: 'text-sm', gap: 'gap-2' },
    lg: { bar: 'h-3', text: 'text-base', gap: 'gap-2.5' },
  };

  const sizes = sizeClasses[size];
  
  // Use neutral emoji for "Not Halal" status
  const emoji = status === 'not-halal' ? neutralEmoji[config.level] : levelEmoji[config.level];

  // Compact view for use in lists
  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className={cn("flex-1 h-1.5 rounded-full bg-muted overflow-hidden")}>
          <div
            className={cn("h-full rounded-full transition-all duration-300", colors.barColor)}
            style={{ width: `${value}%` }}
          />
        </div>
        <span className={cn("text-xs font-medium tabular-nums", colors.color)}>{value}%</span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Header with Label and Score */}
      {showLabel && (
        <div className={cn("flex items-center justify-between", sizes.text)}>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground font-medium">{confidenceTitle}</span>
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <Info className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs p-4 space-y-3">
                  <p className="font-semibold text-sm">How is this confidence calculated?</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Confidence scores indicate evidence strength, NOT permissibility. 
                    {status === 'not-halal' && ' A high confidence here means we are more certain about the prohibition.'}
                  </p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p className="font-medium">We evaluate:</p>
                    <ul className="list-disc list-inside space-y-0.5 pl-1">
                      <li>Manufacturer ingredient disclosures</li>
                      <li>Halal certifications (if available)</li>
                      <li>Known halal or high-risk excipients</li>
                      <li>Transparency and consistency of sources</li>
                    </ul>
                  </div>
                  <p className="text-xs text-muted-foreground italic">
                    Some ingredients may be halal in origin but lack public sourcing confirmation.
                  </p>
                  <div className="pt-2 border-t border-border">
                    <p className="text-[10px] text-muted-foreground">
                      This tool supports informed decision-making and does not replace personal, scholarly, or medical guidance.
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <span className={cn("font-bold tabular-nums", colors.color)}>{value}%</span>
        </div>
      )}

      {/* Progress Bar */}
      <div className={cn("w-full rounded-full bg-muted overflow-hidden", sizes.bar)}>
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", colors.barColor)}
          style={{ width: `${value}%` }}
        />
      </div>

      {/* Dynamic Status Text */}
      <div className={cn("flex items-start gap-2 p-2.5 rounded-lg", colors.bgColor)}>
        <span className="text-base leading-none mt-0.5">{emoji}</span>
        <div className="space-y-0.5 flex-1">
          <p className={cn("font-semibold text-sm", colors.color)}>
            {config.label}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {config.description}
          </p>
        </div>
      </div>

      {/* Required Disclaimer */}
      {showDisclaimer && (
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          Confidence reflects available ingredient information and third-party verification. It is not a religious ruling (fatwa).
        </p>
      )}

      {/* Optional Pro Tier Secondary Line */}
      {isPremium && showDisclaimer && (
        <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
          Based on ingredient disclosure, manufacturer information, and recognized halal standards.
        </p>
      )}
    </div>
  );
}