// ---------------------------------------------------------------------------
// UML diagram presets — data for the reactflow-based class & use-case pages.
// Each diagram is a set of nodes + typed edges, plus `buildSteps` that reveal
// them progressively so a diagram can be "constructed" one relationship at a
// time with narration. Purely declarative; components/uml/* renders it.
// ---------------------------------------------------------------------------

export type UmlNodeKind = "class" | "actor" | "usecase" | "boundary" | "note";

export interface UmlNodeSpec {
  id: string;
  kind: UmlNodeKind;
  position: { x: number; y: number };
  /** boundary nodes carry a size. */
  size?: { width: number; height: number };
  data: {
    name: string;
    stereotype?: "abstract" | "interface";
    attributes?: string[];
    methods?: string[];
    description?: string;
  };
}

export type UmlEdgeKind =
  | "inheritance"
  | "realization"
  | "composition"
  | "aggregation"
  | "association"
  | "dependency"
  | "include"
  | "extend";

export interface UmlEdgeSpec {
  id: string;
  source: string;
  target: string;
  kind: UmlEdgeKind;
  label?: string;
}

export interface UmlBuildStep {
  reveal: string[]; // node + edge ids visible from this step onward
  description: string;
}

export interface UmlDiagram {
  id: string;
  title: string;
  blurb: string;
  kind: "class" | "usecase";
  nodes: UmlNodeSpec[];
  edges: UmlEdgeSpec[];
  buildSteps: UmlBuildStep[];
}

/** Human-readable name + arrowhead description for the legend. */
export const RELATION_INFO: Record<UmlEdgeKind, { label: string; head: string; line: string; meaning: string }> = {
  inheritance: { label: "Inheritance", head: "hollow triangle", line: "solid", meaning: "IS-A — subclass extends a base class." },
  realization: { label: "Realization", head: "hollow triangle", line: "dashed", meaning: "A class implements an interface." },
  composition: { label: "Composition", head: "filled diamond", line: "solid", meaning: "Strong HAS-A — the part cannot outlive the whole." },
  aggregation: { label: "Aggregation", head: "hollow diamond", line: "solid", meaning: "Weak HAS-A — the part can exist independently." },
  association: { label: "Association", head: "open arrow", line: "solid", meaning: "One class uses / references another." },
  dependency: { label: "Dependency", head: "open arrow", line: "dashed", meaning: "A transient 'uses' — a parameter or local." },
  include: { label: "«include»", head: "open arrow", line: "dashed", meaning: "A use case always invokes another." },
  extend: { label: "«extend»", head: "open arrow", line: "dashed", meaning: "A use case optionally extends another." },
};

// --- Class diagrams ----------------------------------------------------------

const shapeHierarchy: UmlDiagram = {
  id: "shape-hierarchy",
  title: "Shape Hierarchy",
  blurb: "Abstract base + interface + two concrete shapes — ties back to the pillars.",
  kind: "class",
  nodes: [
    {
      id: "Shape",
      kind: "class",
      position: { x: 240, y: 0 },
      data: {
        name: "Shape",
        stereotype: "abstract",
        attributes: ["# name: String"],
        methods: ["+ area(): double", "+ describe(): String"],
        description: "Abstract base. Declares area() with no body — every concrete shape must implement it.",
      },
    },
    {
      id: "Drawable",
      kind: "class",
      position: { x: 520, y: 20 },
      data: {
        name: "Drawable",
        stereotype: "interface",
        methods: ["+ draw(): void"],
        description: "An interface: a pure capability contract that unrelated classes can each fulfil.",
      },
    },
    {
      id: "Circle",
      kind: "class",
      position: { x: 120, y: 260 },
      data: { name: "Circle", attributes: ["- r: double"], methods: ["+ area(): double", "+ draw(): void"], description: "Concrete shape. Implements area() = πr² and draw()." },
    },
    {
      id: "Square",
      kind: "class",
      position: { x: 400, y: 260 },
      data: { name: "Square", attributes: ["- side: double"], methods: ["+ area(): double", "+ draw(): void"], description: "Concrete shape. area() = side²." },
    },
  ],
  edges: [
    { id: "e1", source: "Circle", target: "Shape", kind: "inheritance" },
    { id: "e2", source: "Square", target: "Shape", kind: "inheritance" },
    { id: "e3", source: "Circle", target: "Drawable", kind: "realization" },
    { id: "e4", source: "Square", target: "Drawable", kind: "realization" },
  ],
  buildSteps: [
    { reveal: ["Shape"], description: "Start with the abstract base Shape — italic name, area() declared but not implemented." },
    { reveal: ["Shape", "Drawable"], description: "Add the Drawable interface («interface» stereotype) — a capability, separate from the class hierarchy." },
    { reveal: ["Shape", "Drawable", "Circle", "e1", "e3"], description: "Circle EXTENDS Shape (solid hollow triangle) and IMPLEMENTS Drawable (dashed hollow triangle)." },
    { reveal: ["Shape", "Drawable", "Circle", "Square", "e1", "e2", "e3", "e4"], description: "Square joins with the same two relationships. Inheritance is solid; realization is dashed — that's the only visual difference." },
  ],
};

const librarySystem: UmlDiagram = {
  id: "library-system",
  title: "Library Management System",
  blurb: "A five-class model that uses every relationship kind at least once.",
  kind: "class",
  nodes: [
    {
      id: "Library",
      kind: "class",
      position: { x: 260, y: 0 },
      data: { name: "Library", attributes: ["- name: String"], methods: ["+ addBook(b): void", "+ issueLoan(m, b): Loan"], description: "The whole. Owns its Books (composition) and uses Members and Loans." },
    },
    {
      id: "Book",
      kind: "class",
      position: { x: 540, y: 180 },
      data: { name: "Book", attributes: ["- isbn: String", "- title: String"], methods: ["+ isAvailable(): boolean"], description: "Owned by the Library — if the Library is destroyed, its Book records go with it (composition)." },
    },
    {
      id: "Member",
      kind: "class",
      position: { x: 0, y: 180 },
      data: { name: "Member", attributes: ["- id: int", "- name: String"], methods: ["+ borrow(b): void"], description: "A library member. Aggregates Loans — the Loans are tracked but exist as their own records." },
    },
    {
      id: "Loan",
      kind: "class",
      position: { x: 280, y: 320 },
      data: { name: "Loan", attributes: ["- dueDate: Date"], methods: ["+ isOverdue(): boolean"], description: "A borrowing record. Associated with one Book." },
    },
    {
      id: "Librarian",
      kind: "class",
      position: { x: 0, y: 380 },
      data: { name: "Librarian", attributes: ["- staffId: int"], methods: ["+ approve(l): void"], description: "A staff member — IS-A Member with extra privileges (inheritance)." },
    },
  ],
  edges: [
    { id: "e1", source: "Library", target: "Book", kind: "composition", label: "1..*" },
    { id: "e2", source: "Member", target: "Loan", kind: "aggregation", label: "0..*" },
    { id: "e3", source: "Loan", target: "Book", kind: "association", label: "1" },
    { id: "e4", source: "Librarian", target: "Member", kind: "inheritance" },
    { id: "e5", source: "Library", target: "Member", kind: "dependency", label: "uses" },
  ],
  buildSteps: [
    { reveal: ["Library", "Book", "e1"], description: "Library ◆—— Book: COMPOSITION (filled diamond at the Library). The Library owns its Book records; destroy the Library and the records go too." },
    { reveal: ["Library", "Book", "Member", "Loan", "e1", "e2"], description: "Member ——◇ Loan: AGGREGATION (hollow diamond). A Member tracks Loans, but a Loan is its own object with its own lifetime." },
    { reveal: ["Library", "Book", "Member", "Loan", "e1", "e2", "e3"], description: "Loan ——> Book: ASSOCIATION (open arrow). A Loan simply references the Book it's for." },
    { reveal: ["Library", "Book", "Member", "Loan", "Librarian", "e1", "e2", "e3", "e4"], description: "Librarian ──▷ Member: INHERITANCE (hollow triangle). A Librarian IS-A Member with extra abilities." },
    { reveal: ["Library", "Book", "Member", "Loan", "Librarian", "e1", "e2", "e3", "e4", "e5"], description: "Library ┄┄> Member: DEPENDENCY (dashed open arrow). issueLoan() takes a Member as a parameter — a transient 'uses', not a stored field." },
  ],
};

// --- Use-case diagrams -------------------------------------------------------

const atm: UmlDiagram = {
  id: "atm",
  title: "ATM",
  blurb: "Actors, a system boundary, and «include» / «extend» relationships.",
  kind: "usecase",
  nodes: [
    { id: "Customer", kind: "actor", position: { x: 0, y: 180 }, data: { name: "Customer", description: "The primary actor — initiates withdrawals, deposits and balance checks." } },
    { id: "Bank", kind: "actor", position: { x: 700, y: 200 }, data: { name: "Bank", description: "A supporting actor — the backend that authorises transactions." } },
    { id: "boundary", kind: "boundary", position: { x: 220, y: 20 }, size: { width: 380, height: 420 }, data: { name: "ATM System" } },
    { id: "Withdraw", kind: "usecase", position: { x: 320, y: 60 }, data: { name: "Withdraw Cash", description: "Dispense cash. Always authenticates first; may print a receipt." } },
    { id: "Deposit", kind: "usecase", position: { x: 320, y: 160 }, data: { name: "Deposit Cash", description: "Accept a deposit. Always authenticates first." } },
    { id: "Balance", kind: "usecase", position: { x: 320, y: 260 }, data: { name: "Check Balance", description: "Show the account balance." } },
    { id: "Auth", kind: "usecase", position: { x: 320, y: 360 }, data: { name: "Authenticate", description: "Verify PIN with the Bank. Included by the transaction use cases." } },
    { id: "Receipt", kind: "usecase", position: { x: 60, y: 360 }, data: { name: "Print Receipt", description: "Optional — extends Withdraw when the customer asks for one." } },
  ],
  edges: [
    { id: "a1", source: "Customer", target: "Withdraw", kind: "association" },
    { id: "a2", source: "Customer", target: "Deposit", kind: "association" },
    { id: "a3", source: "Customer", target: "Balance", kind: "association" },
    { id: "i1", source: "Withdraw", target: "Auth", kind: "include", label: "«include»" },
    { id: "i2", source: "Deposit", target: "Auth", kind: "include", label: "«include»" },
    { id: "i3", source: "Balance", target: "Auth", kind: "include", label: "«include»" },
    { id: "x1", source: "Receipt", target: "Withdraw", kind: "extend", label: "«extend»" },
    { id: "b1", source: "Auth", target: "Bank", kind: "association" },
  ],
  buildSteps: [
    { reveal: ["boundary", "Customer", "Withdraw", "Deposit", "Balance", "a1", "a2", "a3"], description: "The Customer actor connects to three use cases inside the ATM System boundary — plain associations." },
    { reveal: ["boundary", "Customer", "Withdraw", "Deposit", "Balance", "Auth", "a1", "a2", "a3", "i1", "i2", "i3"], description: "Every transaction «include»s Authenticate — a mandatory sub-behaviour they all share, factored out once (dashed arrow toward the included case)." },
    { reveal: ["boundary", "Customer", "Withdraw", "Deposit", "Balance", "Auth", "Receipt", "a1", "a2", "a3", "i1", "i2", "i3", "x1"], description: "Print Receipt «extend»s Withdraw — an OPTIONAL add-on. The arrow points from the extension toward the base case." },
    { reveal: ["boundary", "Customer", "Bank", "Withdraw", "Deposit", "Balance", "Auth", "Receipt", "a1", "a2", "a3", "i1", "i2", "i3", "x1", "b1"], description: "The Bank is a supporting actor: Authenticate talks to it to verify the PIN. Actors sit OUTSIDE the boundary; use cases sit inside." },
  ],
};

const onlineShopping: UmlDiagram = {
  id: "online-shopping",
  title: "Online Shopping",
  blurb: "A second use-case model — customer, admin and a payment gateway.",
  kind: "usecase",
  nodes: [
    { id: "Customer", kind: "actor", position: { x: 0, y: 160 }, data: { name: "Customer" } },
    { id: "Gateway", kind: "actor", position: { x: 700, y: 200 }, data: { name: "Payment Gateway", description: "External payment provider." } },
    { id: "boundary", kind: "boundary", position: { x: 220, y: 20 }, size: { width: 380, height: 380 }, data: { name: "Shop System" } },
    { id: "Browse", kind: "usecase", position: { x: 320, y: 60 }, data: { name: "Browse Catalog" } },
    { id: "Cart", kind: "usecase", position: { x: 320, y: 150 }, data: { name: "Manage Cart" } },
    { id: "Checkout", kind: "usecase", position: { x: 320, y: 240 }, data: { name: "Checkout" } },
    { id: "Pay", kind: "usecase", position: { x: 320, y: 330 }, data: { name: "Process Payment" } },
    { id: "Login", kind: "usecase", position: { x: 60, y: 330 }, data: { name: "Log In" } },
  ],
  edges: [
    { id: "a1", source: "Customer", target: "Browse", kind: "association" },
    { id: "a2", source: "Customer", target: "Cart", kind: "association" },
    { id: "a3", source: "Customer", target: "Checkout", kind: "association" },
    { id: "i1", source: "Checkout", target: "Pay", kind: "include", label: "«include»" },
    { id: "x1", source: "Login", target: "Checkout", kind: "extend", label: "«extend»" },
    { id: "b1", source: "Pay", target: "Gateway", kind: "association" },
  ],
  buildSteps: [
    { reveal: ["boundary", "Customer", "Browse", "Cart", "Checkout", "a1", "a2", "a3"], description: "The Customer browses, manages a cart and checks out." },
    { reveal: ["boundary", "Customer", "Browse", "Cart", "Checkout", "Pay", "a1", "a2", "a3", "i1", "b1", "Gateway"], description: "Checkout «include»s Process Payment, which talks to the external Payment Gateway actor." },
    { reveal: ["boundary", "Customer", "Browse", "Cart", "Checkout", "Pay", "Login", "a1", "a2", "a3", "i1", "b1", "Gateway", "x1"], description: "Log In «extend»s Checkout — only required if the customer isn't already signed in." },
  ],
};

// --- Relationship micro-diagrams (one arrow kind each) -----------------------

function pair(kind: UmlEdgeKind, a: string, b: string, desc: string): UmlDiagram {
  const info = RELATION_INFO[kind];
  return {
    id: kind,
    title: info.label,
    blurb: info.meaning,
    kind: "class",
    nodes: [
      { id: "A", kind: "class", position: { x: 60, y: 40 }, data: { name: a, description: desc } },
      { id: "B", kind: "class", position: { x: 60, y: 240 }, data: { name: b, description: info.meaning } },
    ],
    edges: [{ id: "e", source: "A", target: "B", kind }],
    buildSteps: [
      { reveal: ["A", "B"], description: `Two classes: ${a} and ${b}.` },
      { reveal: ["A", "B", "e"], description: `${info.label} — ${info.line} line, ${info.head} at the ${b} end. ${info.meaning}` },
    ],
  };
}

const relationships: UmlDiagram[] = [
  pair("association", "Order", "Customer", "An Order references the Customer who placed it."),
  pair("aggregation", "Team", "Player", "A Team groups Players, but a Player exists without the Team."),
  pair("composition", "House", "Room", "A House is composed of Rooms; destroy the House and the Rooms go too."),
  pair("inheritance", "Dog", "Animal", "A Dog IS-A Animal."),
  pair("realization", "ArrayList", "List", "ArrayList realizes (implements) the List interface."),
  pair("dependency", "OrderService", "EmailSender", "OrderService uses an EmailSender passed to a method."),
];

// --- Registry ---------------------------------------------------------------

export const CLASS_DIAGRAMS: UmlDiagram[] = [shapeHierarchy, librarySystem];
export const USECASE_DIAGRAMS: UmlDiagram[] = [atm, onlineShopping];
export const RELATIONSHIP_DIAGRAMS: UmlDiagram[] = relationships;

export const ALL_DIAGRAMS: UmlDiagram[] = [
  ...CLASS_DIAGRAMS,
  ...USECASE_DIAGRAMS,
  ...RELATIONSHIP_DIAGRAMS,
];

export function getDiagram(id: string): UmlDiagram | undefined {
  return ALL_DIAGRAMS.find((d) => d.id === id);
}
