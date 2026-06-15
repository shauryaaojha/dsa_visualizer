// ---------------------------------------------------------------------------
// Curriculum metadata
//
// Drives the landing page and every hub page. The *folder tree* under
// app/topics is the canonical route map; this file adds the human-facing
// metadata (titles, blurbs, icons, status) and the engine binding for leaves.
//
// Keep slugs identical to folder names so hrefs == real routes.
// See ARCHITECTURE.md.
// ---------------------------------------------------------------------------

export type TopicStatus = "available" | "soon";

/** A leaf = an actual visualizer page. */
export interface LeafMeta {
  slug: string;
  title: string;
  blurb: string;
  icon: string;
  complexity?: { time: string; space: string };
}

/** A category groups leaves (e.g. arrays/searching). */
export interface CategoryMeta {
  slug: string;
  title: string;
  blurb: string;
  icon: string;
  status: TopicStatus;
  leaves: LeafMeta[];
}

/** A top-level section (e.g. arrays). */
export interface SectionMeta {
  slug: string;
  title: string;
  blurb: string;
  icon: string;
  status: TopicStatus;
  categories: CategoryMeta[];
}

// --- Arrays (fully built) --------------------------------------------------

const arrays: SectionMeta = {
  slug: "arrays",
  title: "Arrays",
  blurb: "Contiguous memory: O(1) access, but inserts/deletes shift neighbours.",
  icon: "data_array",
  status: "available",
  categories: [
    {
      slug: "basic-operations",
      title: "Basic Operations",
      blurb: "Traverse, insert, delete and update elements.",
      icon: "tune",
      status: "available",
      leaves: [
        { slug: "traversal", title: "Traversal", blurb: "Visit every element once.", icon: "linear_scale", complexity: { time: "O(n)", space: "O(1)" } },
        { slug: "insertion", title: "Insertion", blurb: "Shift right, then place a value.", icon: "add_box", complexity: { time: "O(n)", space: "O(1)" } },
        { slug: "deletion", title: "Deletion", blurb: "Remove, then shift left.", icon: "delete", complexity: { time: "O(n)", space: "O(1)" } },
        { slug: "updating", title: "Updating", blurb: "Overwrite a value in place.", icon: "edit", complexity: { time: "O(1)", space: "O(1)" } },
      ],
    },
    {
      slug: "searching",
      title: "Searching",
      blurb: "Locate a value — scan it, or halve a sorted range.",
      icon: "search",
      status: "available",
      leaves: [
        { slug: "linear-search", title: "Linear Search", blurb: "Scan left → right for a value.", icon: "search", complexity: { time: "O(n)", space: "O(1)" } },
        { slug: "binary-search", title: "Binary Search", blurb: "Halve a sorted range each step.", icon: "manage_search", complexity: { time: "O(log n)", space: "O(1)" } },
      ],
    },
    {
      slug: "sorting",
      title: "Sorting",
      blurb: "Order the elements — compare, swap, partition, merge.",
      icon: "sort",
      status: "available",
      leaves: [
        { slug: "bubble-sort", title: "Bubble Sort", blurb: "Adjacent compare-and-swap.", icon: "sort", complexity: { time: "O(n²)", space: "O(1)" } },
        { slug: "selection-sort", title: "Selection Sort", blurb: "Pick the minimum each pass.", icon: "filter_list", complexity: { time: "O(n²)", space: "O(1)" } },
        { slug: "insertion-sort", title: "Insertion Sort", blurb: "Grow a sorted prefix.", icon: "playlist_add", complexity: { time: "O(n²)", space: "O(1)" } },
        { slug: "merge-sort", title: "Merge Sort", blurb: "Divide, sort halves, merge.", icon: "call_split", complexity: { time: "O(n log n)", space: "O(n)" } },
        { slug: "quick-sort", title: "Quick Sort", blurb: "Partition around a pivot.", icon: "swap_vert", complexity: { time: "O(n log n)", space: "O(log n)" } },
      ],
    },
    {
      slug: "advanced-array",
      title: "Advanced",
      blurb: "Pattern techniques that turn O(n²) brute force into O(n).",
      icon: "bolt",
      status: "available",
      leaves: [
        { slug: "prefix-sum", title: "Prefix Sum", blurb: "Precompute running totals for O(1) range sums.", icon: "functions", complexity: { time: "O(n)", space: "O(n)" } },
        { slug: "sliding-window", title: "Sliding Window", blurb: "Slide a fixed window for window aggregates.", icon: "crop_landscape", complexity: { time: "O(n)", space: "O(1)" } },
        { slug: "two-pointer", title: "Two Pointer", blurb: "Converge two indices on a sorted array.", icon: "compare_arrows", complexity: { time: "O(n)", space: "O(1)" } },
      ],
    },
    {
      slug: "matrix",
      title: "Matrix",
      blurb: "2-D arrays: traversal order, rotation, multiplication, sparsity.",
      icon: "grid_on",
      status: "available",
      leaves: [
        { slug: "traversal", title: "Traversal", blurb: "Row-major walk across the grid.", icon: "grid_4x4", complexity: { time: "O(m·n)", space: "O(1)" } },
        { slug: "rotation", title: "Rotation", blurb: "Rotate the grid 90° clockwise.", icon: "rotate_90_degrees_cw", complexity: { time: "O(m·n)", space: "O(1)" } },
        { slug: "multiplication", title: "Multiplication", blurb: "Row × column dot products.", icon: "close", complexity: { time: "O(n³)", space: "O(n²)" } },
        { slug: "sparse-matrix", title: "Sparse Matrix", blurb: "Store only non-zeros as triplets.", icon: "scatter_plot", complexity: { time: "O(m·n)", space: "O(k)" } },
      ],
    },
  ],
};

// --- Other sections (folders exist; pages built later) ---------------------

const soon = (
  slug: string,
  title: string,
  icon: string,
  blurb: string,
): SectionMeta => ({ slug, title, icon, blurb, status: "soon", categories: [] });

export const SECTIONS: SectionMeta[] = [
  soon("foundations", "Foundations", "school", "Asymptotics, complexity classes and the math behind analysis."),
  arrays,
  soon("linked-list", "Linked List", "link", "Nodes linked by pointers — singly, doubly, circular."),
  soon("stacks", "Stacks", "stacked_bar_chart", "LIFO discipline and its classic applications."),
  soon("queues", "Queues", "queue", "FIFO, circular, deque and priority variants."),
  soon("trees", "Trees", "account_tree", "Binary, BST, AVL, heaps and tries."),
  soon("graphs", "Graphs", "hub", "Representation, traversal, shortest paths and MSTs."),
  soon("hashing", "Hashing", "tag", "Hash tables and collision resolution."),
  soon("strings", "Strings", "title", "String operations and pattern matching."),
];

export function getSection(slug: string): SectionMeta | undefined {
  return SECTIONS.find((s) => s.slug === slug);
}

export function getCategory(sectionSlug: string, categorySlug: string): CategoryMeta | undefined {
  return getSection(sectionSlug)?.categories.find((c) => c.slug === categorySlug);
}

/** Pretty-print a route segment for breadcrumbs (e.g. "binary-search" → "Binary Search"). */
export function humanize(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
