import { useState } from "react";
import { ChevronDown, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface DisclaimerProps {
  variant?: "banner" | "card" | "inline";
  showOtcNote?: boolean;
  className?: string;
  defaultExpanded?: boolean;
}

export function Disclaimer({ 
  variant = "card", 
  showOtcNote = false,
  className,
  defaultExpanded = false
}: DisclaimerProps) {
  const [isOpen, setIsOpen] = useState(defaultExpanded);

  if (variant === "banner") {
    return (
      <div className={cn(
        "p-4 rounded-xl bg-muted/50 border",
        className
      )}>
        <div className="flex items-start gap-3">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Scope Notice:</strong> This app currently focuses on U.S.-labeled medications and products. 
              Formulations, inactive ingredients, and halal considerations may differ in other countries.
            </p>
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger className="flex items-center gap-1 text-xs text-primary hover:underline">
                {isOpen ? "Show less" : "Read important information"}
                <ChevronDown className={cn(
                  "h-3 w-3 transition-transform",
                  isOpen && "rotate-180"
                )} />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3 space-y-2">
                <p className="text-xs text-muted-foreground">
                  Halal status depends on the specific formulation, manufacturer, and excipients used.
                </p>
                <p className="text-xs text-muted-foreground">
                  This app references publicly available U.S. FDA labeling, manufacturer information, and certifier listings. 
                  International versions of the same medication may contain different ingredients.
                </p>
                <p className="text-xs text-muted-foreground">
                  Information is provided for educational and decision-support purposes only. 
                  It does not replace professional medical advice or scholarly guidance.
                </p>
                <p className="text-xs text-muted-foreground font-medium">
                  In cases of medical necessity (darūra), consult a qualified healthcare professional and scholar.
                </p>
                {showOtcNote && (
                  <p className="text-xs text-muted-foreground italic border-t pt-2 mt-2">
                    Note: OTC products may change formulations without notice. 
                    Always verify the current product label for the most accurate information.
                  </p>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "inline") {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className={className}>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full">
          <AlertCircle className="h-4 w-4" />
          <span>Important Disclaimers</span>
          <ChevronDown className={cn(
            "h-4 w-4 ml-auto transition-transform",
            isOpen && "rotate-180"
          )} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 pl-6 space-y-2 text-xs text-muted-foreground">
          <p>
            <strong className="text-foreground">Scope Notice:</strong> This app currently focuses on U.S.-labeled medications and products. 
            Formulations, inactive ingredients, and halal considerations may differ in other countries.
          </p>
          <p>
            Halal status depends on the specific formulation, manufacturer, and excipients used.
          </p>
          <p>
            This app references publicly available U.S. FDA labeling, manufacturer information, and certifier listings. 
            International versions of the same medication may contain different ingredients.
          </p>
          <p>
            Information is provided for educational and decision-support purposes only. 
            It does not replace professional medical advice or scholarly guidance.
          </p>
          <p className="font-medium">
            In cases of medical necessity (darūra), consult a qualified healthcare professional and scholar.
          </p>
          {showOtcNote && (
            <p className="italic border-t pt-2 mt-2">
              Note: OTC products may change formulations without notice. 
              Always verify the current product label for the most accurate information.
            </p>
          )}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  // Card variant (default)
  return (
    <div className={cn(
      "rounded-lg border bg-card p-4",
      className
    )}>
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-sm mb-1">Scope Notice</h4>
            <p className="text-sm text-muted-foreground">
              This app currently focuses on U.S.-labeled medications and products. 
              Formulations, inactive ingredients, and halal considerations may differ in other countries.
            </p>
          </div>
          
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger className="flex items-center gap-1 text-sm text-primary hover:underline">
              {isOpen ? "Hide details" : "Important Information"}
              <ChevronDown className={cn(
                "h-4 w-4 transition-transform",
                isOpen && "rotate-180"
              )} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 space-y-2 text-sm text-muted-foreground">
              <p>
                Halal status depends on the specific formulation, manufacturer, and excipients used.
              </p>
              <p>
                This app references publicly available U.S. FDA labeling, manufacturer information, and certifier listings. 
                International versions of the same medication may contain different ingredients.
              </p>
              <p>
                Information is provided for educational and decision-support purposes only. 
                It does not replace professional medical advice or scholarly guidance.
              </p>
              <p className="font-medium text-foreground">
                In cases of medical necessity (darūra), consult a qualified healthcare professional and scholar.
              </p>
              {showOtcNote && (
                <p className="italic border-t pt-2 mt-2 border-border">
                  Note: OTC products may change formulations without notice. 
                  Always verify the current product label for the most accurate information.
                </p>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  );
}
