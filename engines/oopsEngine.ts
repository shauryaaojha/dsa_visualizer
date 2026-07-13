// ---------------------------------------------------------------------------
// OOP engine — compiles each concept into an OopsProgram: a flat list of
// frames. Every frame is a full snapshot of three memory regions — the CLASS
// AREA (blueprint boxes + statics + relation arrows), the STACK (named
// references) and the HEAP (objects with per-class field layers + vtables) —
// plus the animated method-call arrows and a console output strip.
//
// Pure: no React, no DOM. Follows the stack/linked-list engine style — a
// Builder accumulates steps, snapshot() deep-copies the current state, and
// each frame carries a language-agnostic `anchor` the notes rail resolves
// against whichever code sample (Java/C++/Python) the user is viewing.
// ---------------------------------------------------------------------------

import type {
  OopsAccess,
  OopsCall,
  OopsClassBox,
  OopsHeapObject,
  OopsMember,
  OopsObjectField,
  OopsOperationId,
  OopsProgram,
  OopsRef,
  OopsRelation,
  OopsStep,
  SQCellState,
  TokenChip,
} from "@/types/visualization";

interface Builder {
  steps: OopsStep[];
  classes: OopsClassBox[];
  relations: OopsRelation[];
  heap: OopsHeapObject[];
  refs: OopsRef[];
  calls: OopsCall[];
  output: TokenChip[];
  seq: number;
}

const ADDR_LETTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ";
function addrFor(seq: number): string {
  const a = ADDR_LETTERS[(seq * 7 + 4) % ADDR_LETTERS.length];
  const b = ADDR_LETTERS[(seq * 5 + 9) % ADDR_LETTERS.length];
  return a + b;
}

function newBuilder(): Builder {
  return { steps: [], classes: [], relations: [], heap: [], refs: [], calls: [], output: [], seq: 0 };
}

// --- Deep-copy snapshot ------------------------------------------------------

function snapshot(
  b: Builder,
  description: string,
  anchor?: string,
  message?: OopsStep["message"],
): void {
  b.steps.push({
    classes: b.classes.map((c) => ({
      ...c,
      members: c.members.map((m) => ({ ...m })),
      statics: c.statics?.map((s) => ({ ...s })),
    })),
    relations: b.relations.map((r) => ({ ...r })),
    heap: b.heap.map((o) => ({
      ...o,
      fields: o.fields.map((f) => ({ ...f })),
      vtable: o.vtable?.map((v) => ({ ...v })),
    })),
    refs: b.refs.map((r) => ({ ...r })),
    calls: b.calls.map((c) => ({ ...c })),
    output: b.output.length ? b.output.map((t) => ({ ...t })) : undefined,
    message,
    description,
    anchor,
  });
}

function clearStates(b: Builder): void {
  b.classes.forEach((c) => {
    c.state = "idle";
    c.members.forEach((m) => (m.state = "idle"));
    c.statics?.forEach((s) => (s.state = "idle"));
  });
  b.relations.forEach((r) => (r.state = "idle"));
  b.heap.forEach((o) => {
    if (!o.floating) o.state = "idle";
    o.fields.forEach((f) => (f.state = "idle"));
    o.vtable?.forEach((v) => (v.state = "idle"));
  });
  b.refs.forEach((r) => (r.state = "idle"));
  b.calls = [];
}

// --- Small constructors ------------------------------------------------------

function member(
  id: string,
  name: string,
  kind: "field" | "method",
  access: OopsAccess,
  extra: Partial<OopsMember> = {},
): OopsMember {
  return { id, name, kind, access, state: "idle", ...extra };
}

function mkClass(b: Builder, spec: Omit<OopsClassBox, "state"> & { state?: SQCellState }): OopsClassBox {
  const c: OopsClassBox = { state: "idle", ...spec };
  b.classes.push(c);
  return c;
}

function mkObject(
  b: Builder,
  className: string,
  fields: Omit<OopsObjectField, "id" | "state">[],
  extra: Partial<OopsHeapObject> = {},
): OopsHeapObject {
  const s = b.seq++;
  const o: OopsHeapObject = {
    id: `o-${s}`,
    className,
    addr: addrFor(s),
    fields: fields.map((f, i) => ({ id: `o-${s}-f${i}`, state: "idle", ...f })),
    state: "new",
    floating: true,
    ...extra,
  };
  b.heap.push(o);
  return o;
}

function mkRef(b: Builder, name: string, declaredType: string, targetId: string | null): OopsRef {
  const r: OopsRef = { id: `r-${name}`, name, declaredType, targetId, state: "new" };
  b.refs.push(r);
  return r;
}

const out = (b: Builder, text: string) => b.output.push({ text, state: "done" });

function done(b: Builder, title: string, codeKey: string): OopsProgram {
  return { steps: b.steps, title, codeKey };
}

// --- Fundamentals ------------------------------------------------------------

function classesObjects(b: Builder): OopsProgram {
  const dog = mkClass(b, {
    id: "Dog",
    name: "Dog",
    x: 0,
    y: 0,
    members: [
      member("f-name", "name: String", "field", "public"),
      member("f-breed", "breed: String", "field", "public"),
      member("m-bark", "bark()", "method", "public"),
    ],
  });

  dog.state = "new";
  snapshot(b, "A class is a BLUEPRINT — it declares what every Dog will have (fields) and can do (methods), but it is not itself a dog. No memory for a dog exists yet.", "class-def");
  dog.state = "idle";

  dog.members[0].state = "active";
  dog.members[1].state = "active";
  snapshot(b, "The fields name and breed describe the STATE each Dog object will carry — declared once here, stored separately in every object.", "fields");
  clearStates(b);

  dog.members[2].state = "active";
  snapshot(b, "bark() is BEHAVIOUR shared by all dogs. The method lives once with the class; objects don't each copy the code.", "method-def");
  clearStates(b);

  // new Dog("Rex","Husky")
  const rexObj = mkObject(b, "Dog", [
    { name: "name", value: "?", access: "public" },
    { name: "breed", value: "?", access: "public" },
  ]);
  dog.state = "active";
  snapshot(b, "new Dog(\"Rex\", \"Husky\") — `new` stamps a fresh object onto the HEAP from the blueprint. Its fields exist but aren't filled yet.", "new-rex");

  rexObj.fields[0].value = "Rex";
  rexObj.fields[0].state = "new";
  rexObj.fields[1].value = "Husky";
  rexObj.fields[1].state = "new";
  snapshot(b, "The constructor runs, copying the arguments into this object's own fields: name = Rex, breed = Husky.", "ctor");

  rexObj.floating = false;
  clearStates(b);
  const rex = mkRef(b, "rex", "Dog", rexObj.id);
  snapshot(b, `The reference rex is stored on the stack; it holds @${rexObj.addr}, the address of the object. rex is not the object — it points at it.`, "new-rex");
  rex.state = "idle";

  // new Dog("Buddy","Beagle")
  const buddyObj = mkObject(b, "Dog", [
    { name: "name", value: "Buddy", access: "public" },
    { name: "breed", value: "Beagle", access: "public" },
  ]);
  buddyObj.fields.forEach((f) => (f.state = "new"));
  dog.state = "active";
  snapshot(b, "new Dog(\"Buddy\", \"Beagle\") — a SECOND, independent object. Same blueprint, its own copy of the fields.", "new-buddy");

  buddyObj.floating = false;
  clearStates(b);
  const buddy = mkRef(b, "buddy", "Dog", buddyObj.id);
  snapshot(b, "Two objects now live on the heap from ONE class. Changing rex.breed would never touch buddy — each object is separate memory.", "new-buddy");
  buddy.state = "idle";

  // rex.bark()
  clearStates(b);
  b.calls = [{ id: "c1", from: rex.id, toObjectId: rexObj.id, method: "bark()", phase: "calling" }];
  rexObj.state = "active";
  snapshot(b, "rex.bark() — follow rex to its object and run bark() on it. Inside the method, `name` means THIS object's name.", "call-rex");
  b.calls[0].phase = "returned";
  b.calls[0].result = "Rex says Woof!";
  out(b, "Rex says Woof!");
  snapshot(b, "The method reads rex's own name field — output: \"Rex says Woof!\".", "call-rex");

  // buddy.bark()
  clearStates(b);
  b.calls = [{ id: "c2", from: buddy.id, toObjectId: buddyObj.id, method: "bark()", phase: "calling" }];
  buddyObj.state = "active";
  snapshot(b, "buddy.bark() — same code, different object. The method now sees buddy's name.", "call-buddy");
  b.calls[0].phase = "returned";
  b.calls[0].result = "Buddy says Woof!";
  out(b, "Buddy says Woof!");
  snapshot(b, "One class, two objects, two different results — that is the whole point of objects: shared behaviour over independent state.", "call-buddy", {
    text: "1 CLASS · 2 OBJECTS",
    tone: "ok",
  });

  return done(b, "Classes & Objects", "classes-objects");
}

function constructors(b: Builder): OopsProgram {
  const animal = mkClass(b, {
    id: "Animal",
    name: "Animal",
    x: 0,
    y: 0,
    members: [member("m-actor", "Animal()", "method", "public", { note: "constructor" })],
  });
  const dog = mkClass(b, {
    id: "Dog",
    name: "Dog",
    x: 0,
    y: 1,
    members: [member("m-dctor", "Dog()", "method", "public", { note: "constructor" })],
  });
  b.relations.push({ id: "rel-ext", from: "Dog", to: "Animal", kind: "extends", state: "idle" });

  snapshot(b, "Dog extends Animal. A Dog object is built in layers — the parent part first, then the child part. Watch the order.");

  const obj = mkObject(b, "Dog", [
    { name: "(Animal)", value: "—", from: "Animal", access: "protected" },
    { name: "(Dog)", value: "—", from: "Dog", access: "public" },
  ]);
  b.calls = [{ id: "c-new", from: "main", toClassId: "Dog", method: "new Dog()", phase: "calling" }];
  snapshot(b, "new Dog() begins. Before Dog's own constructor runs, the parent constructor must finish — this is constructor CHAINING.", "new-call");

  // Animal() runs first
  b.calls = [];
  animal.members[0].state = "active";
  obj.fields[0].state = "new";
  obj.fields[0].value = "built";
  out(b, "Animal constructor");
  snapshot(b, "super() / the implicit parent call fires first: Animal() runs and initialises the Animal layer of the object.", "base-ctor");

  // Dog() runs
  clearStates(b);
  dog.members[0].state = "active";
  obj.fields[1].state = "new";
  obj.fields[1].value = "built";
  out(b, "Dog constructor");
  snapshot(b, "Only now does Dog() run, completing the Dog layer. Order is always base → derived, top of the hierarchy down.", "derived-ctor");

  obj.floating = false;
  clearStates(b);
  const d = mkRef(b, "d", "Dog", obj.id);
  snapshot(b, `The object is fully constructed; d holds @${obj.addr}. Both layers are initialised.`, "new-call");
  d.state = "idle";

  // Destruction
  clearStates(b);
  obj.state = "removing";
  obj.fields.forEach((f) => (f.state = "removing"));
  d.targetId = null;
  d.state = "removing";
  snapshot(b, "At end of scope the object is destroyed. In C++ destructors run in REVERSE: ~Dog() then ~Animal(). In Java/Python the GC reclaims it once no reference remains.", "destroy", {
    text: "OBJECT DESTROYED",
    tone: "info",
  });

  b.heap = [];
  b.refs = [];
  snapshot(b, "Memory reclaimed. Constructors build an object bottom-up through the hierarchy; destruction unwinds it top-down.", "destroy");

  return done(b, "Constructors & Destructors", "constructors");
}

function thisReferences(b: Builder): OopsProgram {
  mkClass(b, {
    id: "Point",
    name: "Point",
    x: 0,
    y: 0,
    members: [member("f-x", "x: int", "field", "public"), member("m-ctor", "Point(x)", "method", "public")],
  });

  const obj = mkObject(b, "Point", [{ name: "x", value: "5", access: "public" }]);
  obj.floating = false;
  obj.state = "new";
  const a = mkRef(b, "a", "Point", obj.id);
  snapshot(b, `Point a = new Point(5). One object on the heap at @${obj.addr}; the reference a points to it.`, "new-call");

  clearStates(b);
  const bRef = mkRef(b, "b", "Point", obj.id);
  bRef.state = "new";
  snapshot(b, "Point b = a copies the REFERENCE, not the object. Now a and b are two names for the SAME object — aliasing.", "alias");

  clearStates(b);
  obj.fields[0].value = "99";
  obj.fields[0].state = "active";
  bRef.state = "active";
  snapshot(b, "b.x = 99 changes the single shared object.", "mutate");

  clearStates(b);
  obj.fields[0].state = "found";
  a.state = "active";
  out(b, "99");
  snapshot(b, "Reading a.x prints 99 — even though we wrote through b. There is only one object; both references see the change.", "read", {
    text: "a.x == 99",
    tone: "ok",
  });

  clearStates(b);
  a.targetId = null;
  a.state = "removing";
  snapshot(b, "a = null. a lets go, but the object is NOT freed — b still holds @" + obj.addr + ".", "null-a");

  clearStates(b);
  bRef.targetId = null;
  bRef.state = "removing";
  obj.state = "removing";
  snapshot(b, "b = null. Now no reference points at the object — it becomes unreachable and eligible for garbage collection.", "null-b", {
    text: "0 REFERENCES → GC",
    tone: "info",
  });

  b.heap = [];
  snapshot(b, "An object lives as long as SOMETHING references it. References are handles; the object is the thing on the heap.", "null-b");

  return done(b, "this & References", "this-references");
}

function accessModifiers(b: Builder): OopsProgram {
  const acct = mkClass(b, {
    id: "BankAccount",
    name: "BankAccount",
    x: 0,
    y: 0,
    members: [
      member("f-bal", "balance: double", "field", "private"),
      member("m-get", "getBalance()", "method", "public"),
    ],
  });

  acct.members[0].state = "target";
  snapshot(b, "balance is PRIVATE — the minus glyph. It is visible only inside BankAccount's own methods; the outside world cannot touch it directly.", "private-field");
  clearStates(b);

  acct.members[1].state = "active";
  snapshot(b, "getBalance() is PUBLIC — the plus glyph. It is the sanctioned gate through which outsiders read the balance.", "getter");
  clearStates(b);

  const obj = mkObject(b, "BankAccount", [{ name: "balance", value: "100", access: "private" }]);
  obj.floating = false;
  obj.state = "new";
  const acc = mkRef(b, "acc", "BankAccount", obj.id);
  snapshot(b, "BankAccount acc = new BankAccount(); the object holds a private balance of 100.", "new-call");
  acc.state = "idle";

  // Blocked direct access
  clearStates(b);
  b.calls = [{ id: "c-block", from: "main", toObjectId: obj.id, method: "balance", phase: "blocked", note: "private — access denied" }];
  acct.members[0].state = "removing";
  obj.fields[0].state = "removing";
  snapshot(b, "acc.balance from main() is REJECTED — balance is private. The compiler stops you; the field is walled off.", "blocked", {
    text: "ACCESS DENIED",
    tone: "error",
  });

  // Allowed via getter
  clearStates(b);
  b.calls = [{ id: "c-get", from: "main", toObjectId: obj.id, method: "getBalance()", phase: "calling" }];
  acct.members[1].state = "active";
  snapshot(b, "acc.getBalance() is ALLOWED — a public method. The call passes through the gate.", "getter-call");

  obj.fields[0].state = "found";
  b.calls[0].phase = "returned";
  b.calls[0].result = "100";
  out(b, "100");
  snapshot(b, "Inside the class, the method freely reads the private balance and returns 100. Encapsulation: the data is protected, but a controlled door exists.", "getter-call", {
    text: "balance = 100",
    tone: "ok",
  });

  return done(b, "Access Modifiers", "access-modifiers");
}

// --- Four Pillars ------------------------------------------------------------

function encapsulation(b: Builder): OopsProgram {
  const acct = mkClass(b, {
    id: "BankAccount",
    name: "BankAccount",
    x: 0,
    y: 0,
    members: [
      member("f-bal", "balance: double", "field", "private"),
      member("m-dep", "deposit(amount)", "method", "public"),
      member("m-get", "getBalance()", "method", "public"),
    ],
  });

  acct.members[0].state = "target";
  snapshot(b, "balance is private, but a public deposit() is the ONLY way to change it. That gate is where the class enforces its rule: a balance can never go down through a deposit.", "private-field");
  clearStates(b);

  const obj = mkObject(b, "BankAccount", [{ name: "balance", value: "0", access: "private" }]);
  obj.floating = false;
  obj.state = "new";
  const acc = mkRef(b, "acc", "BankAccount", obj.id);
  snapshot(b, "new BankAccount(); balance starts at 0.", "new-call");
  acc.state = "idle";

  // deposit(-500) — rejected
  clearStates(b);
  b.calls = [{ id: "c-bad", from: "main", toObjectId: obj.id, method: "deposit(-500)", phase: "calling" }];
  acct.members[1].state = "active";
  snapshot(b, "acc.deposit(-500) — the call enters the public method. The outside code cannot touch balance directly; it must go through deposit().", "call-bad");

  acct.members[1].state = "removing";
  b.calls[0].phase = "returned";
  b.calls[0].result = "rejected";
  out(b, "Rejected: must be positive");
  snapshot(b, "The guard `if (amount <= 0)` catches the illegal −500 and returns early. balance is untouched — the invariant survives BECAUSE the field was private.", "guard", {
    text: "GUARD REJECTED −500",
    tone: "error",
  });

  // deposit(200) — accepted
  clearStates(b);
  b.calls = [{ id: "c-good", from: "main", toObjectId: obj.id, method: "deposit(200)", phase: "calling" }];
  acct.members[1].state = "active";
  snapshot(b, "acc.deposit(200) — a valid amount passes the guard.", "call-good");

  obj.fields[0].value = "200";
  obj.fields[0].state = "new";
  b.calls[0].phase = "returned";
  snapshot(b, "balance += 200. The only path that mutates balance has vetted the input first.", "update");

  // getBalance
  clearStates(b);
  b.calls = [{ id: "c-read", from: "main", toObjectId: obj.id, method: "getBalance()", phase: "calling" }];
  obj.fields[0].state = "found";
  b.calls[0].phase = "returned";
  b.calls[0].result = "200";
  out(b, "200");
  snapshot(b, "getBalance() returns 200. Encapsulation = hidden data + guarded methods. Had balance been public, any code could set it to −999 and break the account.", "read", {
    text: "balance = 200",
    tone: "ok",
  });

  return done(b, "Encapsulation", "encapsulation");
}

function inheritance(b: Builder): OopsProgram {
  const animal = mkClass(b, {
    id: "Animal",
    name: "Animal",
    x: 0,
    y: 0,
    members: [member("f-name", "name: String", "field", "public"), member("m-eat", "eat()", "method", "public")],
  });
  const dog = mkClass(b, {
    id: "Dog",
    name: "Dog",
    x: 0,
    y: 1,
    members: [member("m-bark", "bark()", "method", "public")],
  });
  b.relations.push({ id: "rel-ext", from: "Dog", to: "Animal", kind: "extends", state: "idle" });

  animal.state = "active";
  snapshot(b, "Dog extends Animal — IS-A. Dog automatically has everything Animal has (name, eat()) plus its own bark(). The hollow triangle points at the parent.", "base-class");
  clearStates(b);

  dog.state = "active";
  snapshot(b, "Dog only DECLARES bark(). It doesn't re-declare name or eat() — those are inherited.", "derived-class");
  clearStates(b);

  const obj = mkObject(b, "Dog", [{ name: "name", value: "?", from: "Animal", access: "public" }]);
  b.calls = [{ id: "c-new", from: "main", toClassId: "Dog", method: "new Dog()", phase: "calling" }];
  snapshot(b, "new Dog(). The object carries the Animal layer (name) AND the Dog layer — one object, both classes' state.", "new-call");

  b.calls = [];
  obj.floating = false;
  obj.fields[0].value = "Rex";
  obj.fields[0].state = "new";
  const d = mkRef(b, "dog", "Dog", obj.id);
  snapshot(b, "dog.name = \"Rex\". The inherited field is a normal part of the object.", "new-call");
  d.state = "idle";

  // bark() — own method
  clearStates(b);
  b.calls = [{ id: "c-bark", from: d.id, toObjectId: obj.id, method: "bark()", phase: "calling" }];
  dog.members[0].state = "active";
  snapshot(b, "dog.bark() — found directly on Dog. It reads the inherited name field freely.", "call-own");
  b.calls[0].phase = "returned";
  b.calls[0].result = "Rex says Woof!";
  out(b, "Rex says Woof!");
  snapshot(b, "Output: \"Rex says Woof!\".", "call-own");

  // eat() — inherited, resolution walk
  clearStates(b);
  b.calls = [{ id: "c-eat", from: d.id, toObjectId: obj.id, method: "eat()", phase: "resolving" }];
  dog.state = "target";
  snapshot(b, "dog.eat() — but Dog has no eat(). The runtime looks on Dog first and doesn't find it…", "call-inherited");

  b.relations[0].state = "active";
  animal.members[1].state = "active";
  snapshot(b, "…so it walks UP the extends arrow to Animal, where eat() lives. This lookup chain is method resolution.", "resolve");

  b.calls[0].phase = "returned";
  b.calls[0].result = "Rex is eating";
  out(b, "Rex is eating");
  snapshot(b, "Animal.eat() runs on the Dog object. Inheritance lets Dog reuse Animal's code without copying it.", "call-inherited", {
    text: "INHERITED eat() FROM Animal",
    tone: "ok",
  });

  return done(b, "Inheritance", "inheritance");
}

function overloading(b: Builder): OopsProgram {
  const printer = mkClass(b, {
    id: "Printer",
    name: "Printer",
    x: 0,
    y: 0,
    members: [
      member("m-int", "print(int)", "method", "public"),
      member("m-str", "print(String)", "method", "public"),
      member("m-two", "print(int, int)", "method", "public"),
    ],
  });

  snapshot(b, "Three methods, SAME name print, DIFFERENT parameter lists — that is overloading. They are distinct methods that happen to share a name.");

  const obj = mkObject(b, "Printer", []);
  obj.floating = false;
  obj.state = "new";
  const p = mkRef(b, "p", "Printer", obj.id);
  snapshot(b, "new Printer(); p refers to it.", "call-int");
  p.state = "idle";

  const doCall = (idx: number, method: string, anchor: string, desc: string, result: string) => {
    clearStates(b);
    b.calls = [{ id: `c-${anchor}`, from: p.id, toClassId: "Printer", method, phase: "resolving" }];
    printer.members[idx].state = "target";
    snapshot(b, desc, anchor);
    b.calls[0].phase = "returned";
    b.calls[0].result = result;
    printer.members[idx].state = "found";
    out(b, result);
    snapshot(b, `Resolved to ${printer.members[idx].name}. Output: "${result}".`, anchor);
  };

  doCall(0, "print(42)", "call-int", "p.print(42) — one int argument. The COMPILER matches the argument types against the signatures and picks print(int). No object needed to decide.", "int: 42");
  doCall(1, 'print("hello")', "call-str", "p.print(\"hello\") — a String argument selects print(String). Same name, resolved purely by the argument's type.", "String: hello");
  doCall(2, "print(3, 4)", "call-two", "p.print(3, 4) — two ints select print(int, int).", "sum: 7");

  clearStates(b);
  snapshot(b, "Overloading is resolved at COMPILE time by the signature (number/type of arguments) — contrast with overriding, which is resolved at runtime by the object.", "call-two", {
    text: "COMPILE-TIME DISPATCH",
    tone: "info",
  });

  return done(b, "Method Overloading", "overloading");
}

function overriding(b: Builder): OopsProgram {
  const animal = mkClass(b, {
    id: "Animal",
    name: "Animal",
    x: 0,
    y: 0,
    members: [member("m-speak", "speak()", "method", "public")],
  });
  const dog = mkClass(b, {
    id: "Dog",
    name: "Dog",
    x: 0,
    y: 1,
    members: [member("m-speak-d", "speak()", "method", "public", { note: "override" })],
  });
  const cat = mkClass(b, {
    id: "Cat",
    name: "Cat",
    x: 0,
    y: 2,
    members: [member("m-speak-c", "speak()", "method", "public", { note: "override" })],
  });
  b.relations.push({ id: "rel-d", from: "Dog", to: "Animal", kind: "extends", state: "idle" });
  b.relations.push({ id: "rel-c", from: "Cat", to: "Animal", kind: "extends", state: "idle" });

  animal.members[0].state = "active";
  snapshot(b, "Animal defines speak(). Dog and Cat each OVERRIDE it with their own version — same signature, replacement body.", "base-method");
  clearStates(b);
  dog.members[0].state = "active";
  snapshot(b, "Dog.speak() prints \"Woof!\" — it replaces Animal's version for Dog objects.", "dog-override");
  clearStates(b);
  cat.members[0].state = "active";
  snapshot(b, "Cat.speak() prints \"Meow!\".", "cat-override");
  clearStates(b);

  // Animal a = new Dog()
  const dogObj = mkObject(b, "Dog", [], { vtable: [{ method: "speak()", impl: "Dog::speak", state: "idle" }] });
  dogObj.floating = false;
  dogObj.state = "new";
  const a = mkRef(b, "a", "Animal", dogObj.id);
  snapshot(b, "Animal a = new Dog(). The DECLARED type is Animal, but the actual OBJECT is a Dog — its vtable routes speak() to Dog::speak.", "new-dog");
  a.state = "idle";

  clearStates(b);
  b.calls = [{ id: "c-dog", from: a.id, toObjectId: dogObj.id, method: "speak()", phase: "resolving" }];
  dogObj.vtable![0].state = "active";
  snapshot(b, "a.speak(). The declared type is Animal, but dispatch uses the OBJECT's vtable, not the reference's type. The vtable says speak → Dog::speak.", "call-dog");
  b.calls[0].phase = "returned";
  b.calls[0].result = "Woof!";
  out(b, "Woof!");
  snapshot(b, "Output: \"Woof!\". The Animal reference produced Dog behaviour — runtime polymorphism.", "call-dog");

  // a = new Cat()
  clearStates(b);
  b.heap = b.heap.filter((o) => o.id !== dogObj.id);
  const catObj = mkObject(b, "Cat", [], { vtable: [{ method: "speak()", impl: "Cat::speak", state: "idle" }] });
  catObj.floating = false;
  catObj.state = "new";
  a.targetId = catObj.id;
  a.state = "active";
  snapshot(b, "a = new Cat(). SAME reference a, SAME call site next — but now it points at a Cat, whose vtable routes speak → Cat::speak.", "new-cat");

  clearStates(b);
  b.calls = [{ id: "c-cat", from: a.id, toObjectId: catObj.id, method: "speak()", phase: "resolving" }];
  catObj.vtable![0].state = "active";
  snapshot(b, "a.speak() again — identical source line — but the vtable lookup now lands on Cat::speak.", "call-cat");
  b.calls[0].phase = "returned";
  b.calls[0].result = "Meow!";
  out(b, "Meow!");
  snapshot(b, "Output: \"Meow!\". One call site, two behaviours, chosen by the object at runtime. THIS is why overriding needs a vtable and overloading does not.", "call-cat", {
    text: "RUNTIME DISPATCH",
    tone: "ok",
  });

  return done(b, "Method Overriding", "overriding");
}

function abstraction(b: Builder): OopsProgram {
  const shape = mkClass(b, {
    id: "Shape",
    name: "Shape",
    stereotype: "abstract",
    x: 0,
    y: 0,
    members: [member("m-area", "area()", "method", "public", { isAbstract: true, note: "= 0" })],
  });
  const circle = mkClass(b, {
    id: "Circle",
    name: "Circle",
    x: 0,
    y: 1,
    members: [member("f-r", "r: double", "field", "private"), member("m-area-c", "area()", "method", "public")],
  });
  b.relations.push({ id: "rel-ext", from: "Circle", to: "Shape", kind: "extends", state: "idle" });

  shape.state = "active";
  shape.members[0].state = "target";
  snapshot(b, "Shape is ABSTRACT — «abstract» stereotype. area() is declared (italic) but has NO body. Shape says WHAT every shape must do, not HOW.", "abstract-method");
  clearStates(b);

  circle.state = "active";
  circle.members[1].state = "active";
  snapshot(b, "Circle extends Shape and provides a concrete area() = πr². It fulfils the contract.", "concrete");
  clearStates(b);

  // new Shape() blocked
  b.calls = [{ id: "c-block", from: "main", toClassId: "Shape", method: "new Shape()", phase: "blocked", note: "abstract — cannot instantiate" }];
  shape.state = "removing";
  snapshot(b, "new Shape() is REJECTED. An abstract class has an unimplemented method — there is no complete object to build. You can only instantiate concrete subclasses.", "blocked", {
    text: "CANNOT INSTANTIATE ABSTRACT",
    tone: "error",
  });

  // Shape s = new Circle(2)
  clearStates(b);
  const obj = mkObject(b, "Circle", [{ name: "r", value: "2", access: "private" }]);
  obj.floating = false;
  obj.state = "new";
  const s = mkRef(b, "s", "Shape", obj.id);
  snapshot(b, "Shape s = new Circle(2). The reference type is the abstraction (Shape); the object is a concrete Circle.", "new-circle");
  s.state = "idle";

  clearStates(b);
  b.calls = [{ id: "c-area", from: s.id, toObjectId: obj.id, method: "area()", phase: "resolving" }];
  circle.members[1].state = "active";
  obj.fields[0].state = "found";
  b.calls[0].phase = "returned";
  b.calls[0].result = "12.57";
  out(b, "12.57");
  snapshot(b, "s.area() dispatches to Circle's implementation → 12.57. Callers program against Shape and never care which concrete shape they hold.", "call-area", {
    text: "area() = 12.57",
    tone: "ok",
  });

  return done(b, "Abstraction", "abstraction");
}

// --- Advanced ----------------------------------------------------------------

function interfacesVsAbstract(b: Builder): OopsProgram {
  const swimmer = mkClass(b, {
    id: "Swimmer",
    name: "Swimmer",
    stereotype: "interface",
    x: 1,
    y: 0,
    members: [member("m-swim", "swim()", "method", "public", { isAbstract: true })],
  });
  const bird = mkClass(b, {
    id: "Bird",
    name: "Bird",
    x: 0,
    y: 0,
    members: [member("m-fly", "fly()", "method", "public")],
  });
  const duck = mkClass(b, {
    id: "Duck",
    name: "Duck",
    x: 0,
    y: 1,
    members: [member("m-swim-d", "swim()", "method", "public", { note: "impl" }), member("m-quack", "quack()", "method", "public")],
  });
  b.relations.push({ id: "rel-ext", from: "Duck", to: "Bird", kind: "extends", state: "idle" });
  b.relations.push({ id: "rel-impl", from: "Duck", to: "Swimmer", kind: "implements", state: "idle" });

  swimmer.state = "active";
  snapshot(b, "An INTERFACE is a pure contract — swim() with no body. It lists capabilities a class promises to provide, but supplies no implementation and no fields.", "interface-def");
  clearStates(b);

  bird.state = "active";
  snapshot(b, "Bird is an ordinary class with real behaviour (fly()). A class can only extend ONE class.", "base-class");
  clearStates(b);

  duck.state = "active";
  b.relations[0].state = "active";
  b.relations[1].state = "active";
  snapshot(b, "Duck EXTENDS Bird (solid triangle — inherits fly) AND IMPLEMENTS Swimmer (dashed triangle — promises swim). Interfaces are how a language without multiple class inheritance still mixes in many contracts.", "derived");
  clearStates(b);

  // new Swimmer() blocked
  b.calls = [{ id: "c-block", from: "main", toClassId: "Swimmer", method: "new Swimmer()", phase: "blocked", note: "interface — no implementation" }];
  swimmer.state = "removing";
  snapshot(b, "new Swimmer() is REJECTED — an interface has no bodies to run. You implement it, you don't instantiate it.", "blocked", {
    text: "CANNOT INSTANTIATE INTERFACE",
    tone: "error",
  });

  clearStates(b);
  const obj = mkObject(b, "Duck", [], {});
  obj.floating = false;
  obj.state = "new";
  const d = mkRef(b, "d", "Duck", obj.id);
  snapshot(b, "new Duck() — a concrete class that satisfies both the Bird base and the Swimmer contract.", "new-call");
  d.state = "idle";

  clearStates(b);
  b.calls = [{ id: "c-fly", from: d.id, toObjectId: obj.id, method: "fly()", phase: "resolving" }];
  bird.members[0].state = "active";
  b.relations[0].state = "active";
  b.calls[0].phase = "returned";
  b.calls[0].result = "flap flap";
  out(b, "flap flap");
  snapshot(b, "d.fly() resolves up to Bird — inherited implementation.", "call-fly");

  clearStates(b);
  b.calls = [{ id: "c-swim", from: d.id, toObjectId: obj.id, method: "swim()", phase: "resolving" }];
  duck.members[0].state = "active";
  b.calls[0].phase = "returned";
  b.calls[0].result = "paddle paddle";
  out(b, "paddle paddle");
  snapshot(b, "d.swim() runs Duck's own implementation of the Swimmer contract. Abstract class = partial implementation + fields + single inheritance; interface = pure contract you can mix in many times.", "call-swim", {
    text: "1 CLASS · 2 CONTRACTS",
    tone: "ok",
  });

  return done(b, "Interfaces vs Abstract Classes", "interfaces-vs-abstract");
}

function staticFinal(b: Builder): OopsProgram {
  const counter = mkClass(b, {
    id: "Counter",
    name: "Counter",
    x: 0,
    y: 0,
    statics: [{ name: "count", value: "0", state: "idle" }],
    members: [
      member("f-max", "MAX = 100", "field", "public", { isFinal: true }),
      member("f-id", "id: int", "field", "public"),
      member("m-ctor", "Counter()", "method", "public"),
    ],
  });

  counter.statics![0].state = "target";
  snapshot(b, "static count lives in the CLASS itself — ONE copy shared by every object, sitting inside the class box, not in any instance.", "static-field");
  clearStates(b);

  counter.members[0].state = "target";
  snapshot(b, "final MAX (const in C++) is set once and can never be reassigned. The 🔒 marks it read-only.", "final-field");
  clearStates(b);

  const makeOne = (name: string, anchor: string, newCount: number) => {
    clearStates(b);
    const obj = mkObject(b, "Counter", [{ name: "id", value: String(newCount), access: "public" }]);
    obj.floating = false;
    obj.state = "new";
    counter.statics![0].value = String(newCount);
    counter.statics![0].state = "new";
    const ref = mkRef(b, name, "Counter", obj.id);
    ref.state = "new";
    snapshot(b, `new Counter() → ${name}. The constructor does count++, bumping the ONE shared class-area value to ${newCount}. Each object still gets its own id.`, anchor);
  };

  makeOne("a", "new1", 1);
  makeOne("b", "new2", 2);
  makeOne("c", "new3", 3);

  clearStates(b);
  counter.statics![0].state = "found";
  out(b, "3");
  snapshot(b, "Counter.count is 3 — read straight off the class, no object required. Three objects, one shared counter.", "read", {
    text: "Counter.count = 3",
    tone: "ok",
  });

  clearStates(b);
  b.calls = [{ id: "c-final", from: "main", toObjectId: b.heap[0].id, method: "a.MAX = 200", phase: "blocked", note: "MAX is final" }];
  counter.members[0].state = "removing";
  snapshot(b, "a.MAX = 200 is REJECTED — MAX is final. Static = one-per-class storage; final = write-once. Different axes: a member can be static, final, both, or neither.", "final-blocked", {
    text: "CANNOT REASSIGN final",
    tone: "error",
  });

  return done(b, "static & final", "static-final");
}

function compositionVsInheritance(b: Builder): OopsProgram {
  const engine = mkClass(b, {
    id: "Engine",
    name: "Engine",
    x: 1,
    y: 0,
    members: [member("m-start-e", "start()", "method", "public")],
  });
  const car = mkClass(b, {
    id: "Car",
    name: "Car",
    x: 0,
    y: 0,
    members: [member("f-engine", "engine: Engine", "field", "private"), member("m-start-c", "start()", "method", "public")],
  });
  // Composition diamond sits at the WHOLE (Car).
  b.relations.push({ id: "rel-comp", from: "Engine", to: "Car", kind: "composition", state: "idle", label: "has-a" });

  engine.state = "active";
  snapshot(b, "Engine is a standalone class — the PART.", "part-class");
  clearStates(b);

  car.state = "active";
  car.members[0].state = "target";
  b.relations[0].state = "active";
  snapshot(b, "Car HAS-A Engine (filled diamond at the Car — composition). Car holds an Engine field rather than inheriting from it. This is HAS-A, not IS-A: a Car is not a kind of Engine.", "has-a");
  clearStates(b);

  // new Car() creates an Engine inside it (composition: part lives and dies with whole)
  const engineObj = mkObject(b, "Engine", []);
  engineObj.floating = false;
  engineObj.state = "new";
  snapshot(b, "new Car() first builds its Engine — with composition the part is created and owned by the whole.", "new-call");

  const carObj = mkObject(b, "Car", [{ name: "engine", value: `@${engineObj.addr}`, access: "private" }]);
  carObj.floating = false;
  carObj.state = "new";
  const carRef = mkRef(b, "car", "Car", carObj.id);
  snapshot(b, `The Car object holds a reference to its Engine (@${engineObj.addr}). car points at the Car; the Car owns the Engine.`, "new-call");
  carRef.state = "idle";

  // car.start() delegates
  clearStates(b);
  b.calls = [{ id: "c-start", from: carRef.id, toObjectId: carObj.id, method: "start()", phase: "calling" }];
  car.members[1].state = "active";
  snapshot(b, "car.start() enters Car.start()…", "call-start");

  b.calls = [{ id: "c-deleg", from: carRef.id, toObjectId: engineObj.id, method: "engine.start()", phase: "resolving" }];
  engine.members[0].state = "active";
  engineObj.state = "active";
  snapshot(b, "…which DELEGATES to engine.start() on the part it holds. Car reuses Engine's behaviour by CALLING it, not by inheriting it.", "delegate");

  b.calls[0].phase = "returned";
  b.calls[0].result = "Engine roars";
  out(b, "Engine roars");
  snapshot(b, "Output: \"Engine roars\". Composition (HAS-A) is looser than inheritance (IS-A): you can swap the Engine at runtime, and Car isn't locked into Engine's hierarchy. Guideline: favour composition over inheritance.", "call-start", {
    text: "DELEGATED TO THE PART",
    tone: "ok",
  });

  return done(b, "Composition vs Inheritance", "composition-vs-inheritance");
}

// --- Design Patterns ---------------------------------------------------------

function singleton(b: Builder): OopsProgram {
  const db = mkClass(b, {
    id: "Database",
    name: "Database",
    x: 0,
    y: 0,
    statics: [{ name: "instance", value: "null", state: "idle" }],
    members: [
      member("m-ctor", "Database()", "method", "private"),
      member("m-get", "getInstance()", "method", "public", { isStatic: true }),
    ],
  });

  db.statics![0].state = "target";
  snapshot(b, "A Singleton keeps ONE shared instance in a static field, starting null.", "static-instance");
  clearStates(b);

  db.members[0].state = "target";
  snapshot(b, "The constructor is PRIVATE — outside code cannot call new Database(). The only way in is getInstance().", "private-ctor");
  clearStates(b);

  // first getInstance()
  b.calls = [{ id: "c-1", from: "main", toClassId: "Database", method: "getInstance()", phase: "resolving" }];
  db.statics![0].state = "active";
  snapshot(b, "a = getInstance(). It checks: is instance null? Yes — so it must create the one object now.", "first-call");

  const obj = mkObject(b, "Database", []);
  obj.floating = false;
  obj.state = "new";
  db.statics![0].value = `@${obj.addr}`;
  db.statics![0].state = "new";
  snapshot(b, `instance = new Database() runs ONCE (lazily). The static field now stores @${obj.addr}.`, "create");

  const a = mkRef(b, "a", "Database", obj.id);
  b.calls = [];
  snapshot(b, `getInstance() returns the instance; a holds @${obj.addr}.`, "first-call");
  a.state = "idle";

  // second getInstance()
  clearStates(b);
  b.calls = [{ id: "c-2", from: "main", toClassId: "Database", method: "getInstance()", phase: "resolving" }];
  db.statics![0].state = "found";
  snapshot(b, "b = getInstance() again. This time instance is NOT null — so it skips construction entirely.", "second-call");

  const bRef = mkRef(b, "b", "Database", obj.id);
  bRef.state = "new";
  snapshot(b, `It returns the SAME stored @${obj.addr}. b points at the identical object a does.`, "second-call");

  clearStates(b);
  a.state = "found";
  bRef.state = "found";
  obj.state = "found";
  out(b, "true");
  snapshot(b, "a == b is true — both references converge on one object. Use Singletons sparingly: they are global state in disguise and complicate testing.", "same", {
    text: "ONE INSTANCE · a == b",
    tone: "ok",
  });

  return done(b, "Singleton", "singleton");
}

function factoryMethod(b: Builder): OopsProgram {
  const shape = mkClass(b, { id: "Shape", name: "Shape", stereotype: "interface", x: 0, y: 0, members: [member("m-draw", "draw()", "method", "public", { isAbstract: true })] });
  const circle = mkClass(b, { id: "Circle", name: "Circle", x: 1, y: 0, members: [member("m-draw-c", "draw()", "method", "public")] });
  const square = mkClass(b, { id: "Square", name: "Square", x: 1, y: 1, members: [member("m-draw-s", "draw()", "method", "public")] });
  const factory = mkClass(b, { id: "ShapeFactory", name: "ShapeFactory", x: 0, y: 1, members: [member("m-create", "create(type)", "method", "public", { isStatic: true })] });
  b.relations.push({ id: "r-c", from: "Circle", to: "Shape", kind: "implements", state: "idle" });
  b.relations.push({ id: "r-s", from: "Square", to: "Shape", kind: "implements", state: "idle" });

  shape.state = "active";
  snapshot(b, "Shape is the product interface. Circle and Square are concrete products that implement it.", "product-interface");
  clearStates(b);

  factory.state = "active";
  factory.members[0].state = "target";
  snapshot(b, "ShapeFactory.create(type) is the FACTORY METHOD. The client asks it for a Shape and never calls new on a concrete class itself.", "factory");
  clearStates(b);

  b.calls = [{ id: "c-create", from: "main", toClassId: "ShapeFactory", method: 'create("circle")', phase: "resolving" }];
  factory.members[0].state = "active";
  snapshot(b, 'Shape s = ShapeFactory.create("circle"). The call enters the factory…', "create-call");

  const obj = mkObject(b, "Circle", []);
  obj.floating = false;
  obj.state = "new";
  circle.state = "active";
  snapshot(b, "…which decides the concrete class — for \"circle\" it does new Circle() — and returns it as a Shape.", "create-circle");

  const s = mkRef(b, "s", "Shape", obj.id);
  b.calls = [];
  snapshot(b, "s is typed Shape but points at a Circle. The client is decoupled from the concrete class.", "create-call");
  s.state = "idle";

  clearStates(b);
  b.calls = [{ id: "c-draw", from: s.id, toObjectId: obj.id, method: "draw()", phase: "resolving" }];
  circle.members[0].state = "active";
  b.calls[0].phase = "returned";
  b.calls[0].result = "O";
  out(b, "O");
  snapshot(b, "s.draw() runs Circle.draw(). Swap the factory's logic and the client code never changes — that is the point.", "use", {
    text: "FACTORY CHOSE Circle",
    tone: "ok",
  });

  return done(b, "Factory Method", "factory-method");
}

function observer(b: Builder): OopsProgram {
  const channel = mkClass(b, {
    id: "Channel",
    name: "Channel",
    x: 0,
    y: 0,
    members: [member("f-subs", "subs: List", "field", "public"), member("m-attach", "attach(o)", "method", "public"), member("m-detach", "detach(o)", "method", "public"), member("m-pub", "publish(news)", "method", "public")],
  });
  mkClass(b, { id: "Observer", name: "Observer", stereotype: "interface", x: 0, y: 1, members: [member("m-upd", "update(news)", "method", "public", { isAbstract: true })] });

  channel.state = "active";
  snapshot(b, "A Channel (the subject) keeps a list of Observers and notifies them all when something happens.", "subject");
  clearStates(b);

  const chanObj = mkObject(b, "Channel", [{ name: "subs", value: "[]", access: "public" }]);
  chanObj.floating = false;
  chanObj.state = "new";
  const c = mkRef(b, "c", "Channel", chanObj.id);
  const alice = mkObject(b, "Subscriber", [{ name: "name", value: "Alice", access: "public" }]);
  alice.floating = false;
  const bob = mkObject(b, "Subscriber", [{ name: "name", value: "Bob", access: "public" }]);
  bob.floating = false;
  chanObj.fields[0].value = `[@${alice.addr}, @${bob.addr}]`;
  chanObj.fields[0].state = "new";
  snapshot(b, "Alice and Bob subscribe: c.attach(a); c.attach(b). The Channel's subs list now holds both.", "attach");
  c.state = "idle";

  // publish 1 -> both
  clearStates(b);
  b.calls = [{ id: "p1a", from: c.id, toObjectId: alice.id, method: "update(Ep 1)", phase: "resolving" }];
  alice.state = "active";
  out(b, "Alice got: Episode 1");
  snapshot(b, "c.publish(\"Episode 1\") loops the subs list and notifies the first observer, Alice.", "publish1");

  b.calls = [{ id: "p1b", from: c.id, toObjectId: bob.id, method: "update(Ep 1)", phase: "resolving" }];
  alice.state = "idle";
  bob.state = "active";
  out(b, "Bob got: Episode 1");
  snapshot(b, "…then Bob. One event, fanned out to every subscriber — the publishers don't know who's listening.", "notify");

  // detach bob
  clearStates(b);
  bob.state = "removing";
  chanObj.fields[0].value = `[@${alice.addr}]`;
  chanObj.fields[0].state = "removing";
  snapshot(b, "c.detach(b) removes Bob from the subs list. He's still a valid object — just no longer subscribed.", "detach");

  // publish 2 -> only alice
  clearStates(b);
  bob.state = "visited";
  b.calls = [{ id: "p2", from: c.id, toObjectId: alice.id, method: "update(Ep 2)", phase: "resolving" }];
  alice.state = "active";
  out(b, "Alice got: Episode 2");
  snapshot(b, "c.publish(\"Episode 2\") now reaches only Alice — Bob is skipped. Observers can come and go without the subject changing.", "publish2", {
    text: "1 SUBSCRIBER NOTIFIED",
    tone: "ok",
  });

  return done(b, "Observer", "observer");
}

function strategy(b: Builder): OopsProgram {
  mkClass(b, { id: "Sorter", name: "Sorter", stereotype: "interface", x: 0, y: 0, members: [member("m-sort", "sort()", "method", "public", { isAbstract: true })] });
  const quick = mkClass(b, { id: "QuickSort", name: "QuickSort", x: 1, y: 0, members: [member("m-sort-q", "sort()", "method", "public")] });
  const bubble = mkClass(b, { id: "BubbleSort", name: "BubbleSort", x: 1, y: 1, members: [member("m-sort-b", "sort()", "method", "public")] });
  const ctxCls = mkClass(b, { id: "Context", name: "Context", x: 0, y: 1, members: [member("f-strat", "strategy: Sorter", "field", "private"), member("m-set", "setStrategy(s)", "method", "public"), member("m-run", "run()", "method", "public")] });

  ctxCls.state = "active";
  snapshot(b, "A Context holds a Sorter STRATEGY as a field and delegates the work to whatever object is plugged in.", "context");
  clearStates(b);

  const ctxObj = mkObject(b, "Context", [{ name: "strategy", value: "null", access: "private" }]);
  ctxObj.floating = false;
  ctxObj.state = "new";
  const ctx = mkRef(b, "ctx", "Context", ctxObj.id);
  snapshot(b, "new Context(); no strategy plugged in yet.", "context");
  ctx.state = "idle";

  // set quick
  clearStates(b);
  const quickObj = mkObject(b, "QuickSort", []);
  quickObj.floating = false;
  quickObj.state = "new";
  ctxObj.fields[0].value = `@${quickObj.addr}`;
  ctxObj.fields[0].state = "new";
  snapshot(b, `ctx.setStrategy(new QuickSort()) plugs a QuickSort object in — the strategy field now points at @${quickObj.addr}.`, "set-quick");

  clearStates(b);
  b.calls = [{ id: "r-q", from: ctx.id, toObjectId: quickObj.id, method: "sort()", phase: "resolving" }];
  quick.members[0].state = "active";
  out(b, "quicksort");
  snapshot(b, "ctx.run() delegates to strategy.sort() → QuickSort runs.", "run-quick");

  // swap to bubble
  clearStates(b);
  b.heap = b.heap.filter((o) => o.id !== quickObj.id);
  const bubbleObj = mkObject(b, "BubbleSort", []);
  bubbleObj.floating = false;
  bubbleObj.state = "new";
  ctxObj.fields[0].value = `@${bubbleObj.addr}`;
  ctxObj.fields[0].state = "active";
  snapshot(b, "ctx.setStrategy(new BubbleSort()) REWIRES the same field to a BubbleSort object — swapped at runtime, no code change in Context.", "set-bubble");

  clearStates(b);
  b.calls = [{ id: "r-b", from: ctx.id, toObjectId: bubbleObj.id, method: "sort()", phase: "resolving" }];
  bubble.members[0].state = "active";
  out(b, "bubblesort");
  snapshot(b, "ctx.run() now delegates to BubbleSort. Same call site, different algorithm object — that's Strategy.", "run-bubble", {
    text: "ALGORITHM SWAPPED",
    tone: "ok",
  });

  return done(b, "Strategy", "strategy");
}

function decorator(b: Builder): OopsProgram {
  mkClass(b, { id: "Coffee", name: "Coffee", stereotype: "interface", x: 0, y: 0, members: [member("m-cost", "cost()", "method", "public", { isAbstract: true })] });
  const espresso = mkClass(b, { id: "Espresso", name: "Espresso", x: 1, y: 0, members: [member("m-cost-e", "cost() = 5", "method", "public")] });
  const milk = mkClass(b, { id: "Milk", name: "Milk", x: 1, y: 1, members: [member("f-in-m", "inner: Coffee", "field", "private"), member("m-cost-m", "cost() +1.5", "method", "public")] });
  const sugar = mkClass(b, { id: "Sugar", name: "Sugar", x: 1, y: 2, members: [member("f-in-s", "inner: Coffee", "field", "private"), member("m-cost-s", "cost() +0.5", "method", "public")] });

  snapshot(b, "A Decorator wraps another Coffee and ADDS to its behaviour. Milk and Sugar each hold an inner Coffee and add to its cost.", "component");

  const esObj = mkObject(b, "Espresso", []);
  esObj.floating = false;
  esObj.state = "new";
  const milkObj = mkObject(b, "Milk", [{ name: "inner", value: `@${esObj.addr}`, access: "private" }]);
  milkObj.floating = false;
  milkObj.state = "new";
  const sugarObj = mkObject(b, "Sugar", [{ name: "inner", value: `@${milkObj.addr}`, access: "private" }]);
  sugarObj.floating = false;
  sugarObj.state = "new";
  const c = mkRef(b, "c", "Coffee", sugarObj.id);
  snapshot(b, "new Sugar(new Milk(new Espresso())) nests three objects: Sugar wraps Milk wraps Espresso. Each holds a reference to the one it wraps.", "wrap");
  c.state = "idle";

  // cost() cascade inward
  clearStates(b);
  b.calls = [{ id: "cs", from: c.id, toObjectId: sugarObj.id, method: "cost()", phase: "calling" }];
  sugar.members[1].state = "active";
  snapshot(b, "c.cost() calls Sugar.cost(), which first asks its inner (Milk) for its cost…", "cost-sugar");

  b.calls = [{ id: "cm", from: sugarObj.id, toObjectId: milkObj.id, method: "cost()", phase: "calling" }];
  milk.members[1].state = "active";
  snapshot(b, "…Milk.cost() asks ITS inner (Espresso)…", "cost-milk");

  b.calls = [{ id: "ce", from: milkObj.id, toObjectId: esObj.id, method: "cost()", phase: "resolving" }];
  espresso.members[0].state = "active";
  esObj.state = "found";
  b.calls[0].phase = "returned";
  b.calls[0].result = "5";
  snapshot(b, "…Espresso.cost() returns 5. The base case — the recursion bottoms out.", "cost-espresso");

  // accumulate back out
  clearStates(b);
  milkObj.state = "found";
  b.calls = [{ id: "cm2", from: sugarObj.id, toObjectId: milkObj.id, method: "cost()", phase: "returned", result: "6.5" }];
  snapshot(b, "Back out: Milk adds 1.5 → 6.5.", "cost-milk");

  clearStates(b);
  sugarObj.state = "found";
  b.calls = [{ id: "cs2", from: c.id, toObjectId: sugarObj.id, method: "cost()", phase: "returned", result: "7" }];
  out(b, "7.0");
  snapshot(b, "Sugar adds 0.5 → 7. Each decorator layered ON behaviour without modifying Espresso or the others. Stack wrappers in any order for any combination.", "result", {
    text: "5 → 6.5 → 7",
    tone: "ok",
  });

  return done(b, "Decorator", "decorator");
}

// --- SOLID -------------------------------------------------------------------
// Class-area-only stories: show a VIOLATION arrangement, then refactor to the
// SOLID version. No heap/refs — just class boxes + relations + code anchors.

function resetArea(b: Builder): void {
  b.classes = [];
  b.relations = [];
  b.calls = [];
}

function srp(b: Builder): OopsProgram {
  const god = mkClass(b, {
    id: "Report",
    name: "Report",
    x: 0,
    y: 0,
    state: "removing",
    members: [
      member("m-gen", "generate()", "method", "public"),
      member("m-fmt", "formatHtml()", "method", "public", { note: "formatting" }),
      member("m-save", "saveToFile()", "method", "public", { note: "persistence" }),
      member("m-mail", "email()", "method", "public", { note: "delivery" }),
    ],
  });
  god.members.forEach((m) => (m.state = "removing"));
  snapshot(b, "VIOLATION: this Report does FOUR jobs — generate, format, persist, deliver. It has four reasons to change; a tweak to email formatting risks breaking file saving.", "bad", {
    text: "1 CLASS · 4 RESPONSIBILITIES",
    tone: "error",
  });

  resetArea(b);
  mkClass(b, { id: "Report", name: "Report", x: 0, y: 0, members: [member("m-gen", "generate()", "method", "public")] });
  mkClass(b, { id: "ReportFormatter", name: "ReportFormatter", x: 1, y: 0, members: [member("m-html", "toHtml(r)", "method", "public")] });
  mkClass(b, { id: "ReportSaver", name: "ReportSaver", x: 0, y: 1, members: [member("m-save", "save(r)", "method", "public")] });
  mkClass(b, { id: "ReportMailer", name: "ReportMailer", x: 1, y: 1, members: [member("m-mail", "email(r)", "method", "public")] });
  b.classes.forEach((c) => (c.state = "new"));
  snapshot(b, "REFACTOR: split by responsibility. Each class now has ONE reason to change. Formatting changes touch only ReportFormatter; the others are untouched.", "good", {
    text: "1 CLASS · 1 RESPONSIBILITY",
    tone: "ok",
  });

  return done(b, "Single Responsibility", "single-responsibility");
}

function ocp(b: Builder): OopsProgram {
  const calc = mkClass(b, {
    id: "AreaCalc",
    name: "AreaCalc",
    x: 0,
    y: 0,
    state: "removing",
    members: [member("m-area", "area(s)", "method", "public", { note: "if/else per type" })],
  });
  calc.members[0].state = "removing";
  snapshot(b, "VIOLATION: AreaCalc.area() has an if/else chain over shape types. Every NEW shape forces you to MODIFY this method — it is not closed for modification.", "bad", {
    text: "EDIT REQUIRED PER SHAPE",
    tone: "error",
  });

  resetArea(b);
  const shape = mkClass(b, { id: "Shape", name: "Shape", stereotype: "interface", x: 0, y: 0, members: [member("m-area", "area()", "method", "public", { isAbstract: true })] });
  const circle = mkClass(b, { id: "Circle", name: "Circle", x: 1, y: 0, members: [member("m-area-c", "area()", "method", "public")] });
  const square = mkClass(b, { id: "Square", name: "Square", x: 1, y: 1, members: [member("m-area-s", "area()", "method", "public")] });
  const tri = mkClass(b, { id: "Triangle", name: "Triangle", x: 1, y: 2, state: "new", members: [member("m-area-t", "area()", "method", "public")] });
  b.relations.push({ id: "r-c", from: "Circle", to: "Shape", kind: "implements", state: "idle" });
  b.relations.push({ id: "r-s", from: "Square", to: "Shape", kind: "implements", state: "idle" });
  b.relations.push({ id: "r-t", from: "Triangle", to: "Shape", kind: "implements", state: "new" });
  shape.state = "active";
  circle.state = "idle";
  square.state = "idle";
  snapshot(b, "REFACTOR: each shape implements Shape.area() itself. Adding Triangle just adds a new class — existing code is OPEN for extension, CLOSED for modification.", "good", {
    text: "EXTEND WITHOUT EDITING",
    tone: "ok",
  });

  void tri;
  return done(b, "Open/Closed", "open-closed");
}

function lsp(b: Builder): OopsProgram {
  const rect = mkClass(b, { id: "Rectangle", name: "Rectangle", x: 0, y: 0, members: [member("m-sw", "setW(x)", "method", "public"), member("m-sh", "setH(x)", "method", "public"), member("m-area", "area()", "method", "public")] });
  const sq = mkClass(b, { id: "Square", name: "Square", x: 0, y: 1, state: "removing", members: [member("m-sw", "setW(x)", "method", "public", { note: "sets BOTH" })] });
  b.relations.push({ id: "r-ext", from: "Square", to: "Rectangle", kind: "extends", state: "removing" });
  sq.members[0].state = "removing";
  out(b, "area = 16 (expected 20)");
  snapshot(b, "VIOLATION: Square extends Rectangle but overrides setW to also change height. Code that trusts the Rectangle contract — setW(5); setH(4) → area 20 — gets 16 instead. A subtype must be substitutable for its base.", "bad", {
    text: "SUBTYPE BREAKS CONTRACT",
    tone: "error",
  });
  void rect;

  resetArea(b);
  const shape = mkClass(b, { id: "Shape", name: "Shape", stereotype: "interface", x: 0, y: 0, members: [member("m-area", "area()", "method", "public", { isAbstract: true })] });
  mkClass(b, { id: "Rectangle", name: "Rectangle", x: 1, y: 0, state: "new", members: [member("m-area", "area()", "method", "public")] });
  mkClass(b, { id: "Square", name: "Square", x: 1, y: 1, state: "new", members: [member("m-area", "area()", "method", "public")] });
  b.relations.push({ id: "r1", from: "Rectangle", to: "Shape", kind: "implements", state: "new" });
  b.relations.push({ id: "r2", from: "Square", to: "Shape", kind: "implements", state: "new" });
  shape.state = "active";
  snapshot(b, "REFACTOR: don't force a false IS-A. Rectangle and Square each implement Shape independently — neither pretends to be substitutable for the other, and no caller is surprised.", "good", {
    text: "SUBSTITUTABILITY RESTORED",
    tone: "ok",
  });

  return done(b, "Liskov Substitution", "liskov-substitution");
}

function isp(b: Builder): OopsProgram {
  const worker = mkClass(b, { id: "Worker", name: "Worker", stereotype: "interface", x: 0, y: 0, state: "removing", members: [member("m-work", "work()", "method", "public", { isAbstract: true }), member("m-eat", "eat()", "method", "public", { isAbstract: true })] });
  const robot = mkClass(b, { id: "Robot", name: "Robot", x: 0, y: 1, members: [member("m-work", "work()", "method", "public"), member("m-eat", "eat()", "method", "public", { note: "forced stub" })] });
  b.relations.push({ id: "r-impl", from: "Robot", to: "Worker", kind: "implements", state: "removing" });
  worker.members[1].state = "removing";
  robot.members[1].state = "removing";
  snapshot(b, "VIOLATION: the fat Worker interface bundles work() AND eat(). A Robot is forced to implement eat() with a meaningless stub — it depends on a method it does not need.", "bad", {
    text: "FORCED TO IMPLEMENT eat()",
    tone: "error",
  });

  resetArea(b);
  const workable = mkClass(b, { id: "Workable", name: "Workable", stereotype: "interface", x: 0, y: 0, state: "new", members: [member("m-work", "work()", "method", "public", { isAbstract: true })] });
  const eatable = mkClass(b, { id: "Eatable", name: "Eatable", stereotype: "interface", x: 1, y: 0, state: "new", members: [member("m-eat", "eat()", "method", "public", { isAbstract: true })] });
  mkClass(b, { id: "Human", name: "Human", x: 0, y: 1, members: [member("m-work", "work()", "method", "public"), member("m-eat", "eat()", "method", "public")] });
  const robot2 = mkClass(b, { id: "Robot2", name: "Robot", x: 1, y: 1, members: [member("m-work", "work()", "method", "public")] });
  b.relations.push({ id: "r1", from: "Human", to: "Workable", kind: "implements", state: "idle" });
  b.relations.push({ id: "r2", from: "Human", to: "Eatable", kind: "implements", state: "idle" });
  b.relations.push({ id: "r3", from: "Robot2", to: "Workable", kind: "implements", state: "new" });
  workable.state = "active";
  eatable.state = "active";
  robot2.state = "new";
  snapshot(b, "REFACTOR: split into small, focused interfaces. A Human implements both Workable and Eatable; the Robot implements ONLY Workable. No client depends on methods it doesn't use.", "good", {
    text: "IMPLEMENT ONLY WHAT YOU NEED",
    tone: "ok",
  });

  return done(b, "Interface Segregation", "interface-segregation");
}

function dip(b: Builder): OopsProgram {
  const notifier = mkClass(b, { id: "Notifier", name: "Notifier", x: 0, y: 0, members: [member("m-alert", "alert(m)", "method", "public")] });
  const email = mkClass(b, { id: "EmailSender", name: "EmailSender", x: 0, y: 1, members: [member("m-send", "send(m)", "method", "public")] });
  b.relations.push({ id: "r-dep", from: "Notifier", to: "EmailSender", kind: "dependency", state: "removing", label: "new EmailSender()" });
  notifier.state = "target";
  email.state = "removing";
  snapshot(b, "VIOLATION: the high-level Notifier depends directly on the concrete EmailSender (it news one up). To send SMS instead, you must edit Notifier. High-level policy is chained to a low-level detail.", "bad", {
    text: "HIGH-LEVEL → CONCRETE",
    tone: "error",
  });

  resetArea(b);
  // The arrow FLIPS: both now point at the abstraction.
  const iface = mkClass(b, { id: "MessageSender", name: "MessageSender", stereotype: "interface", x: 1, y: 0, members: [member("m-send", "send(m)", "method", "public", { isAbstract: true })] });
  const notifier2 = mkClass(b, { id: "Notifier2", name: "Notifier", x: 0, y: 0, members: [member("m-alert", "alert(m)", "method", "public", { note: "injected" })] });
  mkClass(b, { id: "EmailSender2", name: "EmailSender", x: 2, y: 1, members: [member("m-send", "send(m)", "method", "public")] });
  mkClass(b, { id: "SmsSender", name: "SmsSender", x: 1, y: 1, members: [member("m-send", "send(m)", "method", "public")] });
  b.relations.push({ id: "r-dep2", from: "Notifier2", to: "MessageSender", kind: "dependency", state: "new", label: "depends on" });
  b.relations.push({ id: "r-e", from: "EmailSender2", to: "MessageSender", kind: "implements", state: "new" });
  b.relations.push({ id: "r-s", from: "SmsSender", to: "MessageSender", kind: "implements", state: "new" });
  iface.state = "active";
  notifier2.state = "target";
  snapshot(b, "REFACTOR: introduce a MessageSender interface. Now the dependency arrow FLIPS — Notifier depends on the abstraction, and EmailSender/SmsSender implement it. Both high and low level depend on the abstraction; you swap senders without touching Notifier.", "good", {
    text: "BOTH → ABSTRACTION",
    tone: "ok",
  });

  return done(b, "Dependency Inversion", "dependency-inversion");
}

// --- Dispatch ----------------------------------------------------------------

export function runOopsOperation(op: OopsOperationId): OopsProgram {
  const b = newBuilder();
  switch (op) {
    case "classesObjects":
      return classesObjects(b);
    case "constructors":
      return constructors(b);
    case "thisReferences":
      return thisReferences(b);
    case "accessModifiers":
      return accessModifiers(b);
    case "encapsulation":
      return encapsulation(b);
    case "inheritance":
      return inheritance(b);
    case "overloading":
      return overloading(b);
    case "overriding":
      return overriding(b);
    case "abstraction":
      return abstraction(b);
    case "interfacesVsAbstract":
      return interfacesVsAbstract(b);
    case "staticFinal":
      return staticFinal(b);
    case "compositionVsInheritance":
      return compositionVsInheritance(b);
    case "singleton":
      return singleton(b);
    case "factoryMethod":
      return factoryMethod(b);
    case "observer":
      return observer(b);
    case "strategy":
      return strategy(b);
    case "decorator":
      return decorator(b);
    case "srp":
      return srp(b);
    case "ocp":
      return ocp(b);
    case "lsp":
      return lsp(b);
    case "isp":
      return isp(b);
    case "dip":
      return dip(b);
    default:
      return classesObjects(b);
  }
}

export interface OopsOperationMeta {
  id: OopsOperationId;
  label: string;
  icon: string;
  hint: string;
}

export const OOPS_OPERATIONS: OopsOperationMeta[] = [
  { id: "classesObjects", label: "Classes & Objects", icon: "deployed_code", hint: "A class is a blueprint; new stamps objects onto the heap." },
  { id: "constructors", label: "Constructors", icon: "build", hint: "Objects are built base → derived; destroyed in reverse." },
  { id: "thisReferences", label: "this & References", icon: "alt_route", hint: "Two references, one object — aliasing and GC." },
  { id: "accessModifiers", label: "Access Modifiers", icon: "lock", hint: "public / private / protected — who may touch what." },
  { id: "encapsulation", label: "Encapsulation", icon: "shield", hint: "Guard state behind methods — invariants survive bad input." },
  { id: "inheritance", label: "Inheritance", icon: "account_tree", hint: "IS-A: a derived object reuses its parent's fields and methods." },
  { id: "overloading", label: "Method Overloading", icon: "call_split", hint: "Same name, different signatures — resolved at compile time." },
  { id: "overriding", label: "Method Overriding", icon: "sync_alt", hint: "The object's vtable picks the method at runtime." },
  { id: "abstraction", label: "Abstraction", icon: "category", hint: "Declare the WHAT, hide the HOW — abstract classes can't be instantiated." },
  { id: "interfacesVsAbstract", label: "Interfaces vs Abstract", icon: "handshake", hint: "Contract vs half-built class — and multiple inheritance done right." },
  { id: "staticFinal", label: "static & final", icon: "pin", hint: "Class-area members: one per CLASS, and write-once constants." },
  { id: "compositionVsInheritance", label: "Composition vs Inheritance", icon: "widgets", hint: "HAS-A vs IS-A — and why composition often wins." },
  { id: "singleton", label: "Singleton", icon: "looks_one", hint: "One instance, globally reachable — created lazily once." },
  { id: "factoryMethod", label: "Factory Method", icon: "precision_manufacturing", hint: "Let a factory decide which concrete object to create." },
  { id: "observer", label: "Observer", icon: "podcasts", hint: "One subject changes; every subscriber is notified." },
  { id: "strategy", label: "Strategy", icon: "swap_calls", hint: "Swap the algorithm object at runtime." },
  { id: "decorator", label: "Decorator", icon: "layers", hint: "Wrap objects in objects — stack behaviour in layers." },
  { id: "srp", label: "Single Responsibility", icon: "filter_1", hint: "One class, one reason to change." },
  { id: "ocp", label: "Open/Closed", icon: "lock_open", hint: "Open to extension, closed to modification." },
  { id: "lsp", label: "Liskov Substitution", icon: "swap_vert", hint: "Subtypes must be drop-in replacements for their base." },
  { id: "isp", label: "Interface Segregation", icon: "call_split", hint: "No client forced to depend on methods it doesn't use." },
  { id: "dip", label: "Dependency Inversion", icon: "flip", hint: "Depend on abstractions, not concretions." },
];
