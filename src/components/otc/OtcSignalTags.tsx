import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tag, Info, Sparkles } from "lucide-react";
import type { OtcSignalTag } from "@/types/otcReview";

interface OtcSignalTagsProps {
  tags: OtcSignalTag[];
  isPro: boolean;
}

export function OtcSignalTags({ tags, isPro }: OtcSignalTagsProps) {
  if (tags.length === 0) return null;

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Tag className="h-4 w-4 text-muted-foreground" />
        <h4 className="text-sm font-medium">Formulation signals</h4>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs text-center">
              <p className="text-xs">
                These tags highlight common formulation practices. They are not
                halal rulings.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <SignalTagBadge key={tag.key} tag={tag} isPro={isPro} />
        ))}
      </div>

      {isPro && (
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs text-muted-foreground">
            Review depth: Pattern-based
          </span>
        </div>
      )}
    </Card>
  );
}

function SignalTagBadge({
  tag,
  isPro,
}: {
  tag: OtcSignalTag;
  isPro: boolean;
}) {
  const [open, setOpen] = useState(false);

  // For free users, just show tooltip
  if (!isPro) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className="cursor-help text-xs font-normal"
            >
              {tag.label}
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs text-center">
            <p className="text-xs">{tag.tooltipFree}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // For Pro users, show popover with expanded content
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Badge
                variant="outline"
                className="cursor-pointer text-xs font-normal hover:bg-accent transition-colors"
              >
                {tag.label}
              </Badge>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs text-center">
            <p className="text-xs">{tag.tooltipFree}</p>
            <p className="text-xs text-primary mt-1">Tap for details</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h4 className="font-medium text-sm">{tag.proTitle}</h4>
          </div>
          <p className="text-sm text-muted-foreground whitespace-pre-line">
            {tag.proBody}
          </p>
          {tag.proEvidenceNote && (
            <p className="text-xs text-muted-foreground/80 italic border-t pt-2">
              {tag.proEvidenceNote}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
