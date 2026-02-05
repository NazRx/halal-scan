import { Card } from "@/components/ui/card";
import { Pill, Droplets, CircleDot, Candy, HelpCircle } from "lucide-react";

interface DosageFormGuidanceProps {
  dosageForm: string | null | undefined;
}

type GuidanceContent = {
  icon: React.ReactNode;
  title: string;
  bullets: string[];
  guidance: string;
};

function getGuidanceContent(dosageForm: string | null | undefined): GuidanceContent {
  const form = dosageForm?.toLowerCase() || "";

  if (form.includes("tablet") || form.includes("caplet")) {
    return {
      icon: <Pill className="h-5 w-5 text-primary" />,
      title: "Typical tablet/caplet formulations",
      bullets: [
        "Usually alcohol-free",
        "Animal-derived ingredients are less common than in softgels or liquids",
      ],
      guidance: "Tablets and caplets are often the lowest-risk OTC form from a halal perspective.",
    };
  }

  if (form.includes("liquid") || form.includes("syrup") || form.includes("solution") || form.includes("suspension")) {
    return {
      icon: <Droplets className="h-5 w-5 text-accent-foreground" />,
      title: "Typical liquid formulations",
      bullets: [
        "May contain alcohol as a solvent or preservative",
        "Often include glycerin, flavorings, or colorants",
      ],
      guidance: "Liquid formulations require brand-specific verification.",
    };
  }

  if (form.includes("softgel") || form.includes("gelcap") || form.includes("capsule")) {
    return {
      icon: <CircleDot className="h-5 w-5 text-accent-foreground" />,
      title: "Typical softgel formulations",
      bullets: [
        "Capsule shells often contain gelatin",
        "Gelatin source is rarely disclosed",
      ],
      guidance: "Softgels commonly raise animal-source concerns unless verified.",
    };
  }

  if (form.includes("gummy") || form.includes("chewable") || form.includes("gummies")) {
    return {
      icon: <Candy className="h-5 w-5 text-destructive" />,
      title: "Typical gummy formulations",
      bullets: [
        "Often contain gelatin, dyes, and flavorings",
      ],
      guidance: "Gummies are among the highest-risk OTC forms for halal uncertainty.",
    };
  }

  // Unknown or unrecognized dosage form
  return {
    icon: <HelpCircle className="h-5 w-5 text-muted-foreground" />,
    title: "Dosage form guidance",
    bullets: [],
    guidance: "Formulation risk depends heavily on dosage form and brand.",
  };
}

export function DosageFormGuidance({ dosageForm }: DosageFormGuidanceProps) {
  const content = getGuidanceContent(dosageForm);

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{content.icon}</div>
        <div>
          <h3 className="font-medium mb-2">{content.title}</h3>
          {content.bullets.length > 0 && (
            <ul className="text-sm text-muted-foreground space-y-1 mb-3">
              {content.bullets.map((bullet, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground mt-1.5 flex-shrink-0" />
                  {bullet}
                </li>
              ))}
            </ul>
          )}
          <p className="text-sm font-medium text-foreground">
            {content.guidance}
          </p>
        </div>
      </div>
    </Card>
  );
}
