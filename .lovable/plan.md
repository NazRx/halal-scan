

# Global Gradient Background for All Pages

## Overview
Apply a subtle emerald-to-teal gradient background across every page in the app, matching the premium green aesthetic from the homepage hero -- but softer so content remains readable.

## Approach

### 1. Global Gradient via CSS
**File:** `src/index.css`

Update the `body` styling in the base layer to apply a subtle full-page gradient instead of the flat `bg-background` color:

- Add a CSS class `.app-gradient-bg` with a soft top-to-bottom gradient:
  - Light mode: from a very faint emerald tint at the top to the current near-white background at the bottom, with a fixed/repeating feel
  - Dark mode: from a deeper emerald-charcoal at the top to the current dark background

### 2. Apply to App Root
**File:** `src/App.tsx`

Wrap the app content (inside `BrowserRouter`) with a `<div className="min-h-screen app-gradient-bg">` so every route inherits the gradient.

### 3. Page Adjustments
Update individual page wrappers to use `bg-transparent` or remove explicit `bg-background` so the gradient shows through. Pages affected:
- `src/pages/AppHome.tsx` -- remove `bg-background` from outer div
- `src/pages/Pricing.tsx` -- remove `bg-background`
- `src/pages/Resources.tsx`, `FAQ.tsx`, `IngredientDatabase.tsx`, `Blog.tsx`, `BlogPost.tsx`, `Legal.tsx`, `Privacy.tsx`, `Terms.tsx`, `Disclaimer.tsx`, `Feedback.tsx` -- ensure no opaque background overrides the gradient

Cards and content containers keep their `bg-card` / `bg-white` so content remains crisp against the gradient.

## Technical Details

**New CSS in `src/index.css`:**
```css
.app-gradient-bg {
  background: linear-gradient(
    180deg,
    hsl(158 40% 95%) 0%,
    hsl(150 20% 98%) 30%,
    hsl(165 15% 97%) 70%,
    hsl(158 30% 95%) 100%
  );
  min-height: 100vh;
}

.dark .app-gradient-bg {
  background: linear-gradient(
    180deg,
    hsl(160 30% 6%) 0%,
    hsl(160 25% 8%) 30%,
    hsl(165 20% 7%) 70%,
    hsl(158 25% 6%) 100%
  );
}
```

This creates a gentle, barely-there emerald wash that ties every page visually to the brand without competing with content.

## Files Modified
- `src/index.css` -- add gradient utility class
- `src/App.tsx` -- wrap routes in gradient container
- `src/pages/AppHome.tsx` -- remove opaque bg override
- Multiple info pages -- remove any `bg-background` overrides

## What Does NOT Change
- Card/container backgrounds stay white/card for readability
- Header and Footer unchanged
- Hero section keeps its stronger `gradient-hero`
- No copy or layout changes

