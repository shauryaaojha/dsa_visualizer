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

/** A leaf = an actual visualizer page, OR (if it has `children`) a sub-hub. */
export interface LeafMeta {
  slug: string;
  title: string;
  blurb: string;
  icon: string;
  complexity?: { time: string; space: string };
  /** If present, this card is an intermediate hub listing these child leaves. */
  children?: LeafMeta[];
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
    {
      slug: "patterns",
      title: "LeetCode Patterns",
      blurb: "Classic interview problems that turn the array techniques into solutions.",
      icon: "code",
      status: "available",
      leaves: [
        { slug: "maximum-subarray", title: "Maximum Subarray", blurb: "Kadane: largest contiguous sum (#53).", icon: "show_chart", complexity: { time: "O(n)", space: "O(1)" } },
        { slug: "best-time-stock", title: "Buy & Sell Stock", blurb: "Best single buy/sell profit (#121).", icon: "trending_up", complexity: { time: "O(n)", space: "O(1)" } },
        { slug: "move-zeroes", title: "Move Zeroes", blurb: "Push 0s to the end, keep order (#283).", icon: "exposure_zero", complexity: { time: "O(n)", space: "O(1)" } },
        { slug: "container-most-water", title: "Container With Most Water", blurb: "Two-pointer max area (#11).", icon: "water", complexity: { time: "O(n)", space: "O(1)" } },
        { slug: "sort-colors", title: "Sort Colors", blurb: "Dutch flag — 0/1/2 in one pass (#75).", icon: "palette", complexity: { time: "O(n)", space: "O(1)" } },
        { slug: "remove-duplicates", title: "Remove Duplicates", blurb: "Unique prefix of a sorted array (#26).", icon: "filter_alt", complexity: { time: "O(n)", space: "O(1)" } },
        { slug: "majority-element", title: "Majority Element", blurb: "Boyer–Moore voting (#169).", icon: "how_to_vote", complexity: { time: "O(n)", space: "O(1)" } },
      ],
    },
  ],
};

// --- Linked List (fully built) ---------------------------------------------

/** Insertion / deletion groups are identical across list kinds (routes differ
 *  by the kind folder, derived from the path in the hub pages). */
const insertionGroup: LeafMeta = {
  slug: "insertion",
  title: "Insertion",
  blurb: "Add a node at the beginning, end, or a given position.",
  icon: "add_box",
  children: [
    { slug: "insert-begin", title: "Insert at Begin", blurb: "Prepend a node — O(1).", icon: "first_page", complexity: { time: "O(1)", space: "O(1)" } },
    { slug: "insert-end", title: "Insert at End", blurb: "Append a node at the tail.", icon: "last_page", complexity: { time: "O(n)", space: "O(1)" } },
    { slug: "insert-position", title: "Insert at Position", blurb: "Splice a node at an index.", icon: "add_box", complexity: { time: "O(n)", space: "O(1)" } },
  ],
};

const deletionGroup: LeafMeta = {
  slug: "deletion",
  title: "Deletion",
  blurb: "Remove a node from the beginning, end, or a given position.",
  icon: "delete",
  children: [
    { slug: "delete-begin", title: "Delete at Begin", blurb: "Remove the head — O(1).", icon: "first_page", complexity: { time: "O(1)", space: "O(1)" } },
    { slug: "delete-end", title: "Delete at End", blurb: "Remove the tail node.", icon: "last_page", complexity: { time: "O(n)", space: "O(1)" } },
    { slug: "delete-position", title: "Delete at Position", blurb: "Unlink the node at an index.", icon: "delete", complexity: { time: "O(n)", space: "O(1)" } },
  ],
};

const listTypeLeaves = (): LeafMeta[] => [
  { slug: "traversal", title: "Traversal", blurb: "Walk head → tail following next.", icon: "linear_scale", complexity: { time: "O(n)", space: "O(1)" } },
  { ...insertionGroup },
  { ...deletionGroup },
];

const linkedList: SectionMeta = {
  slug: "linked-list",
  title: "Linked List",
  blurb: "Nodes linked by pointers — singly, doubly, circular.",
  icon: "link",
  status: "available",
  categories: [
    {
      slug: "singly-linked-list",
      title: "Singly Linked List",
      blurb: "Each node points to the next; one-way traversal.",
      icon: "east",
      status: "available",
      leaves: listTypeLeaves(),
    },
    {
      slug: "doubly-linked-list",
      title: "Doubly Linked List",
      blurb: "Nodes carry next and prev — walk both directions.",
      icon: "sync_alt",
      status: "available",
      leaves: listTypeLeaves(),
    },
    {
      slug: "circular-linked-list",
      title: "Circular Linked List",
      blurb: "The tail links back to the head — no NULL end.",
      icon: "refresh",
      status: "available",
      leaves: listTypeLeaves(),
    },
    {
      slug: "classic-problems",
      title: "Classic Problems",
      blurb: "Must-know LeetCode list problems — pointer surgery and the tortoise & hare.",
      icon: "code",
      status: "available",
      leaves: [
        { slug: "reverse-list", title: "Reverse a List", blurb: "Flip every next pointer (#206).", icon: "swap_horiz", complexity: { time: "O(n)", space: "O(1)" } },
        { slug: "find-middle", title: "Middle of the List", blurb: "Tortoise & hare midpoint (#876).", icon: "align_horizontal_center", complexity: { time: "O(n)", space: "O(1)" } },
        { slug: "remove-nth-end", title: "Remove Nth From End", blurb: "Two pointers with a gap of n (#19).", icon: "last_page", complexity: { time: "O(n)", space: "O(1)" } },
        { slug: "palindrome-list", title: "Palindrome List", blurb: "Compare the list with its reverse (#234).", icon: "compare_arrows", complexity: { time: "O(n)", space: "O(1)" } },
      ],
    },
    {
      slug: "applications",
      title: "Applications",
      blurb: "Classic problems modelled with linked lists.",
      icon: "extension",
      status: "available",
      leaves: [
        { slug: "josephus-problem", title: "Josephus Problem", blurb: "Eliminate every k-th node around a circle.", icon: "casino", complexity: { time: "O(n·k)", space: "O(n)" } },
        { slug: "polynomial-representation", title: "Polynomial Representation", blurb: "Store terms (coef, exp) as list nodes.", icon: "functions", complexity: { time: "O(t)", space: "O(t)" } },
      ],
    },
  ],
};

// --- Stacks (fully built) ----------------------------------------------------

const stacks: SectionMeta = {
  slug: "stacks",
  title: "Stacks",
  blurb: "LIFO discipline: everything enters and leaves through the top.",
  icon: "stacked_bar_chart",
  status: "available",
  categories: [
    {
      slug: "array-implementation",
      title: "Array Implementation",
      blurb: "A fixed well of slots plus a top index — fast but bounded.",
      icon: "data_array",
      status: "available",
      leaves: [
        { slug: "push", title: "Push", blurb: "top++, then write at stack[top].", icon: "add_box", complexity: { time: "O(1)", space: "O(1)" } },
        { slug: "pop", title: "Pop", blurb: "Read stack[top], then top−−.", icon: "remove", complexity: { time: "O(1)", space: "O(1)" } },
        { slug: "peek", title: "Peek", blurb: "Read the top without removing it.", icon: "visibility", complexity: { time: "O(1)", space: "O(1)" } },
        { slug: "overflow-underflow", title: "Overflow & Underflow", blurb: "The two boundary failures of a fixed stack.", icon: "warning", complexity: { time: "O(1)", space: "O(1)" } },
      ],
    },
    {
      slug: "linked-list-implementation",
      title: "Linked List Implementation",
      blurb: "Push/pop at the head — no capacity limit, one allocation per push.",
      icon: "link",
      status: "available",
      leaves: [
        { slug: "push", title: "Push", blurb: "node.next = top; top = node.", icon: "add_box", complexity: { time: "O(1)", space: "O(1)" } },
        { slug: "pop", title: "Pop", blurb: "top = top.next; free the old node.", icon: "remove", complexity: { time: "O(1)", space: "O(1)" } },
        { slug: "peek", title: "Peek", blurb: "Follow TOP and read — nothing changes.", icon: "visibility", complexity: { time: "O(1)", space: "O(1)" } },
      ],
    },
    {
      slug: "applications",
      title: "Applications",
      blurb: "Where LIFO does real work — parsing, evaluation and the call stack.",
      icon: "extension",
      status: "available",
      leaves: [
        { slug: "balanced-parentheses", title: "Balanced Parentheses", blurb: "Openers wait; each closer must match the top.", icon: "data_object", complexity: { time: "O(n)", space: "O(n)" } },
        { slug: "infix-to-postfix", title: "Infix → Postfix", blurb: "Shunting-yard: operators wait by precedence.", icon: "swap_horiz", complexity: { time: "O(n)", space: "O(n)" } },
        { slug: "postfix-evaluation", title: "Postfix Evaluation", blurb: "Numbers push; operators pop two, push one.", icon: "calculate", complexity: { time: "O(n)", space: "O(n)" } },
        { slug: "recursion-stack", title: "Recursion Stack", blurb: "Call frames wind up, then unwind — fact(n).", icon: "layers", complexity: { time: "O(n)", space: "O(n)" } },
      ],
    },
  ],
};

// --- Queues (fully built) ----------------------------------------------------

const queues: SectionMeta = {
  slug: "queues",
  title: "Queues",
  blurb: "FIFO and its variants: linear, circular, deque and priority.",
  icon: "queue",
  status: "available",
  categories: [
    {
      slug: "simple-queue",
      title: "Simple Queue",
      blurb: "A linear array with front and rear indices — and a wasteful flaw.",
      icon: "east",
      status: "available",
      leaves: [
        {
          slug: "array-implementation",
          title: "Array Implementation",
          blurb: "Enqueue at the rear, dequeue at the front.",
          icon: "data_array",
          children: [
            { slug: "enqueue", title: "Enqueue", blurb: "rear++, then write at queue[rear].", icon: "login", complexity: { time: "O(1)", space: "O(1)" } },
            { slug: "dequeue", title: "Dequeue", blurb: "Read queue[front], then front++.", icon: "logout", complexity: { time: "O(1)", space: "O(1)" } },
            { slug: "peek", title: "Peek", blurb: "Read the front without removing it.", icon: "visibility", complexity: { time: "O(1)", space: "O(1)" } },
          ],
        },
      ],
    },
    {
      slug: "circular-queue",
      title: "Circular Queue",
      blurb: "Indices wrap with % N, so freed slots are reused — nothing wasted.",
      icon: "refresh",
      status: "available",
      leaves: [
        { slug: "enqueue", title: "Enqueue", blurb: "rear = (rear + 1) % N, then write.", icon: "login", complexity: { time: "O(1)", space: "O(1)" } },
        { slug: "dequeue", title: "Dequeue", blurb: "Read, then front = (front + 1) % N.", icon: "logout", complexity: { time: "O(1)", space: "O(1)" } },
        { slug: "overflow-condition", title: "Overflow Condition", blurb: "(rear + 1) % N == front — why one slot stays empty.", icon: "warning", complexity: { time: "O(1)", space: "O(1)" } },
      ],
    },
    {
      slug: "deque",
      title: "Deque",
      blurb: "Double-ended: insert and delete at both the front and the rear.",
      icon: "sync_alt",
      status: "available",
      leaves: [
        { slug: "insert-front", title: "Insert Front", blurb: "The op a plain queue forbids.", icon: "first_page", complexity: { time: "O(1)", space: "O(1)" } },
        { slug: "insert-rear", title: "Insert Rear", blurb: "Same as a normal enqueue.", icon: "last_page", complexity: { time: "O(1)", space: "O(1)" } },
        { slug: "delete-front", title: "Delete Front", blurb: "Same as a normal dequeue.", icon: "backspace", complexity: { time: "O(1)", space: "O(1)" } },
        { slug: "delete-rear", title: "Delete Rear", blurb: "Remove from the back — deque only.", icon: "cancel", complexity: { time: "O(1)", space: "O(1)" } },
      ],
    },
    {
      slug: "priority-queue",
      title: "Priority Queue",
      blurb: "Serve by priority, not arrival — unsorted array vs binary heap.",
      icon: "low_priority",
      status: "available",
      leaves: [
        { slug: "array-implementation", title: "Array Implementation", blurb: "Append O(1); dequeue scans for the max — O(n).", icon: "data_array", complexity: { time: "O(n)", space: "O(n)" } },
        { slug: "heap-implementation", title: "Heap Implementation", blurb: "Sift-up on insert, sift-down on extract — O(log n).", icon: "park", complexity: { time: "O(log n)", space: "O(n)" } },
      ],
    },
  ],
};

// --- Trees (fully built) -----------------------------------------------------

const trees: SectionMeta = {
  slug: "trees",
  title: "Trees",
  blurb: "Hierarchy: binary trees, BSTs, self-balancing AVL, heaps and tries.",
  icon: "account_tree",
  status: "available",
  categories: [
    {
      slug: "binary-tree",
      title: "Binary Tree",
      blurb: "At most two children per node — the shape every other tree refines.",
      icon: "account_tree",
      status: "available",
      leaves: [
        {
          slug: "traversal",
          title: "Traversal",
          blurb: "Four ways to visit every node exactly once.",
          icon: "swap_horiz",
          children: [
            { slug: "inorder", title: "In-order", blurb: "Left → Node → Right.", icon: "swap_horiz", complexity: { time: "O(n)", space: "O(h)" } },
            { slug: "preorder", title: "Pre-order", blurb: "Node → Left → Right.", icon: "first_page", complexity: { time: "O(n)", space: "O(h)" } },
            { slug: "postorder", title: "Post-order", blurb: "Left → Right → Node.", icon: "last_page", complexity: { time: "O(n)", space: "O(h)" } },
            { slug: "level-order", title: "Level Order", blurb: "Top → bottom with a queue.", icon: "reorder", complexity: { time: "O(n)", space: "O(n)" } },
          ],
        },
        { slug: "insertion", title: "Insertion", blurb: "Fill the first free spot, level by level.", icon: "add_box", complexity: { time: "O(n)", space: "O(n)" } },
        { slug: "deletion", title: "Deletion", blurb: "Swap with the deepest node, then remove it.", icon: "delete", complexity: { time: "O(n)", space: "O(n)" } },
      ],
    },
    {
      slug: "binary-search-tree",
      title: "Binary Search Tree",
      blurb: "left < node < right — half the tree eliminated per comparison.",
      icon: "search",
      status: "available",
      leaves: [
        { slug: "traversal", title: "Traversal", blurb: "In-order yields sorted output.", icon: "swap_horiz", complexity: { time: "O(n)", space: "O(h)" } },
        { slug: "search", title: "Search", blurb: "Walk left/right by comparison — O(h).", icon: "search", complexity: { time: "O(h)", space: "O(1)" } },
        { slug: "insertion", title: "Insertion", blurb: "Attach at the NULL where the search fails.", icon: "add_box", complexity: { time: "O(h)", space: "O(1)" } },
        { slug: "deletion", title: "Deletion", blurb: "Leaf, one child, or two (in-order successor).", icon: "delete", complexity: { time: "O(h)", space: "O(1)" } },
      ],
    },
    {
      slug: "avl-tree",
      title: "AVL Tree",
      blurb: "A BST that rotates itself back into balance — |bf| ≤ 1 everywhere.",
      icon: "balance",
      status: "available",
      leaves: [
        { slug: "insertion", title: "Insertion", blurb: "BST insert, then rotate the first ±2 node.", icon: "add_box", complexity: { time: "O(log n)", space: "O(log n)" } },
        { slug: "deletion", title: "Deletion", blurb: "BST delete, then rebalance the whole path.", icon: "delete", complexity: { time: "O(log n)", space: "O(log n)" } },
        {
          slug: "rotations",
          title: "Rotations",
          blurb: "The four imbalance cases and their fixes.",
          icon: "rotate_right",
          children: [
            { slug: "ll-rotation", title: "LL Rotation", blurb: "Left-left → one right rotation.", icon: "rotate_right", complexity: { time: "O(1)", space: "O(1)" } },
            { slug: "rr-rotation", title: "RR Rotation", blurb: "Right-right → one left rotation.", icon: "rotate_left", complexity: { time: "O(1)", space: "O(1)" } },
            { slug: "lr-rotation", title: "LR Rotation", blurb: "Zig-zag: rotate child, then pivot.", icon: "sync", complexity: { time: "O(1)", space: "O(1)" } },
            { slug: "rl-rotation", title: "RL Rotation", blurb: "Zig-zag: rotate child, then pivot.", icon: "sync", complexity: { time: "O(1)", space: "O(1)" } },
          ],
        },
      ],
    },
    {
      slug: "heaps",
      title: "Heaps",
      blurb: "A complete tree in an array — the max always at the root.",
      icon: "park",
      status: "available",
      leaves: [
        { slug: "insert", title: "Insert", blurb: "Append at the end, sift up.", icon: "add_box", complexity: { time: "O(log n)", space: "O(1)" } },
        { slug: "delete", title: "Delete", blurb: "Take the root; last leaf sifts down.", icon: "remove", complexity: { time: "O(log n)", space: "O(1)" } },
        { slug: "heapify", title: "Heapify", blurb: "Bottom-up build of a heap — O(n).", icon: "construction", complexity: { time: "O(n)", space: "O(1)" } },
        { slug: "heap-sort", title: "Heap Sort", blurb: "Extract max n times → sorted.", icon: "sort", complexity: { time: "O(n log n)", space: "O(1)" } },
      ],
    },
    {
      slug: "trie",
      title: "Trie",
      blurb: "Words as letter-paths; shared prefixes share nodes.",
      icon: "spellcheck",
      status: "available",
      leaves: [
        { slug: "insert", title: "Insert", blurb: "Create the letter path; ring the end.", icon: "add_box", complexity: { time: "O(L)", space: "O(L)" } },
        { slug: "search", title: "Search", blurb: "Follow letters; found ⇔ end ring.", icon: "search", complexity: { time: "O(L)", space: "O(1)" } },
        { slug: "delete", title: "Delete", blurb: "Un-ring, then prune unused letters.", icon: "delete", complexity: { time: "O(L)", space: "O(1)" } },
      ],
    },
  ],
};

// --- Graphs (fully built) ----------------------------------------------------

const graphs: SectionMeta = {
  slug: "graphs",
  title: "Graphs",
  blurb: "Nodes and edges: representation, traversal, shortest paths, MSTs.",
  icon: "hub",
  status: "available",
  categories: [
    {
      slug: "graph-representation",
      title: "Representation",
      blurb: "How a graph lives in memory: matrix vs list.",
      icon: "grid_on",
      status: "available",
      leaves: [
        { slug: "adjacency-matrix", title: "Adjacency Matrix", blurb: "V×V grid — O(1) lookup, O(V²) space.", icon: "grid_on", complexity: { time: "O(1)", space: "O(V²)" } },
        { slug: "adjacency-list", title: "Adjacency List", blurb: "Neighbour lists — O(V+E) space.", icon: "list", complexity: { time: "O(deg)", space: "O(V+E)" } },
      ],
    },
    {
      slug: "traversal",
      title: "Traversal",
      blurb: "Visit every reachable node — in rings (BFS) or by diving deep (DFS).",
      icon: "explore",
      status: "available",
      leaves: [
        { slug: "bfs", title: "Breadth-First Search", blurb: "Queue-driven, level by level.", icon: "waves", complexity: { time: "O(V+E)", space: "O(V)" } },
        { slug: "dfs", title: "Depth-First Search", blurb: "Dive deep, backtrack when stuck.", icon: "south", complexity: { time: "O(V+E)", space: "O(V)" } },
      ],
    },
    {
      slug: "shortest-path",
      title: "Shortest Path",
      blurb: "Cheapest routes: greedy, brute-force, and all-pairs.",
      icon: "route",
      status: "available",
      leaves: [
        { slug: "dijkstra", title: "Dijkstra", blurb: "Lock in the closest node, relax its edges.", icon: "route", complexity: { time: "O((V+E) log V)", space: "O(V)" } },
        { slug: "bellman-ford", title: "Bellman–Ford", blurb: "Relax all edges V−1 times; handles negatives.", icon: "sync_problem", complexity: { time: "O(V·E)", space: "O(V)" } },
        { slug: "floyd-warshall", title: "Floyd–Warshall", blurb: "All pairs, one matrix, three loops.", icon: "grid_4x4", complexity: { time: "O(V³)", space: "O(V²)" } },
      ],
    },
    {
      slug: "minimum-spanning-tree",
      title: "Minimum Spanning Tree",
      blurb: "Connect everything at minimum total cost.",
      icon: "park",
      status: "available",
      leaves: [
        { slug: "prims", title: "Prim's Algorithm", blurb: "Grow one tree by the cheapest crossing edge.", icon: "park", complexity: { time: "O(E log V)", space: "O(V)" } },
        { slug: "kruskal", title: "Kruskal's Algorithm", blurb: "Cheapest edges first; skip cycle-closers.", icon: "sort", complexity: { time: "O(E log E)", space: "O(V)" } },
      ],
    },
    {
      slug: "connectivity",
      title: "Connectivity",
      blurb: "Weak points and strong groups: bridges, cut vertices, SCCs.",
      icon: "share",
      status: "available",
      leaves: [
        { slug: "bridges", title: "Bridges", blurb: "Edges whose removal splits the graph.", icon: "remove_road", complexity: { time: "O(V+E)", space: "O(V)" } },
        { slug: "articulation-points", title: "Articulation Points", blurb: "Nodes whose removal splits the graph.", icon: "hub", complexity: { time: "O(V+E)", space: "O(V)" } },
        { slug: "strongly-connected-components", title: "Strongly Connected Components", blurb: "Kosaraju: DFS, transpose, DFS again.", icon: "workspaces", complexity: { time: "O(V+E)", space: "O(V)" } },
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
  linkedList,
  stacks,
  queues,
  trees,
  graphs,
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
