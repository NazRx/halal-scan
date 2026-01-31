
# Fix Admin Dashboard Mobile Layout

## Problem Summary

The admin dashboard has severe visual overlap and usability issues on mobile devices (viewport ~344px wide):

1. **Fixed sidebar takes too much space** - The sidebar (256px or 64px collapsed) leaves almost no room for main content on mobile
2. **Tab buttons overflow** - The 5-column TabsList in SeedData page gets squished and unreadable
3. **Stats grids are cramped** - Dashboard uses 2 columns minimum, SeedData uses up to 7 columns with no mobile accommodation
4. **Excessive padding** - Main content uses `p-8` (32px) which wastes valuable mobile screen space

## Solution Overview

Transform the admin panel into a mobile-first responsive layout:

1. **Mobile drawer navigation** - Hide sidebar on mobile, replace with hamburger menu that opens a slide-out drawer
2. **Responsive stat cards** - Use single column on mobile, progressively more columns on larger screens
3. **Scrollable tabs** - Make TabsList horizontally scrollable on mobile instead of squished columns
4. **Reduced mobile padding** - Use `p-4` on mobile, `p-8` on desktop

## Implementation Details

### 1. AdminLayout.tsx - Mobile Drawer Pattern

**Current behavior:** Sidebar always visible, squishes main content on mobile

**New behavior:**
- On mobile (`< 768px`): Hide sidebar, show hamburger menu button in a fixed header
- When hamburger clicked: Open a Sheet (drawer) with navigation items
- On desktop: Keep current collapsible sidebar behavior

```
Mobile Layout:
+----------------------------------+
| [☰]  Admin Panel                |  <- Fixed header with menu button
+----------------------------------+
|                                  |
|   Main Content                   |
|   (full width)                   |
|                                  |
+----------------------------------+

Sheet opens from left with nav items
```

### 2. Dashboard.tsx - Responsive Grid

**Current:** `grid-cols-2 md:grid-cols-4`

**New:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`

- Mobile: 1 column (full width cards, easy to read)
- Small tablets: 2 columns
- Desktop: 4 columns

Also reduce card content density on mobile.

### 3. SeedData.tsx - Multiple Fixes

**Stats Grid:**
- Current: `grid-cols-2 md:grid-cols-4 lg:grid-cols-7`
- New: `grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7`

**TabsList:**
- Current: `grid grid-cols-5` (forces 5 columns, breaks on mobile)
- New: Use horizontal scrollable tabs with `overflow-x-auto` and `flex` instead of grid

**Button Groups:**
- Current: `flex flex-wrap gap-3`
- New: Stack vertically on mobile with `flex-col sm:flex-row`

### 4. Main Content Padding

**Current:** `p-8` (32px all sides)

**New:** `p-4 md:p-8` (16px mobile, 32px desktop)

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/admin/AdminLayout.tsx` | Add mobile detection, Sheet drawer, responsive main padding |
| `src/pages/admin/Dashboard.tsx` | Update stat card grid breakpoints |
| `src/pages/admin/SeedData.tsx` | Responsive stat grid, scrollable tabs, stacked buttons on mobile |

## Technical Approach

### AdminLayout.tsx Key Changes

1. Import `useIsMobile` hook and Sheet component
2. Add `isOpen` state for mobile drawer
3. Conditionally render:
   - Mobile: Fixed header with hamburger + Sheet with nav items
   - Desktop: Current sidebar implementation
4. Update main content padding to be responsive

### SeedData.tsx TabsList Solution

Replace grid-based tabs with scrollable horizontal tabs:

```tsx
<TabsList className="flex w-full overflow-x-auto no-scrollbar">
  <TabsTrigger value="manufacturers" className="flex-shrink-0">
    Manufacturers
  </TabsTrigger>
  {/* ... other triggers with flex-shrink-0 */}
</TabsList>
```

Add CSS utility if needed:
```css
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
```

## Expected Outcome

After implementation:
- Admin dashboard is fully usable on mobile devices
- No visual overlap between navigation and content
- Stat cards and tabs are readable and tappable on mobile
- Smooth transition between mobile drawer and desktop sidebar
- Maintains desktop experience unchanged
