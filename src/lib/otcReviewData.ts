import type { OtcReviewCard, OtcSignalTag } from "@/types/otcReview";

export const reviewedBrandCards: OtcReviewCard[] = [
  {
    id: "tylenol_tablets",
    title: "Tylenol® — tablet formulations",
    tone: "neutral",
    body: "Tylenol tablet and caplet products typically do not contain gelatin or alcohol. The active ingredient (acetaminophen) is synthetic.\n\nInactive ingredients may still vary by product line (e.g., regular vs extra strength), so brand- and form-specific review is recommended for higher confidence.",
    footerNote: "Formulations may change over time.",
  },
  {
    id: "equate_tablets",
    title: "Equate® — store-brand tablets",
    tone: "neutral",
    body: "Equate tablet formulations are often similar to name brands, but are produced by contract manufacturers that may change over time.\n\nInactive ingredients and sourcing can vary even when the product name remains the same.",
    footerNote: "Store brands are formulation-dependent.",
  },
  {
    id: "cvs_tablets",
    title: "CVS Health® — OTC tablets",
    tone: "neutral",
    body: "CVS Health often publishes inactive ingredient lists online. Tablet formulations are generally lower concern than liquids or softgels.\n\nHowever, CVS products may still be manufactured by different suppliers depending on dosage form and product line.",
    footerNote: "Verification improves confidence.",
  },
  {
    id: "walgreens_tablets",
    title: "Walgreens® — OTC tablets",
    tone: "neutral",
    body: "Walgreens OTC tablets are commonly contract-manufactured. While tablet forms are usually lower concern, formulations may vary by supplier and dosage form.\n\nIngredient sourcing is not always disclosed.",
    footerNote: "Consistency may vary.",
  },
  {
    id: "softgels_multi_brand",
    title: "Softgel formulations — multiple brands",
    tone: "caution",
    body: "Softgel and gelcap products commonly use gelatin for the capsule shell. The source of gelatin is usually not disclosed on OTC packaging.\n\nBecause of this, softgels are among the highest-uncertainty OTC forms unless verified.",
    footerNote: "Applies across many brands.",
  },
];

export const reviewedBrandsSectionProps = {
  title: "Examples of reviewed OTC formulations",
  subtitle:
    "These examples show how formulations can differ. They are not endorsements and may change over time.",
  cards: reviewedBrandCards,
  disclaimer:
    "These examples illustrate common formulation patterns. They are not endorsements or religious rulings, and formulations may change without notice.",
};

export const otcSignalTags: OtcSignalTag[] = [
  {
    key: "publishes_ingredient_list",
    label: "Publishes ingredient list",
    tooltipFree:
      "Brand provides publicly available inactive ingredient information.",
    proTitle: "Publishes inactive ingredients",
    proBody:
      "This brand provides publicly accessible inactive ingredient lists, allowing higher confidence assessments when reviewed.\n\nAvailability of an ingredient list does not guarantee halal sourcing but improves transparency.",
    proEvidenceNote: "Based on publicly accessible U.S. OTC labeling practices.",
  },
  {
    key: "varies_by_brand",
    label: "Formulation varies by brand",
    tooltipFree: "Same product name may differ across brands.",
    proTitle: "Formulation varies by brand",
    proBody:
      "OTC products with the same active ingredient can differ significantly in inactive ingredients (especially liquids, softgels, and gummies).\n\nBrand selection improves accuracy when comparing formulations.",
    proEvidenceNote: "Based on review of common U.S. OTC formulations.",
  },
  {
    key: "contract_manufactured",
    label: "Contract manufactured",
    tooltipFree: "Produced by different manufacturers over time.",
    proTitle: "Contract manufacturing",
    proBody:
      "This product may be produced by different suppliers over time. Ingredient lists and excipient sourcing can change without notice.\n\nPro can help compare known formulation differences across brands when available.",
    proEvidenceNote:
      "Common in U.S. store-brand and private-label OTC products.",
  },
  {
    key: "gelatin_commonly_used",
    label: "Gelatin commonly used",
    tooltipFree: "Often used in this dosage form.",
    proTitle: "Gelatin — formulation risk",
    proBody:
      "Gelatin is commonly used in softgel capsule shells. OTC labels usually do not disclose whether the gelatin source is bovine, porcine, or synthetic.\n\nBecause sourcing is unclear, this increases halal uncertainty unless verified.",
    proEvidenceNote: "Based on review of U.S. OTC softgel formulations.",
  },
  {
    key: "alcohol_sometimes_used",
    label: "Alcohol sometimes used",
    tooltipFree: "Some formulations include alcohol depending on brand.",
    proTitle: "Alcohol — formulation risk",
    proBody:
      "Some liquid OTC products use alcohol as a solvent or preservative. Presence and amount varies by brand and product line.\n\nWhen alcohol is present, we surface it as a formulation concern and recommend verifying the exact inactive ingredient list.",
    proEvidenceNote: "Based on common U.S. OTC liquid formulation practices.",
  },
];

/**
 * Returns relevant signal tags based on the dosage form
 */
export function getSignalTagsForDosageForm(
  dosageForm: string | null | undefined
): OtcSignalTag[] {
  if (!dosageForm) {
    return [
      otcSignalTags.find((t) => t.key === "varies_by_brand")!,
    ].filter(Boolean);
  }

  const form = dosageForm.toLowerCase();
  const tags: OtcSignalTag[] = [];

  // Always include varies_by_brand
  tags.push(otcSignalTags.find((t) => t.key === "varies_by_brand")!);

  if (form.includes("softgel") || form.includes("gelcap")) {
    tags.push(otcSignalTags.find((t) => t.key === "gelatin_commonly_used")!);
  }

  if (
    form.includes("liquid") ||
    form.includes("syrup") ||
    form.includes("solution") ||
    form.includes("suspension")
  ) {
    tags.push(otcSignalTags.find((t) => t.key === "alcohol_sometimes_used")!);
  }

  if (form.includes("gummy") || form.includes("chewable")) {
    tags.push(otcSignalTags.find((t) => t.key === "gelatin_commonly_used")!);
  }

  return tags.filter(Boolean);
}
