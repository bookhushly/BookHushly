# Bookhushly — Developer Debug & Workflow Reference

> Generated: 2026-03-17
> This document explains every AI and platform feature built in this sprint, how each piece fits together, and exactly where to look when something breaks.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Database Tables](#2-database-tables)
3. [AI Feature Flag System](#3-ai-feature-flag-system)
4. [AI Usage Tracking](#4-ai-usage-tracking)
5. [Admin AI Settings Page](#5-admin-ai-settings-page)
6. [Admin AI Analytics Dashboard](#6-admin-ai-analytics-dashboard)
7. [Smart Listing Generator](#7-smart-listing-generator)
8. [Review Summarizer (AI)](#8-review-summarizer-ai)
9. [Reviews & Ratings System](#9-reviews--ratings-system)
10. [Guided Quote Assistant](#10-guided-quote-assistant)
11. [Vendor Analytics Insights](#11-vendor-analytics-insights)
12. [Natural Language Search](#12-natural-language-search)
13. [AI-Assisted Quote Drafting](#13-ai-assisted-quote-drafting)
14. [Save / Favourites System](#14-save--favourites-system)
15. [Common Failure Patterns](#15-common-failure-patterns)

---

## 1. Architecture Overview

```
Browser (Next.js App Router)
  │
  ├── Client Components  → hooks/ → /api/* (Next.js Route Handlers)
  │                                     │
  │                                     ├── Supabase (PostgreSQL + Auth + RLS)
  │                                     └── Anthropic Claude API (claude-haiku-4-5-20251001)
  │
  └── Server Components  → Supabase server client (cookies-based session)
```

**Key packages:**
- `@supabase/ssr` — server-side Supabase client with cookie auth
- `@supabase/supabase-js` — browser Supabase client
- `@tanstack/react-query` — client-side data fetching and caching
- `@anthropic-ai/sdk` — Claude API calls (all via server-side route handlers only)
- `sonner` — toast notifications

**Claude model used everywhere:** `claude-haiku-4-5-20251001`

---

## 2. Database Tables

All tables live in Supabase PostgreSQL. Migration files are in `supabase/migrations/`.

### `ai_feature_settings`
```sql
feature_key TEXT PRIMARY KEY  -- 'support_chat' | 'listing_generator' | 'review_summarizer'
                               -- | 'quote_assistant' | 'vendor_insights'
                               -- | 'natural_language_search' | 'quote_drafting'
feature_name TEXT
enabled      BOOLEAN DEFAULT true
updated_at   TIMESTAMPTZ
updated_by   UUID (admin user id)
```
**RLS:** Public can `SELECT`. Only `role = 'admin'` users can `UPDATE`.

### `ai_feature_usage`
```sql
id          UUID PRIMARY KEY
feature_key TEXT
user_id     UUID (nullable — anonymous tracking allowed)
created_at  TIMESTAMPTZ DEFAULT now()
```
**RLS:** Anyone can `INSERT` (anonymous tracking). Only admins can `SELECT`.

### `reviews`
```sql
id               UUID PRIMARY KEY
user_id          UUID REFERENCES users(id)
listing_id       UUID
listing_type     TEXT -- 'hotel' | 'apartment' | 'event' | 'listing'
customer_name    TEXT
rating           INTEGER 1-5
comment          TEXT
verified_booking BOOLEAN DEFAULT false
created_at       TIMESTAMPTZ
UNIQUE(user_id, listing_id, listing_type)  -- one review per user per listing
```
**RLS:** Anyone can `SELECT`. Users can only insert their own row.

### `saved_listings`
```sql
id               UUID PRIMARY KEY
user_id          UUID REFERENCES users(id)
listing_id       UUID
listing_type     TEXT -- 'hotel' | 'apartment' | 'event' | 'listing'
listing_title    TEXT
listing_image    TEXT
listing_location TEXT
created_at       TIMESTAMPTZ
UNIQUE(user_id, listing_id, listing_type)
```
**RLS:** Users own all their rows (SELECT, INSERT, DELETE scoped to `auth.uid() = user_id`).

---

## 3. AI Feature Flag System

**Purpose:** Admin can disable any AI feature from the settings UI. Disabled features return HTTP 403 to the API caller, which causes the UI to silently hide the AI component.

**Core files:**
- `lib/ai-settings.js` — helper functions used by admin settings UI
- Each AI route handler — reads the flag directly from Supabase inline

### Flow
```
Admin toggles switch in UI
  → PUT /api/admin/ai-settings { feature_key, enabled }
  → Updates ai_feature_settings row in Supabase
  → Next API call to that feature reads the row → returns 403 if disabled
  → Frontend component receives 403 → hides AI UI silently
```

### Fail-open design
`lib/ai-settings.js:getAIFeatureMap()` has hardcoded DEFAULTS (all `true`). If Supabase is unreachable on the **client side** (admin settings hook), all features appear enabled. This prevents a DB outage from locking the admin out.

On the **server side** (route handlers), each route does its own check. If the DB query throws, the feature proceeds (fail-open pattern — the try/catch returns the error result which evaluates as "enabled").

### Debug: Feature toggle not working
1. Check `ai_feature_settings` table — is the row `enabled = false`?
2. Check browser network tab — is the feature's API returning 403?
3. Check the feature's frontend component — does it handle 403 gracefully?
4. Check RLS on `ai_feature_settings` — public must be able to SELECT.

---

## 4. AI Usage Tracking

**File:** `lib/track-ai-usage.js`

```js
export async function trackAIUsage(featureKey, userId)
```

- Inserts one row into `ai_feature_usage` per AI call
- Uses the **server** Supabase client (called only from route handlers)
- Wrapped in silent try/catch — **never throws, never breaks features**
- Called after every successful Claude response in every AI route

### Debug: Usage counts not appearing in analytics
1. Check `ai_feature_usage` table directly in Supabase
2. Verify `trackAIUsage` is being called after successful Claude response (not before)
3. Check RLS on `ai_feature_usage` — INSERT must be allowed without auth
4. Check that the analytics route is querying the correct date window (`?days=30`)

---

## 5. Admin AI Settings Page

**URL:** `/admin/dashboard/settings`

**Files:**
- `app/(admin)/admin/dashboard/settings/page.jsx` — full settings UI
- `app/api/admin/ai-settings/route.js` — GET all + PUT single
- `hooks/use-ai-settings.js` — React Query hook with optimistic toggle
- `components/shared/admin/sidebar.jsx` — "AI Settings" nav item

### Auth
Route handler checks `users.role === 'admin'`. If not admin → 401.

### Debug: Toggle not saving
1. Check browser network tab — is PUT returning 200?
2. Check Supabase `users` table — does the admin user have `role = 'admin'`?
3. Check `ai_feature_settings` RLS — only `role = 'admin'` can UPDATE
4. Check `hooks/use-ai-settings.js` — invalidates `["ai-features"]` query on mutation

---

## 6. Admin AI Analytics Dashboard

**URL:** `/admin/dashboard/ai-analytics`

**Files:**
- `app/(admin)/admin/dashboard/ai-analytics/page.jsx` — charts UI
- `app/api/admin/ai-analytics/route.js` — GET stats
- `hooks/use-ai-analytics.js` — React Query hook

### What it computes (in-memory, not SQL aggregations)
- Per-feature: total calls, unique users, calls today, calls this week
- Daily trend array for the line chart
- Summary: total calls, unique users, most-used feature

**Query param:** `?days=7|30|90` (default 30)

### Debug: Charts showing zeros
1. Check `ai_feature_usage` has rows (use Supabase Studio)
2. Verify dates — the `created_at` column must be in UTC; the route filters `>= NOW() - INTERVAL '30 days'`
3. Check admin auth — route returns 401 for non-admins which causes the hook to fail silently
4. Check browser console for React Query errors

---

## 7. Smart Listing Generator

**URL:** Vendor listing create/edit forms

**Files:**
- `app/api/vendor/generate-listing/route.js` — Claude API call
- `components/shared/listings/AIGenerateButton.jsx` — purple UI button
- `components/shared/listings/create/ServiceDetails.jsx` — new listings
- `app/(vendor)/vendor/dashboard/listings/[id]/page.jsx` — edit listing

### Auth
Requires login. Uses the authenticated user's session. Returns 401 if not logged in.

### Flow
```
Vendor fills some fields → clicks "Generate with AI"
  → AIGenerateButton sends POST /api/vendor/generate-listing
  → Route checks: feature enabled? user logged in?
  → Builds context from filled fields + optional hint
  → Claude returns {"title":"...","description":"..."}
  → onGenerated() fills title (if empty) + description fields
```

### Debug: Generation returns blank or error
1. Check feature flag: `listing_generator` enabled in `ai_feature_settings`?
2. Check Anthropic API key — set as `ANTHROPIC_API_KEY` in env
3. Check the regex: `raw.match(/\{[\s\S]*\}/)` — if Claude wraps in markdown fences, the match fails. Workaround: check raw response in server logs
4. Check vendor auth — route requires `user` from `supabase.auth.getUser()`

---

## 8. Review Summarizer (AI)

**Files:**
- `app/api/reviews/summarize/route.js` — Claude summary generation
- `components/shared/reviews/ReviewSummary.jsx` — summary display card

### Requirements
- Minimum **3 reviews** required. With fewer, the component renders nothing.
- Feature flag: `review_summarizer`
- No auth required (works for anonymous visitors too)

### Flow
```
ReviewSection mounts → ReviewSummary fetches /api/reviews/{id}?type=hotel
  → If ≥3 reviews exist → POST /api/reviews/summarize { listingId, listingType, reviews }
  → Claude returns { pros[], cons[], summary }
  → Displayed as AI summary card with pros/cons list
```

### Debug: Summary not appearing
1. Are there ≥3 reviews for this listing in the `reviews` table?
2. Is `review_summarizer` enabled in `ai_feature_settings`?
3. Check browser network tab — is POST /api/reviews/summarize returning 200?
4. Check `ReviewSummary.jsx` — errors are silently swallowed and component returns `null`

---

## 9. Reviews & Ratings System

**Files:**
- `app/api/reviews/[listingId]/route.js` — GET (public) + POST (auth required)
- `components/shared/reviews/ReviewSection.jsx` — wrapper: summary + list + form
- `components/shared/reviews/review-list.jsx` — display reviews + stats
- `components/shared/reviews/review-form.jsx` — submit form
- `supabase/migrations/reviews.sql` — table definition

### `ReviewSection` replaces the old `ReviewSummary + ReviewList` combo
Drop it in any listing page like this:
```jsx
<ReviewSection listingId={hotel.id} listingType="hotel" listingTitle={hotel.name} />
```

### Verified Booking logic (POST /api/reviews/[listingId])
The route checks the relevant bookings table based on `listing_type`:
- `hotel` → queries `hotel_bookings` for `booking_status IN (confirmed, completed, checked_out)`
- `apartment` → queries `apartment_bookings` for `booking_status IN (confirmed, completed, checked_out)`
- `event` → queries `event_bookings` for `status IN (confirmed, completed)`

If a matching booking is found → `verified_booking = true`.
If no booking found → review is still saved, but `verified_booking = false`.

**One review per user per listing** — enforced by UNIQUE constraint + 409 response.

### Debug: Review not submitting
1. Check user is logged in — POST requires auth (401 if not)
2. Check for duplicate review — UNIQUE(user_id, listing_id, listing_type) — returns 409
3. Check `users.full_name` column exists — used for `customer_name`
4. Check RLS on `reviews` — users should be able to INSERT their own rows

### Debug: `verified_booking` always false
1. Check `hotel_bookings.hotel_id` — is the column named `hotel_id` or `listing_id`?
2. Check `hotel_bookings.customer_id` — is it `customer_id` or `user_id`?
3. Adjust the column names in `app/api/reviews/[listingId]/route.js` POST handler if schema differs

---

## 10. Guided Quote Assistant

**Files:**
- `app/api/quotes/ai-assistant/route.js` — conversation handler
- `components/shared/services/QuoteAssistant.jsx` — chat UI
- `components/shared/services/logistics-questionnaire.jsx` — integrated
- `components/shared/services/security-questionnaire.jsx` — integrated

### Flow
```
User clicks "Use AI Assistant"
  → QuoteAssistant mounts → sends initial message on mount
  → User and Claude exchange messages via POST /api/quotes/ai-assistant
  → Claude collects all required fields one by one
  → When all fields gathered, Claude outputs: READY_TO_SUBMIT\n{...json...}
  → Route parses this → returns { isComplete: true, formData: {...} }
  → onFormData(data) fills questionnaire state + skips to confirmation step
```

### Completion detection
The route looks for `READY_TO_SUBMIT` as a literal string prefix in Claude's response. The JSON following it is extracted and returned as `formData`.

### Debug: Form never auto-fills / isComplete never true
1. Check Claude's raw response in server logs — is `READY_TO_SUBMIT` present?
2. Check the system prompt in the route — does it include `READY_TO_SUBMIT` as the signal?
3. Check feature flag: `quote_assistant` enabled?
4. Check the questionnaire component — does `onFormData` handler call `setStep(5)` and `setAiMode(false)`?

---

## 11. Vendor Analytics Insights

**Files:**
- `app/api/vendor/ai-insights/route.js` — Claude insight generation
- `components/shared/dashboard/vendor/VendorInsightsPanel.jsx` — display panel
- `app/(vendor)/vendor/dashboard/analytics/page.jsx` — integration point

### Flow
```
VendorInsightsPanel mounts (or range changes)
  → Only fires if totalBookings > 0
  → POST /api/vendor/ai-insights { analytics, range }
  → Claude returns { insights: ["...", "...", "..."] }
  → Displayed as 3 bullet points with Lightbulb icon
```

### Debug: Insights not loading
1. Check `totalBookings > 0` — panel won't fire with no bookings
2. Check feature flag: `vendor_insights` enabled?
3. Check vendor auth — route requires logged-in vendor user
4. Check analytics prop shape — must include `growth`, `totalBookings`, `byService`, `statusBreakdown`, `timeline`

---

## 12. Natural Language Search

**Files:**
- `app/api/search/parse-query/route.js` — Claude NL parser
- `app/(user)/search/page.jsx` — search page with NL input

### Flow
```
User types natural query (e.g. "cheap hotel in Lagos under 50k")
  → Presses Enter or clicks AI Search button (Sparkles icon)
  → POST /api/search/parse-query { query }
  → Claude extracts { category, location, priceRange, rating, summary }
  → These are merged into existing filter state
  → Existing useEffect watching filter state fires performSearch()
  → NL summary chip appears showing what was understood
```

### Filter values Claude maps to
- `category`: `"all" | "hotels" | "serviced_apartments" | "events" | "logistics" | "security"`
- `location`: `"all" | "Lagos" | "Abuja" | "Port Harcourt" | "Kano" | "Ibadan"`
- `priceRange`: `"all" | "0-50000" | "50000-150000" | "150000-500000" | "500000+"`

### Debug: NL search not filtering
1. Check feature flag: `natural_language_search` enabled?
2. Check browser network — is POST /api/search/parse-query returning 200?
3. Check the parsed result in network response — are the values in the exact format above?
4. Check `parseNaturalLanguage()` in `search/page.jsx` — does it call `setFilters()`?

---

## 13. AI-Assisted Quote Drafting

**Files:**
- `app/api/admin/draft-quote/route.js` — Claude pricing draft
- `app/(admin)/admin/dashboard/logistics-requests/page.jsx` — integrated
- `app/(admin)/admin/dashboard/security-requests/page.jsx` — integrated

### Auth
Admin-only. Returns 401 (not authed) or 403 (not admin).

### Flow
```
Admin opens quote form for a request → clicks "AI Draft" (Sparkles button)
  → POST /api/admin/draft-quote { serviceType, requestData }
  → Claude generates { base_amount, breakdown, admin_notes, valid_until }
  → quoteForm state is populated with the draft values
  → Admin reviews and adjusts before submitting the actual quote
```

### Debug: AI Draft button does nothing
1. Check feature flag: `quote_drafting` enabled?
2. Check admin role — route returns 403 for non-admin
3. Check Anthropic API key
4. Check `aiDrafting` state and loading indicator — button disables during request

---

## 14. Save / Favourites System

**Files:**
- `app/api/saved-listings/route.js` — GET (fetch all) + POST (toggle)
- `hooks/use-saved-listing.js` — per-listing hook (optimistic UI)
- `app/(dashboard)/dashboard/customer/favorites/page.jsx` — full favourites page
- `components/shared/customer/sidebar.jsx` — "Favorites" nav item (already present)

### Per-listing Heart button pattern
```jsx
const { saved: isSaved, toggle: toggleSave } = useSavedListing(
  hotel.id, "hotel",
  { title: hotel.name, image: hotel.image_urls?.[0], location: hotel.city }
);

<button onClick={toggleSave}>
  <Heart className={isSaved ? "fill-red-500 text-red-500" : ""} />
</button>
```

### Hook behaviour
1. On mount: fetches `/api/saved-listings` (GET all) and checks if this `listingId + listingType` is in the list
2. On `toggle()`: optimistically flips the heart, then POSTs to `/api/saved-listings`
3. On POST failure: reverts the optimistic update

### Favourites page
- Uses React Query `["saved-listings"]` query key
- After unsave mutation, invalidates the query to refetch
- Tab filter (All / Hotels / Apartments / Events) is client-side only

### Debug: Heart not saving
1. Check user is logged in — both GET and POST require auth (401 if not)
2. Check `saved_listings` RLS — user must have INSERT + DELETE on their own rows
3. Check the hook's `checked` state — it only fetches once on mount
4. Check the UNIQUE constraint — duplicate save attempt returns Supabase error (handled gracefully)

---

## 15. Common Failure Patterns

### Claude API errors
| Error | Likely cause |
|---|---|
| `401 Unauthorized` from Claude | `ANTHROPIC_API_KEY` env var missing or wrong |
| `429 Rate limit` | Too many concurrent requests — add retry logic if needed |
| JSON parse fails after regex | Claude wrapped response in markdown code fences; strip ` ```json ` before parsing |
| Empty `data.title` / `data.description` | Claude returned invalid JSON; check the raw `text` block in server logs |

### Supabase errors
| Error | Likely cause |
|---|---|
| `401` from any API route | User session expired — `supabase.auth.getUser()` returned null |
| RLS policy violation | User trying to read/write a row they don't own |
| `duplicate key value` | UNIQUE constraint hit — check the 409 handler |
| `column does not exist` | Migration not run yet — run `supabase/migrations/*.sql` in Supabase Studio |

### Feature flag 403s
If an AI feature suddenly stops working (UI silently hides), check:
1. `ai_feature_settings` table — `enabled` column for the feature
2. Admin Settings page `/admin/dashboard/settings` — toggle it back on

### Environment variables needed
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # if used for server-side admin operations
ANTHROPIC_API_KEY=           # required for all AI features
```

---

## Quick Reference: Which File Does What

| Feature | Route Handler | UI Component | Hook |
|---|---|---|---|
| AI Settings | `/api/admin/ai-settings` | `settings/page.jsx` | `hooks/use-ai-settings.js` |
| AI Analytics | `/api/admin/ai-analytics` | `ai-analytics/page.jsx` | `hooks/use-ai-analytics.js` |
| Listing Generator | `/api/vendor/generate-listing` | `AIGenerateButton.jsx` | inline fetch |
| Review Summarizer | `/api/reviews/summarize` | `ReviewSummary.jsx` | inline fetch |
| Reviews (CRUD) | `/api/reviews/[listingId]` | `ReviewSection.jsx`, `review-form.jsx`, `review-list.jsx` | inline fetch |
| Quote Assistant | `/api/quotes/ai-assistant` | `QuoteAssistant.jsx` | inline fetch |
| Vendor Insights | `/api/vendor/ai-insights` | `VendorInsightsPanel.jsx` | inline fetch |
| NL Search | `/api/search/parse-query` | `search/page.jsx` | inline fetch |
| Quote Drafting | `/api/admin/draft-quote` | `logistics-requests/page.jsx`, `security-requests/page.jsx` | inline fetch |
| Save/Favourites | `/api/saved-listings` | `favorites/page.jsx`, Heart buttons in listing pages | `hooks/use-saved-listing.js` |
| Usage Tracking | n/a (server utility) | n/a | `lib/track-ai-usage.js` |
| Feature Flags | n/a (inline per route) | n/a | `lib/ai-settings.js` |
