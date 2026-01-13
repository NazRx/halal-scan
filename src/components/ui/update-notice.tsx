import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface UpdateNoticeProps {
  className?: string;
  showFeedbackLink?: boolean;
}

export function UpdateNotice({ className, showFeedbackLink = true }: UpdateNoticeProps) {
  return (
    <div className={cn(
      "flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10",
      className
    )}>
      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 shrink-0">
        <RefreshCw className="h-4 w-4 text-primary" />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-medium">Continuously Updated Database</h4>
        <p className="text-xs text-muted-foreground">
          Our team actively reviews and updates medication profiles. We verify ingredient sources, 
          manufacturer formulations, and halal certifications on an ongoing basis.
          {showFeedbackLink && (
            <>
              {" "}If you notice any discrepancies or have updated information,{" "}
              <Link to="/feedback" className="text-primary hover:underline">
                please let us know
              </Link>.
            </>
          )}
        </p>
      </div>
    </div>
  );
}
