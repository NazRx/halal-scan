import { CalendarCheck, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/hooks/useSubscription";
import { format, formatDistanceToNow } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LastVerifiedBadgeProps {
  date: string | Date;
  className?: string;
  showRelative?: boolean;
}

export function LastVerifiedBadge({ date, className, showRelative = true }: LastVerifiedBadgeProps) {
  const { isPro, isClinic } = useSubscription();
  const isPremium = isPro || isClinic;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const formattedDate = format(dateObj, 'MMMM d, yyyy');
  const relativeDate = formatDistanceToNow(dateObj, { addSuffix: true });
  
  // Determine freshness color
  const daysSinceUpdate = Math.floor((Date.now() - dateObj.getTime()) / (1000 * 60 * 60 * 24));
  let freshnessColor = "text-status-halal"; // Fresh (< 30 days)
  let freshnessLabel = "Recently verified";
  
  if (daysSinceUpdate > 180) {
    freshnessColor = "text-status-questionable";
    freshnessLabel = "Review pending";
  } else if (daysSinceUpdate > 90) {
    freshnessColor = "text-muted-foreground";
    freshnessLabel = "Verification aging";
  }

  if (!isPremium) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border text-sm text-muted-foreground cursor-default",
            className
          )}>
            <Lock className="h-3.5 w-3.5" />
            <span>Last Verified</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm">Upgrade to Pro to see when this profile was last verified</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10 text-sm",
          className
        )}>
          <CalendarCheck className={cn("h-3.5 w-3.5", freshnessColor)} />
          <span className="text-muted-foreground">Last Verified:</span>
          <span className="font-medium">
            {showRelative ? relativeDate : formattedDate}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="space-y-1">
          <p className="font-medium">{formattedDate}</p>
          <p className={cn("text-xs", freshnessColor)}>{freshnessLabel}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
