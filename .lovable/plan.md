
## Add Search Bar to Landing Page Hero

### What changes
Add the same search bar with Scan button (used on the Browse page) into the Hero section of the landing page, positioned below the subtitle text and above the existing CTA buttons.

### Technical details

**File: `src/components/landing/HeroSection.tsx`**

1. Import `BrowseSearchBar` from `@/components/browse/BrowseSearchBar`
2. Add local state for the search query (`useState`)
3. Add a `useNavigate` hook so that when the user types and hits Enter (or interacts), they can be routed to `/browse?q=...` with their query pre-filled
4. Insert the `BrowseSearchBar` component between the subtitle text (line 55) and the CTA buttons (line 57), wrapped in a `motion.div` for consistent animation
5. Style the container with `max-w-xl mx-auto` to keep it centered and appropriately sized
6. On the search input, wire up an `onKeyDown` handler so pressing Enter navigates to `/browse?q={query}`
7. The Scan button already navigates to `/otc/scan` inside `BrowseSearchBar`, so no extra wiring needed

The search bar will have the same placeholder, icon, and Scan button as the Browse page version. Since `BrowseSearchBar` is a controlled component (value + onChange), we just need to manage the state locally and handle navigation on submit.
