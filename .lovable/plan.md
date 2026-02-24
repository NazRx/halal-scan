

## Make Hero Search Bar Functional with Live Results

### What changes
Replace the current simple search input in the hero section with the existing `HeroSearchInput` component, which already has:
- Live search results dropdown (Rx and OTC medications)
- Direct navigation to drug report pages (`/otc/:id/report` for OTC, `/rx/med/:id` for Rx)
- Keyboard navigation (arrow keys, Enter, Escape)
- "Not found" state with a "Request a Review" button
- Rotating placeholder text cycling through example drug names
- Integrated Scan button
- Loading states

### Technical details

**File: `src/components/landing/HeroSection.tsx`**

1. Remove the custom inline search bar block (lines 47-72), including the `query`, `placeholderIdx` state, the `useEffect` for rotation, and the `handleSearch` function -- all of this is already built into `HeroSearchInput`.
2. Import `HeroSearchInput` from `@/components/landing/HeroSearchInput`.
3. Remove unused imports: `useState`, `useEffect`, `Search`, `ScanLine`, and the `PLACEHOLDER_DRUGS` constant.
4. Insert `<HeroSearchInput />` in the same position (above the headline), wrapped in the existing `motion.div` for animation.

No changes needed to `HeroSearchInput.tsx` -- it already handles everything including the rotating placeholder and Scan button. Its white/glass styling (`bg-white/90 backdrop-blur-xl`) will be clearly legible on the teal hero gradient.

### Layout order (unchanged)
1. "A Medication Transparency Initiative" tagline
2. **HeroSearchInput** (with live dropdown results + Scan button)
3. Main headline
4. Subtitle
5. CTA buttons

