import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CheckCircle, XCircle, AlertTriangle, HelpCircle, Info, Lightbulb, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OtcVerdictOutput, OtcStatus } from "@/lib/otcVerdict";
import { OTC_STATUS_LABELS, OTC_STATUS_COLORS } from "@/lib/otcVerdict";

interface OtcVerdictDisplayProps {
  verdict: OtcVerdictOutput;
  onContributeClick?: () => void;
  showProCta?: boolean;
}

const StatusIcon = ({ status }: { status: OtcStatus }) => {
  const iconClass = "h-5 w-5";
  switch (status) {
    case 'likely_halal':
      return <CheckCircle className={cn(iconClass, "text-green-600 dark:text-green-400")} />;
    case 'use_caution':
      return <AlertTriangle className={cn(iconClass, "text-yellow-600 dark:text-yellow-400")} />;
    case 'likely_haram':
      return <XCircle className={cn(iconClass, "text-destructive")} />;
    case 'unknown':
    default:
      return <HelpCircle className={cn(iconClass, "text-muted-foreground")} />;
  }
};

export function OtcVerdictDisplay({ 
  verdict, 
  onContributeClick,
  showProCta = true 
}: OtcVerdictDisplayProps) {
  const statusColors = OTC_STATUS_COLORS[verdict.status];
  const statusLabel = OTC_STATUS_LABELS[verdict.status];
  const showNextSteps = verdict.status === 'unknown' || verdict.status === 'use_caution';

  return (
    <div className="space-y-4">
      {/* Main Status Badge */}
      <Card className={cn("p-5 text-center border", statusColors.border, statusColors.bg)}>
        <div className="flex items-center justify-center gap-3 mb-3">
          <StatusIcon status={verdict.status} />
          <span className={cn("text-xl font-bold", statusColors.text)}>
            {statusLabel}
          </span>
        </div>
        
        {/* Confidence with tooltip */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1.5 cursor-help">
                  <span className="text-sm text-muted-foreground">
                    Confidence: {verdict.confidence}%
                  </span>
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">
                  Confidence reflects how complete the ingredient/formulation info is and 
                  whether common high-risk excipients are present. It's not a religious ruling.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Rationale short */}
        <p className="text-sm text-muted-foreground">
          {verdict.rationaleShort}
        </p>
      </Card>

      {/* Accordion Sections */}
      <Card className="p-4">
        <Accordion type="single" collapsible className="w-full">
          {/* Why this status */}
          <AccordionItem value="why" className="border-b-0">
            <AccordionTrigger className="hover:no-underline py-3">
              <span className="font-medium">Why this status</span>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              {verdict.rationaleLong && (
                <p className="text-muted-foreground mb-4">
                  {verdict.rationaleLong}
                </p>
              )}
              
              {/* Signals list */}
              {verdict.signals.length > 0 && (
                <ul className="space-y-2">
                  {verdict.signals.map((signal, index) => (
                    <li 
                      key={index}
                      className={cn(
                        "flex items-start gap-2 text-sm",
                        signal.impact === 'negative' && "text-destructive",
                        signal.impact === 'positive' && "text-green-600 dark:text-green-400",
                        signal.impact === 'neutral' && "text-muted-foreground"
                      )}
                    >
                      <span className={cn(
                        "mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0",
                        signal.impact === 'negative' && "bg-destructive",
                        signal.impact === 'positive' && "bg-green-500",
                        signal.impact === 'neutral' && "bg-muted-foreground"
                      )} />
                      <div>
                        <span className="font-medium">{signal.label}</span>
                        {signal.detail && (
                          <span className="text-muted-foreground"> — {signal.detail}</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {verdict.signals.length === 0 && !verdict.rationaleLong && (
                <p className="text-muted-foreground">
                  No specific signals to display. More information is needed to provide detailed analysis.
                </p>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Next Steps (only for unknown/use_caution) */}
          {showNextSteps && verdict.nextSteps.length > 0 && (
            <AccordionItem value="next-steps" className="border-b-0">
              <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  <span className="font-medium">What you can do next</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <ul className="space-y-3">
                  {verdict.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </Card>

      {/* Contribute Button */}
      {onContributeClick && (verdict.status === 'unknown' || !verdict.hasProfile) && (
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Lightbulb className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm mb-1">Help improve this product</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Paste the inactive ingredients from the package label to help us provide a more accurate assessment.
              </p>
              <Button size="sm" variant="outline" onClick={onContributeClick}>
                Contribute details
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Pro CTA (subtle, never gates status/warnings) */}
      {showProCta && verdict.hasProfile && (
        <div className="text-center pt-2">
          <p className="text-xs text-muted-foreground">
            Want deeper ingredient sourcing checks and brand comparisons?{" "}
            <Button variant="link" size="sm" className="h-auto p-0 text-xs">
              Unlock Pro
            </Button>
          </p>
        </div>
      )}
    </div>
  );
}
