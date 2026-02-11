

# Homepage Visual Upgrade: Green Hero + Premium Polish

## Overview
Restore the emerald green gradient background to the Hero section and elevate the visual quality across all 8 sections -- without changing any words or section order.

## Changes

### 1. Hero Section -- Green Gradient Background
**File:** `src/components/landing/HeroSection.tsx`
- Add `gradient-hero` class to the section background
- Switch headline and subheadline text to `text-primary-foreground` (white) so they read against the green
- Update micro trust line to `text-primary-foreground/70`
- Add subtle decorative blur orbs (from `GradientOrb` component) for depth
- Update `HeroSearchInput` container styling for contrast against green (white/glass search bar)

**File:** `src/components/landing/HeroSearchInput.tsx`
- Adjust search bar to use `bg-white/90 backdrop-blur` so it pops against the green hero
- Adjust quick-action pill buttons to use `bg-white/20 border-white/30 text-white` styling
- Adjust micro trust line color for green background contrast

### 2. Section Dividers and Spacing
- Add subtle top/bottom border accents or soft gradient transitions between sections for a more polished flow
- Alternate section backgrounds more deliberately: white, muted, white, muted pattern

### 3. Typography and Hierarchy Refinements
**All section files** (no copy changes, only styling):
- Increase section title size slightly on desktop (`text-4xl md:text-5xl` where currently `text-3xl md:text-4xl`)
- Add subtle letter-spacing to section titles (`tracking-tight`)
- Use `font-display` for headings for a slightly more premium feel

### 4. Card and Container Polish
**File:** `src/components/landing/FounderStorySection.tsx`
- Add a subtle `shadow-lg` and slightly larger border radius to the quote card
- Add a thin left-side green accent border to the blockquote

**File:** `src/components/landing/ConfidenceSystemSection.tsx`
- Add hover elevation effect to confidence tier cards (`hover:shadow-md transition-shadow`)
- Add a subtle left accent color per tier (green for High, amber for Moderate, gray for Limited)

**File:** `src/components/landing/HowItWorksSection.tsx`
- Add `shadow-glow` or subtle `shadow-md` to the icon blocks for lifted feel
- Ensure the connecting line between steps is visible and styled

### 5. WhatMakesDifferentSection Polish
**File:** `src/components/landing/WhatMakesDifferentSection.tsx`
- Wrap bullet list in a subtle card container with border for visual separation
- Add small green checkmark icons instead of plain dots for the bullet points

### 6. CTA Section -- Already Green (Keep As-Is)
The CTA section already uses `gradient-hero` -- no changes needed. Just ensure visual consistency with the hero.

### 7. Scholarly Alignment Section
**File:** `src/components/landing/ScholarlyAlignmentSection.tsx`
- Add a subtle decorative element (thin horizontal rule or small icon) above the title for visual break

## Files Modified
- `src/components/landing/HeroSection.tsx` -- green gradient bg, white text
- `src/components/landing/HeroSearchInput.tsx` -- glass-style search bar for green bg
- `src/components/landing/HowItWorksSection.tsx` -- card shadows, polish
- `src/components/landing/WhatMakesDifferentSection.tsx` -- card container, check icons
- `src/components/landing/ConfidenceSystemSection.tsx` -- accent borders, hover states
- `src/components/landing/ScholarlyAlignmentSection.tsx` -- decorative divider
- `src/components/landing/FounderStorySection.tsx` -- quote card elevation

## What Does NOT Change
- All written copy stays exactly the same
- Section order stays the same
- No new sections added or removed
- Rx and OTC pages untouched
