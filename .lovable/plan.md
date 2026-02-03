
# Fix Global Search Dropdown Scroll

## Problem
The search results dropdown in the GlobalSearch component (used on the /app "Scanner" page and other pages) is not scrollable. When there are many results, items at the bottom are cut off and users cannot scroll to see them.

## Root Cause
The Radix UI ScrollArea component is configured with `max-h-[min(400px,50vh)]` on the Root element, but the internal Viewport component has `h-full w-full` which doesn't properly constrain the scrollable area. The Radix ScrollArea's internal viewport applies inline styles that can override the CSS height, preventing proper scroll behavior.

## Solution
Wrap the ScrollArea in a container div that has the explicit max-height constraint, and ensure the ScrollArea properly fills that container. This is the standard pattern for making Radix ScrollArea work with max-height constraints.

---

## Technical Implementation

### File: `src/components/search/GlobalSearch.tsx`

**Change 1:** Replace the current ScrollArea implementation (lines 156-213) with a wrapper pattern:

```tsx
// BEFORE (line 156-213):
<ScrollArea className="max-h-[min(400px,50vh)]">
  <div className="pb-2">
    {results.map(...)}
  </div>
</ScrollArea>

// AFTER:
<div className="max-h-[min(400px,50vh)] overflow-hidden">
  <ScrollArea className="h-full max-h-[min(400px,50vh)]">
    <div className="pb-2">
      {results.map(...)}
    </div>
  </ScrollArea>
</div>
```

**Why this works:** The outer div provides a fixed max-height boundary. The ScrollArea with `h-full` then fits within this boundary, and its viewport can properly calculate when content exceeds the available space, enabling scroll.

---

### File: `src/components/otc/OtcSearchInput.tsx`

**Change 2:** Apply the same wrapper pattern to the OTC search dropdown (lines 123-154):

```tsx
// BEFORE (line 125):
<ScrollArea className="max-h-[min(400px,50vh)]">
  <div className="py-2 pb-3">
    ...
  </div>
</ScrollArea>

// AFTER:
<div className="max-h-[min(400px,50vh)] overflow-hidden">
  <ScrollArea className="h-full max-h-[min(400px,50vh)]">
    <div className="py-2 pb-3">
      ...
    </div>
  </ScrollArea>
</div>
```

---

## Summary of Changes

| File | Change |
|------|--------|
| `src/components/search/GlobalSearch.tsx` | Wrap ScrollArea in constraining div |
| `src/components/otc/OtcSearchInput.tsx` | Apply same wrapper pattern |

## Expected Result
- Search results dropdown will show a visible scrollbar when results exceed the viewport
- Users can scroll with mouse wheel, trackpad, or by dragging the scrollbar
- All results become accessible regardless of list length
- Works on both the /app (Scanner) page and /otc/browse page
