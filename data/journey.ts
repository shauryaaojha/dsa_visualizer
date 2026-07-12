// ---------------------------------------------------------------------------
// The evolution story — WHY each data structure had to be invented.
//
// Faculty feedback: students learn arrays, then lists, then stacks… without
// ever hearing the question each one answers. This file is that missing
// narrative: every stage states the PROBLEM the previous structure ran into,
// and the IDEA that fixes it. Rendered as the "Why these structures?"
// timeline on the landing page and as the callout on each topic hub.
// ---------------------------------------------------------------------------

export interface JourneyStage {
  slug: string; // matches /topics/<slug>
  title: string;
  icon: string;
  accent: string;
  /** The pain point that existed BEFORE this structure. */
  problem: string;
  /** The core idea this structure contributes. */
  idea: string;
  /** What it costs — the trade-off that motivates the NEXT structure. */
  tradeoff: string;
  /** A one-line real-world anchor. */
  realWorld: string;
}

export const JOURNEY: JourneyStage[] = [
  {
    slug: "arrays",
    title: "Arrays",
    icon: "data_array",
    accent: "#FF5F4A",
    problem:
      "A program with only single variables (x, y, z…) cannot hold a THOUSAND marks or a MILLION pixels — you can't name a box per value.",
    idea:
      "Put values in one contiguous block and reach any of them by INDEX: address = base + i × size. One name, n values, O(1) access to any of them.",
    tradeoff:
      "Contiguity is also the weakness: inserting or deleting in the middle shifts everything after it — O(n) — and growing needs a full re-copy.",
    realWorld: "A row of numbered lockers: locker #42 is one step away, but adding a locker in the middle means shifting every locker after it.",
  },
  {
    slug: "linked-list",
    title: "Linked Lists",
    icon: "link",
    accent: "#F5A623",
    problem:
      "Arrays made insert/delete expensive: shifting n elements just to add one at the front, and resizing means copying the whole block.",
    idea:
      "Give up contiguity. Each node stores its value PLUS the address of the next node — insertion is just rewiring two pointers, O(1), and the list grows one node at a time, forever.",
    tradeoff:
      "You lose the index formula: reaching the k-th node means walking k pointers, O(n). And every node pays extra memory for its pointer.",
    realWorld: "A treasure hunt: each clue points to the next. Adding a clue mid-hunt is easy — but there is no jumping straight to clue #42.",
  },
  {
    slug: "stacks",
    title: "Stacks",
    icon: "layers",
    accent: "#34C98A",
    problem:
      "Arrays and lists let you touch ANY element — but many problems (undo, nested brackets, function calls) only ever need the MOST RECENT thing, and full freedom just invites bugs.",
    idea:
      "Deliberately RESTRICT access: push and pop at one end only — LIFO. Less power, more guarantees: the newest item is always the next one out, in O(1).",
    tradeoff:
      "Only the top is reachable. The moment you need the OLDEST item first — a waiting line, not an undo pile — LIFO is exactly backwards.",
    realWorld: "A stack of plates: you take the one you put down last. Ctrl+Z, the call stack, and bracket matching all work this way.",
  },
  {
    slug: "queues",
    title: "Queues",
    icon: "airline_seat_recline_normal",
    accent: "#9ccaff",
    problem:
      "Stacks serve the NEWEST first — unfair and wrong for scheduling: the first print job, the first network packet, the first customer should go first.",
    idea:
      "Restrict the other way: enqueue at the back, dequeue from the front — FIFO. Arrival order is preserved, both ends O(1).",
    tradeoff:
      "Stacks and queues are still LINEAR — one thing after another. Hierarchies (folders inside folders) and 'find me X fast among millions' don't fit a line at all.",
    realWorld: "Any queue at a counter: first come, first served. Printer spoolers, task schedulers and BFS all run on this.",
  },
  {
    slug: "trees",
    title: "Trees",
    icon: "account_tree",
    accent: "#FF5F4A",
    problem:
      "Linear structures need O(n) to search, and they can't express hierarchy: file systems, org charts, tournament brackets are not lines.",
    idea:
      "Let each node point to CHILDREN — branch instead of chain. A balanced search tree halves the candidates at every level: search, insert AND delete all in O(log n).",
    tradeoff:
      "Trees allow exactly one path between any two nodes — perfect for hierarchy, useless for NETWORKS where anything may connect to anything, with cycles.",
    realWorld: "Your file explorer: folders inside folders. One million files, and yet any file is ~20 decisions away in a balanced tree.",
  },
  {
    slug: "graphs",
    title: "Graphs",
    icon: "hub",
    accent: "#F5A623",
    problem:
      "Trees forbid cycles and multiple routes — but roads loop, friends form circles, the web links everywhere. Real networks are not hierarchies.",
    idea:
      "Drop every restriction: nodes plus ANY edges — directed or not, weighted or not, cycles welcome. Everything before this is just a special-case graph.",
    tradeoff:
      "Total freedom costs algorithms their innocence: traversal needs visited-sets, shortest paths need Dijkstra, and many graph questions are famously hard.",
    realWorld: "Google Maps, social networks, the internet itself: nodes and edges, with cycles and many routes between two points.",
  },
];

/** Hub-page callout: "why did we need this structure?" — keyed by section slug. */
export function getJourneyStage(slug: string): JourneyStage | undefined {
  return JOURNEY.find((j) => j.slug === slug);
}
