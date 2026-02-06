import { Card } from "@/components/ui/card";
import { AlertTriangle, FileCheck } from "lucide-react";
import type { OtcReviewCard } from "@/types/otcReview";

interface OtcPatternReviewedBrandsProps {
  title?: string;
  subtitle?: string;
  cards: OtcReviewCard[];
  disclaimer?: string;
}

export function OtcPatternReviewedBrands({
  title = "Examples of reviewed OTC formulations",
  subtitle,
  cards,
  disclaimer,
}: OtcPatternReviewedBrandsProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start gap-2 mb-2">
        <FileCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-base">{title}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
        {cards.map((card) => (
          <ReviewCard key={card.id} card={card} />
        ))}
      </div>

      {disclaimer && (
        <p className="text-xs text-muted-foreground mt-4 italic">
          {disclaimer}
        </p>
      )}
    </Card>
  );
}

function ReviewCard({ card }: { card: OtcReviewCard }) {
  const isCaution = card.tone === "caution";

  return (
    <div
      className={`rounded-lg border p-4 ${
        isCaution
          ? "border-warning bg-warning/10"
          : "border-border bg-muted/30"
      }`}
    >
      <div className="flex items-start gap-2 mb-2">
        {isCaution && (
          <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
        )}
        <h4 className="font-medium text-sm">{card.title}</h4>
      </div>

      {card.subtitle && (
        <p className="text-xs text-muted-foreground mb-2">{card.subtitle}</p>
      )}

      <div className="text-sm text-muted-foreground whitespace-pre-line">
        {card.body}
      </div>

      {card.bullets && card.bullets.length > 0 && (
        <ul className="mt-2 space-y-1">
          {card.bullets.map((bullet, index) => (
            <li
              key={index}
              className="text-xs text-muted-foreground flex items-start gap-2"
            >
              <span className="text-muted-foreground/60">–</span>
              {bullet}
            </li>
          ))}
        </ul>
      )}

      {card.footerNote && (
        <p className="text-xs text-muted-foreground/80 mt-3 italic">
          {card.footerNote}
        </p>
      )}
    </div>
  );
}
