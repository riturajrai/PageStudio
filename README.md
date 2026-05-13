# Page Studio

A schema-driven, CMS-backed landing page builder built with Next.js, Redux Toolkit, and Contentful.

---

## Live Demo

- **Studio:** `/studio/demo`
- **Preview:** `/preview/demo`

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
│                                                         │
│   /studio/[slug]              /preview/[slug]           │
│   StudioPage (Client)         PreviewClient (Client)    │
│        │                            │                   │
│        ▼                            ▼                   │
│   Redux Store ──────────────► Renderer.tsx              │
│   (draftPage slice)               │                     │
│        │                          ▼                     │
│        │                   sectionRegistry.tsx          │
│        │                   HeroSection                  │
│        │                   CTASection                   │
│        │                   TestimonialSection           │
│        │                   TextSliderSection            │
│        │                   FooterSection                │
│        │                   UnsupportedSection           │
└────────┼──────────────────────────────────────────────-─┘
         │
         ▼ (Server Side)
┌─────────────────────────────────────────────────────────┐
│              Contentful CMS                             │
│   contentfulClient.ts (Adapter)                         │
│   - Delivery API (published content)                    │
│   - Preview API (draft content)                         │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│              /api/publish (Route Handler)               │
│   - SemVer diff logic                                   │
│   - Immutable snapshot → releases/<slug>/<version>.json │
│   - Idempotent (hash check)                             │
└─────────────────────────────────────────────────────────┘
```

---

## Folder Structure

```
src/
├── app/
│   ├── api/publish/route.ts       # Publish API + SemVer logic
│   ├── preview/[slug]/
│   │   ├── page.tsx               # Preview route entry
│   │   └── PreviewClient.tsx      # Client component (reads Redux)
│   ├── studio/[slug]/page.tsx     # Studio editor (WYSIWYG-lite)
│   ├── layout.tsx                 # Root layout with ReduxProvider
│   └── page.tsx                   # Homepage
│
├── components/
│   ├── Renderer.tsx               # Schema-driven section renderer
│   └── ui/                        # shadcn/ui components
│
├── sections/
│   ├── HeroSection.tsx
│   ├── CTASection.tsx
│   ├── TestimonialSection.tsx
│   ├── TextSliderSection.tsx
│   ├── FooterSection.tsx
│   └── UnsupportedSection.tsx     # Fallback for unknown types
│
├── registry/
│   └── sectionRegistry.tsx        # Single source of truth for sections
│
├── schemas/
│   └── pageSchema.ts              # Zod validation schemas
│
├── redux/
│   ├── store.ts                   # Redux store + redux-persist config
│   └── slices/
│       ├── draftPageSlice.ts      # Page editing state
│       ├── uiSlice.ts             # UI state (sidebar, selected section)
│       └── publishSlice.ts        # Publish flow state
│
├── adapters/
│   └── contentfulClient.ts        # Contentful API adapter
│
├── providers/
│   └── ReduxProvider.tsx          # Client-side Redux + PersistGate
│
├── types/
│   └── page.ts                    # TypeScript types
│
└── middleware.ts                  # RBAC route protection

releases/                          # Immutable publish snapshots
  demo.json
  homepage.json
```

---

## Redux Slice Responsibilities

### 1. `draftPageSlice`
Manages the current page being edited in the studio.

| Action | Description |
|--------|-------------|
| `loadDraft(page)` | Load a page (from Contentful or default) into the editor |
| `addSection(type)` | Add a new section of given type to the page |
| `removeSection(id)` | Remove a section by ID |
| `reorderSections(sections[])` | Reorder sections (drag & drop) |
| `updateSectionProps(id, props)` | Update props of a specific section |
| `setPageTitle(title)` | Update the page title |

**State shape:**
```typescript
{
  pageId: string
  slug: string
  title: string
  sections: Section[]
  isDirty: boolean   // true = unsaved changes exist
}
```

**Persisted:** Yes — via `redux-persist` to `localStorage`. Draft survives page reload.

---

### 2. `uiSlice`
Manages studio UI state (no business logic).

| Action | Description |
|--------|-------------|
| `setSelectedSectionId(id)` | Track which section is being edited |
| `setSidebarOpen(bool)` | Toggle sidebar open/closed |

---

### 3. `publishSlice`
Tracks publish flow state in the UI.

| Action | Description |
|--------|-------------|
| `setPublishing(bool)` | Loading state during publish API call |
| `setLastPublished(snapshot)` | Store last published version info |
| `clearPublishStatus()` | Reset publish status |

---

## Contentful Model + Adapter Explanation

### Content Model in Contentful

**Content Type: `page`**

| Field | Field ID | Type | Required |
|-------|----------|------|----------|
| Title | `title` | Short text | Yes |
| Slug | `slug` | Short text | Yes |
| Sections | `sections` | References (array) | Yes |

### How the Adapter Works

**File:** `src/adapters/contentfulClient.ts`

Two Contentful clients are created:

```typescript
// Published content (production)
const client = createClient({
  space: CONTENTFUL_SPACE_ID,
  accessToken: CONTENTFUL_ACCESS_TOKEN,
});

// Draft content (preview mode)
const previewClient = createClient({
  space: CONTENTFUL_SPACE_ID,
  accessToken: CONTENTFUL_PREVIEW_TOKEN,
  host: 'preview.contentful.com',
});
```

The `getPageBySlug(slug, preview?)` function:
1. Selects the correct client based on `preview` flag
2. Fetches the page entry by slug
3. Transforms the raw Contentful response into a clean `PageData` shape
4. No Contentful-specific types leak into UI components

**Environment switching is fully isolated** — UI components never import from `contentful` directly.

---

## Publish + SemVer Logic

### How It Works

When "Publish" is clicked in the studio:

1. Current draft (sections + title) is sent to `POST /api/publish`
2. The API computes a **SHA-256 hash** of the draft
3. Hash is compared to the latest published version

**If hash matches** → Idempotent — same content, skip (no new version created)

**If hash differs** → Diff is computed:

### SemVer Rules

| Change | Version Bump | Example |
|--------|-------------|---------|
| Text / prop value changed | **Patch** | `1.0.0` → `1.0.1` |
| Section added / optional prop added | **Minor** | `1.0.0` → `1.1.0` |
| Section removed / type changed | **Major** | `1.0.0` → `2.0.0` |

### Snapshot Storage

Each publish creates an immutable JSON snapshot:

```
releases/
  demo.json   ← array of all versions for slug "demo"
```

```json
[
  {
    "version": "1.0.0",
    "hash": "abc123...",
    "publishedAt": "2026-05-13T10:00:00.000Z",
    "slug": "demo",
    "title": "Landing Page",
    "sections": [...],
    "changelog": "Initial release v1.0.0"
  },
  {
    "version": "1.0.1",
    "hash": "def456...",
    "publishedAt": "2026-05-13T11:00:00.000Z",
    "changelog": "Updated from v1.0.0 to v1.0.1"
  }
]
```

---

## RBAC (Role-Based Access Control)

Three roles are defined:

| Role | `/preview` | `/studio` | `/api/publish` |
|------|-----------|-----------|----------------|
| `viewer` | ✅ | ❌ Redirect | ❌ 403 |
| `editor` | ✅ | ✅ | ❌ 403 |
| `publisher` | ✅ | ✅ | ✅ |

**Route protection** is enforced in `src/middleware.ts` — server-side, not just UI.

**Publish endpoint** checks `x-user-role` header and returns `403 Forbidden` for non-publishers.

---

## Schema-Driven Renderer

### How It Works

```
Section data (type + props)
         │
         ▼
sectionRegistry.tsx
         │
         ├── "hero"        → HeroSection
         ├── "cta"         → CTASection
         ├── "testimonial" → TestimonialSection
         ├── "textSlider"  → TextSliderSection
         ├── "footer"      → FooterSection
         └── unknown type  → UnsupportedSection (fallback)
         │
         ▼
Renderer.tsx renders the component with section.props spread
```

### Zod Validation

All page data is validated against `pageSchema` before rendering:

```typescript
const result = pageSchema.safeParse(rawData);
if (!result.success) {
  // Show error UI — app does NOT crash
}
```

Invalid Contentful data never reaches the renderer.

---


Drag & Drop Reordering

Page Studio uses @dnd-kit for drag-and-drop section reordering.

useSortable() makes sections draggable
DndContext manages drag events
SortableContext tracks section order
arrayMove() updates the new order
Redux instantly updates the live preview
Drag Flow
Drag Section
   ↓
handleDragEnd()
   ↓
arrayMove()
   ↓
Redux State Update
   ↓
Live Preview Refresh
Dependency
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

## Accessibility (WCAG 2.2 AAA-Oriented)

### Implemented

- All interactive elements have visible focus states via Tailwind `focus:ring` classes
- Semantic HTML used throughout (`<section>`, `<main>`, `<footer>`, `<h1>`–`<h3>`)
- Logical heading hierarchy in all section components
- `aria-label` on icon-only buttons
- Color contrast meets WCAG AA minimum
- Keyboard navigation works across studio sidebar and preview
- `prefers-reduced-motion` respected in TextSlider (autoPlay disabled when reduced motion preferred)

### Accessibility in TextSliderSection
```typescript
// Respects prefers-reduced-motion
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (autoPlay && !prefersReduced) { ... }
```

---

## Environment Setup

```env
# .env.local
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_ACCESS_TOKEN=your_delivery_token
CONTENTFUL_PREVIEW_TOKEN=your_preview_token
CONTENTFUL_ENVIRONMENT=master
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npx playwright test
```

---

## What Is Incomplete and Why

| Feature | Status | Reason |
|---------|--------|--------|
| Contentful real page entries | Partial | Contentful content types created; sample entries needed |
| Drag & drop reorder | Not done | Would require @dnd-kit integration; time constraint |
| featureGrid section | Not done | Section type defined in schema but component not built |
| Playwright + axe tests | Not done | CI infrastructure ready; test files need writing |
| GitHub Actions CI | Not done | Workflow file needs to be added to `.github/workflows/` |
| Vercel deployment | Not done | Environment variables need to be configured in Vercel dashboard |
| Full AAA contrast audit | Partial | AA compliance implemented; AAA requires manual audit |

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| Next.js 15 (App Router) | Framework |
| TypeScript | Type safety |
| Redux Toolkit + redux-persist | State management |
| Contentful | CMS / content source |
| Zod | Schema validation |
| Tailwind CSS | Styling |
| shadcn/ui | UI components |
| lucide-react | Icons |
| Playwright + axe | E2E + accessibility testing |
| GitHub Actions | CI/CD |
| Vercel | Deployment |