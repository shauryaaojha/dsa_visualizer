# DS_Visualizer — Architecture & Developer Guide

> An interactive, fully-animated Data Structures & Algorithms visualizer.
> "Ember & Coral" design. Next.js 14 (App Router) · TypeScript · Tailwind ·
> framer-motion · zustand · MongoDB.

This document is the **source of truth** for how the project is structured and
how to extend it. Read it before adding any topic.

---

## 1. Core principle: routes mirror the folder structure

The entire curriculum lives under [`app/topics/`](app/topics). Because we use the
Next.js **App Router**, every folder is automatically a URL segment. We do **not**
hand-roll a router or a slug table — the folder tree *is* the navigation.

```
app/topics/arrays/searching/binary-search/page.tsx
        └────────────── URL ──────────────┘
   /topics/arrays/searching/binary-search
```

**Rule:** never delete or rename a curriculum folder to change a route. The
folder tree is the canonical map of the whole product.

---

## 2. Navigation model: nested hubs → leaf

Navigation is a drill-down through hub pages until you reach a *leaf* (an actual
visualizer). Every non-leaf folder gets a **hub page** that lists its immediate
children as cards; every leaf folder gets a **visualizer page**.

```
/                         Landing       → grid of TOP-LEVEL topics
/topics/arrays            Topic hub      → categories: Basic Ops, Searching,
                                            Sorting, Advanced, Matrix
/topics/arrays/searching  Category hub   → Linear Search, Binary Search
/topics/arrays/searching/linear-search   LEAF → the visualizer
```

So clicking **Arrays** on the landing page shows the category options; picking a
category shows its leaves; picking a leaf opens the animated visualizer. The
breadcrumb is derived from the path.

### Page kinds

| Folder kind | File              | Renders                                    |
| ----------- | ----------------- | ------------------------------------------ |
| Top level   | `app/page.tsx`    | Landing: cards for each top-level topic    |
| Hub         | `<folder>/page.tsx` | `<TopicHub>` listing child folders as cards |
| Leaf        | `<leaf>/page.tsx` | A visualizer screen pre-configured for the op |

---

## 3. The curriculum tree (top level)

All sections live under `app/topics/`. **Arrays is being built first**, then
Foundations, then the rest — one section at a time.

```
topics/
├── foundations/        asymptotic-analysis, complexity-analysis,
│                       amortized-analysis, mathematical-foundations
├── arrays/             ← BUILDING NOW
│   ├── basic-operations/   traversal, insertion, deletion, updating
│   ├── searching/          linear-search, binary-search
│   ├── sorting/            bubble, selection, insertion, merge, quick
│   ├── advanced-array/     prefix-sum, sliding-window, two-pointer
│   └── matrix/             traversal, rotation, multiplication, sparse-matrix
├── linked-list/        singly, doubly, circular, applications
├── stacks/             array-impl, linked-list-impl, applications
├── queues/             simple, circular, deque, priority-queue
├── trees/              binary-tree, BST, AVL, heaps, trie
├── graphs/             representation, traversal, shortest-path, MST, connectivity
├── hashing/            hash-table, collision-resolution
└── strings/            basic-operations, pattern-matching
```

(See the folders themselves for the full leaf list — the tree is authoritative.)

---

## 4. How a visualizer works (the engine → step → player pattern)

This is the heart of the app. Keep it consistent across every data structure.

1. **Engine** (`engines/*.ts`) — *pure functions*, no React. An engine compiles a
   user operation into an `AnimationProgram`: a flat, deterministic list of
   `AnimationStep` frames. Each frame is a full snapshot (structure state +
   highlights + pointers + a narration sentence + which pseudo-code line is
   live). Pure + deterministic ⇒ replayable and scrubbable.

2. **Player store** (`lib/*Store.ts`, zustand) — holds the base data, the
   compiled program, and the playback cursor. Drives play/pause/step/speed.

3. **Renderer** (`components/visualizer/*`) — dumb. Reads the *current* frame and
   draws it. framer-motion animates elements by their stable `id`, so
   insert/delete/swap *move* instead of snapping.

Types live in [`types/visualization.ts`](types/visualization.ts).

```
user op ──> engine.run() ──> AnimationProgram ──> store(player) ──> canvas
            (pure)            (frames)             (cursor)         (draws frame)
```

---

## 5. How to add a new leaf (the only repetitive task)

Leaf pages are tiny — all the heavy lifting is shared. To add one:

1. Make sure the operation exists in the relevant engine (add it if not).
2. Create `<leaf>/page.tsx` that renders the shared visualizer screen with a
   config object: `{ operation, title, blurb, defaultData, defaultParams }`.

```tsx
// app/topics/arrays/searching/binary-search/page.tsx
import { ArrayVisualizerScreen } from "@/components/visualizer/ArrayVisualizerScreen";

export default function Page() {
  return (
    <ArrayVisualizerScreen
      operation="binarySearch"
      title="Binary Search"
      blurb="Halve a sorted range each step — O(log n)."
      defaultData={[2, 5, 8, 12, 16, 23, 38, 56, 72, 91]}
      defaultParams={{ value: 23 }}
    />
  );
}
```

Hub pages are equally small — they render `<TopicHub>` with the list of child
cards (title, blurb, icon, href). Hrefs are just the child folder paths.

---

## 6. Directory map (code, not curriculum)

```
app/
  page.tsx                 Landing
  topics/**/page.tsx       Hub + leaf pages (mirror curriculum)
  api/presets/route.ts     MongoDB-backed presets
components/
  layout/                  AppShell, Navbar, Sidebar, ShaderBackground
  visualizer/              Canvas, Controls, InstructorNotes, *VisualizerScreen
  ui/                      Icon and shared primitives
  topic/                   TopicHub, TopicCard, Breadcrumb (navigation UI)
engines/                   arrayEngine, matrixEngine, ... (pure step compilers)
lib/                       visualizerStore (player), mongodb (db client)
data/                      curriculum.ts (tree metadata for hubs/landing)
services/                  data access (presetService)
types/                     visualization.ts (shared frame contract)
```

---

## 7. Design system (Ember & Coral)

- Dark, Material-3 token palette in [`tailwind.config.ts`](tailwind.config.ts).
- Accent trio matches the WebGL shader orbs: **coral** `#FF5F4A`, **amber**
  `#F5A623`, **mint** `#34C98A`.
- Fonts: JetBrains Mono (everything) + Material Symbols Outlined (icons).
- Animated WebGL background behind every screen at low opacity.

---

## 8. Build order (one section at a time)

1. **Arrays** ← current
2. Foundations
3. Linked List → Stacks → Queues → Trees → Graphs → Hashing → Strings

Do not scaffold a section's pages until its turn — but the **folders** already
exist and define the eventual routes, so leave them in place.
