
## Move Search Bar Above Headline + Fix Visibility + Rotating Placeholder

### What changes

Three improvements to the landing page hero section:

1. **Move the search bar above the headline text** -- currently it sits between the subtitle and CTA buttons; it will move to right after the "A Medication Transparency Initiative" tagline and before the main heading.

2. **Fix Scan button visibility** -- replace the shared `BrowseSearchBar` with a custom inline search bar so we have full styling control. The Scan button will get explicit solid styling (`bg-white/20 border border-white/40 text-white`) so it's clearly readable on the teal gradient.

3. **Add rotating SaaS-style placeholder** -- instead of the static "Search drug name..." text, cycle through real medication examples every 3 seconds:
   - "Search Lisinopril..."
   - "Search Metformin..."
   - "Search Vitamin D..."
   - "Search Ibuprofen..."
   - "Search Amoxicillin..."

### Technical details

**File: `src/components/landing/HeroSection.tsx`**

- Remove the `BrowseSearchBar` import (no longer needed here; Browse page keeps it).
- Add `useEffect` import for the placeholder rotation.
- Add `Search, ScanLine` icon imports from lucide-react.
- Add state for rotating placeholder index and a `useEffect` with `setInterval` (3s cycle).
- Build the search bar inline with:
  - Container: `bg-white/10 border border-white/25 rounded-2xl` with backdrop blur
  - Input: `bg-transparent text-white placeholder:text-white/50`
  - Scan button: `bg-white/20 border border-white/40 text-white hover:bg-white/30` -- clearly legible
  - Search icon: `text-white/50`
- Move this search bar block to appear right after the "A Medication Transparency Initiative" tagline (line 26), before the `h1` heading.
- Keep the same navigation logic: Enter submits to `/browse?q=...`, Scan goes to `/otc/scan`.

### Layout order (after change)

1. "A Medication Transparency Initiative" tagline
2. Search bar with Scan button (NEW position)
3. Main headline "Clarity on What's Inside..."
4. Subtitle paragraph
5. "Developed by Muslim healthcare professionals..." line
6. CTA buttons (Scan Medication / Learn How It Works)
