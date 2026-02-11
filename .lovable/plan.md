

# Homepage Redesign: Clinical Trust-Driven Structure

## Overview
Replace the current marketing-style homepage with a calm, clinical, trust-driven layout across 8 sections using the exact copy provided. Remove inflated stats, scholar badges, and hype language.

## Section-by-Section Plan

### 1. Rewrite `HeroSection.tsx`
- Remove "Scholar Approved" badge, "50,000+ Products" stat, and "Know Your Meds. Stay Halal." headline
- New headline: "The First U.S. Halal Medication Verification Platform"
- New subheadline: exact copy about transparent ingredient analysis
- Keep the existing `HeroSearchInput` component (already has Search + Scan buttons)
- Add micro trust line below search: "Pharmacist-developed. Evidence-based. Built for Muslims in America."
- Remove the animated gradient orbs and grid pattern for a cleaner, calmer feel
- Remove quick-action pills from HeroSearchInput (the Search/Scan CTAs are already in the bar)

### 2. Create new `WhyItMattersSection.tsx`
- Section title: "Why Halal Verification Matters"
- Render the multi-paragraph body copy as clean, well-spaced prose
- No icons, no cards -- just typography with generous spacing

### 3. Rewrite `HowItWorksSection.tsx`
- Section title: "Simple. Transparent. Fast."
- 4 steps with updated copy (Search or Scan, Analyze, Get a Verdict, Understand Why)
- Keep the existing icon-block layout but update descriptions to match the exact copy
- Replace "Cross-reference against halal standards" with the FDA-specific language

### 4. Create new `WhatMakesDifferentSection.tsx`
- Section title: "Built on Transparency, Not Assumptions"
- Intro paragraph + bullet list of 5 items
- Closing line about transparency vs. absolute claims
- Clean card or prose layout

### 5. Create new `ConfidenceSystemSection.tsx`
- Section title: "Our Confidence System"
- Intro copy about limited data disclosure
- 3 confidence tiers displayed as stacked cards: High, Moderate, Limited Data
- Each with title + description
- Closing line: "Clarity includes acknowledging uncertainty."

### 6. Create new `ScholarlyAlignmentSection.tsx`
- Section title: "Committed to Scholarly Alignment"
- Body paragraphs about not issuing religious rulings, working toward scholarly consultation
- No badge or seal

### 7. Rewrite `CredibilitySection.tsx` as `FounderStorySection.tsx`
- Section title: "Made by Muslims, for Muslims"
- Body paragraph + Dr. Sarah Ahmed quote (using exact copy)
- Keep the existing avatar/quote card layout but remove the "Scholar Reviewed" trust point and the bottom trust points grid
- Calm, editorial feel

### 8. Rewrite `CTASection.tsx`
- Headline: "Search Your Medication Today"
- Subheadline: "Clarity takes seconds. Peace of mind lasts longer."
- Two buttons: "Search Medication" (navigates to /app or /rx/search) and "Scan Barcode" (navigates to /otc/scan)
- Remove "Join thousands..." hype copy
- Visually strong but calm -- keep the gradient card but soften the language

### 9. Update `Index.tsx`
- New section order:
  1. HeroSection
  2. WhyItMattersSection
  3. HowItWorksSection
  4. WhatMakesDifferentSection
  5. ConfidenceSystemSection
  6. ScholarlyAlignmentSection
  7. FounderStorySection
  8. CTASection
- Remove PricingSection and FAQSection from homepage (they still exist on their own routes)

## Files to Create
- `src/components/landing/WhyItMattersSection.tsx`
- `src/components/landing/WhatMakesDifferentSection.tsx`
- `src/components/landing/ConfidenceSystemSection.tsx`
- `src/components/landing/ScholarlyAlignmentSection.tsx`
- `src/components/landing/FounderStorySection.tsx`

## Files to Modify
- `src/components/landing/HeroSection.tsx` -- full rewrite with clinical tone
- `src/components/landing/HowItWorksSection.tsx` -- update copy and title
- `src/components/landing/CTASection.tsx` -- update copy, remove hype
- `src/pages/Index.tsx` -- new section composition

## Files Unchanged
- `src/components/landing/HeroSearchInput.tsx` -- keep as-is (already has search + scan)
- `src/components/landing/PricingSection.tsx` -- kept but removed from homepage
- `src/components/landing/FAQSection.tsx` -- kept but removed from homepage
- `src/components/landing/FeaturesSection.tsx` -- kept but removed from homepage
- All Rx and OTC product pages -- no changes

## Design Notes
- Calm green tones, generous whitespace, no gradient orbs on hero
- Typography-driven sections (WhyItMatters, ScholarlyAlignment) use prose, not cards
- Confidence system uses subtle bordered cards, not colored verdict badges
- All motion animations kept subtle (fade-in on scroll)
- No testimonials, no inflated statistics, no scholar endorsement seals

