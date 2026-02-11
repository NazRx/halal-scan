

# Admin Blog Management

## Overview
Create a `blog_posts` database table and an admin page at `/admin/blog` for full CRUD (create, edit, delete) on blog posts. Update the public `/blog` and `/blog/:slug` pages to read from the database instead of hardcoded data.

## Database

**New table: `blog_posts`**

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, default `gen_random_uuid()` |
| title | text | NOT NULL |
| slug | text | NOT NULL, UNIQUE |
| excerpt | text | Short summary for card display |
| content | text | Full markdown/plain text body |
| status | text | `draft` or `published`, default `draft` |
| author | text | Optional author name |
| created_at | timestamptz | default `now()` |
| updated_at | timestamptz | default `now()`, auto-updated via trigger |

**RLS policies:**
- Anyone can SELECT where `status = 'published'`
- Admins can ALL (uses existing `is_admin()` function)

**Trigger:** Reuse existing `update_updated_at_column` function.

## Admin Page: `/admin/blog`

**File:** `src/pages/admin/BlogManagement.tsx`

- Table listing all posts (title, status, date, actions)
- "New Post" button opens a dialog/form with fields: Title, Slug (auto-generated from title, editable), Excerpt, Content (textarea), Status (draft/published)
- Edit button opens same form pre-filled
- Delete button with confirmation dialog
- Uses Supabase client for all CRUD operations

## Routing & Navigation

**`src/App.tsx`** -- Add route:
```
<Route path="blog" element={<BlogManagement />} />
```

**`src/pages/admin/AdminLayout.tsx`** -- Add nav item:
```
{ title: 'Blog', href: '/admin/blog', icon: FileText }
```

## Public Pages Update

**`src/pages/Blog.tsx`** -- Fetch published posts from `blog_posts` table instead of hardcoded array. Show excerpt on cards.

**`src/pages/BlogPost.tsx`** -- Fetch single post by slug from `blog_posts`. Display full content. Show "Coming soon" fallback if not found.

## Files to Create
- `src/pages/admin/BlogManagement.tsx`

## Files to Modify
- `src/pages/admin/AdminLayout.tsx` -- add Blog nav item
- `src/App.tsx` -- add admin blog route
- `src/pages/Blog.tsx` -- fetch from database
- `src/pages/BlogPost.tsx` -- fetch from database

## Migration
- Create `blog_posts` table with RLS policies and trigger
- Seed the 4 existing placeholder posts so existing links don't break

