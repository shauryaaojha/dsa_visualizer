import type { OopsCodeEntry } from "./types";

// OOP · SOLID — each sample shows the VIOLATION and the REFACTOR together, with
// `bad` and `good` anchors so the visualizer can highlight one then the other.

export const SOLID_CODE: OopsCodeEntry[] = [
  {
    key: "single-responsibility",
    title: "Single Responsibility",
    samples: {
      java: {
        code: `// VIOLATION: one class, three reasons to change
class Report {
    void generate() {}
    String formatHtml() { return ""; }  // formatting
    void saveToFile() {}                // persistence
    void email() {}                     // delivery
}

// REFACTOR: one responsibility each
class Report          { void generate() {} }
class ReportFormatter { String toHtml(Report r) { return ""; } }
class ReportSaver     { void save(Report r) {} }
class ReportMailer    { void email(Report r) {} }`,
        lines: { bad: [2, 3, 4, 5, 6, 7], good: [10, 11, 12, 13] },
      },
      cpp: {
        code: `// VIOLATION: one class, three reasons to change
struct Report {
    void generate() {}
    string formatHtml() { return ""; }  // formatting
    void saveToFile() {}                // persistence
    void email() {}                     // delivery
};

// REFACTOR: one responsibility each
struct Report          { void generate() {} };
struct ReportFormatter { string toHtml(Report& r) { return ""; } };
struct ReportSaver     { void save(Report& r) {} };
struct ReportMailer    { void email(Report& r) {} };`,
        lines: { bad: [2, 3, 4, 5, 6, 7], good: [10, 11, 12, 13] },
      },
      python: {
        code: `# VIOLATION: one class, three reasons to change
class Report:
    def generate(self): ...
    def format_html(self): ...   # formatting
    def save_to_file(self): ...  # persistence
    def email(self): ...         # delivery


# REFACTOR: one responsibility each
class Report:
    def generate(self): ...
class ReportFormatter:
    def to_html(self, r): ...
class ReportSaver:
    def save(self, r): ...
class ReportMailer:
    def email(self, r): ...`,
        lines: { bad: [2, 3, 4, 5, 6], good: [10, 11, 12, 13, 14, 15, 16, 17] },
      },
    },
  },
  {
    key: "open-closed",
    title: "Open/Closed",
    samples: {
      java: {
        code: `// VIOLATION: must EDIT this method for every new shape
class AreaCalc {
    double area(Shape s) {
        if (s instanceof Circle) return 3.14 * r * r;
        if (s instanceof Square) return side * side;
        return 0;   // add Triangle? edit here again
    }
}

// REFACTOR: open for extension, closed for modification
interface Shape { double area(); }
class Circle implements Shape { public double area() { return 3.14 * r * r; } }
class Square implements Shape { public double area() { return side * side; } }
// new Triangle implements Shape — AreaCalc never changes`,
        lines: { bad: [2, 3, 4, 5, 6, 7, 8], good: [11, 12, 13, 14] },
      },
      cpp: {
        code: `// VIOLATION: must EDIT this for every new shape
struct AreaCalc {
    double area(Shape* s) {
        if (dynamic_cast<Circle*>(s)) return 3.14 * r * r;
        if (dynamic_cast<Square*>(s)) return side * side;
        return 0;
    }
};

// REFACTOR: open for extension, closed for modification
struct Shape { virtual double area() = 0; };
struct Circle : Shape { double area() override { return 3.14 * r * r; } };
struct Square : Shape { double area() override { return side * side; } };
// new Triangle : Shape — AreaCalc never changes`,
        lines: { bad: [2, 3, 4, 5, 6, 7, 8], good: [11, 12, 13, 14] },
      },
      python: {
        code: `# VIOLATION: must EDIT this for every new shape
class AreaCalc:
    def area(self, s):
        if isinstance(s, Circle): return 3.14 * s.r ** 2
        if isinstance(s, Square): return s.side ** 2
        return 0


# REFACTOR: open for extension, closed for modification
class Shape:
    def area(self): ...
class Circle(Shape):
    def area(self): return 3.14 * self.r ** 2
class Square(Shape):
    def area(self): return self.side ** 2
# new Triangle(Shape) — no existing code changes`,
        lines: { bad: [2, 3, 4, 5, 6], good: [10, 11, 12, 13, 14, 15] },
      },
    },
  },
  {
    key: "liskov-substitution",
    title: "Liskov Substitution",
    samples: {
      java: {
        code: `// VIOLATION: Square breaks Rectangle's contract
class Rectangle {
    int w, h;
    void setW(int x) { w = x; }
    void setH(int x) { h = x; }
    int area() { return w * h; }
}
class Square extends Rectangle {
    void setW(int x) { w = h = x; }   // surprises callers
    void setH(int x) { w = h = x; }
}
// r.setW(5); r.setH(4); area()==16, expected 20

// REFACTOR: don't force a false IS-A
interface Shape { int area(); }
class Rectangle2 implements Shape { /* w,h independent */ }
class Square2    implements Shape { /* one side */ }`,
        lines: { bad: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], good: [15, 16, 17] },
      },
      cpp: {
        code: `// VIOLATION: Square breaks Rectangle's contract
struct Rectangle {
    int w, h;
    virtual void setW(int x) { w = x; }
    virtual void setH(int x) { h = x; }
    int area() { return w * h; }
};
struct Square : Rectangle {
    void setW(int x) override { w = h = x; }   // surprise
    void setH(int x) override { w = h = x; }
};
// r.setW(5); r.setH(4); area()==16, expected 20

// REFACTOR: don't force a false IS-A
struct Shape { virtual int area() = 0; };
struct Rectangle2 : Shape { /* w,h independent */ };
struct Square2    : Shape { /* one side */ };`,
        lines: { bad: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], good: [15, 16, 17] },
      },
      python: {
        code: `# VIOLATION: Square breaks Rectangle's contract
class Rectangle:
    def set_w(self, x): self.w = x
    def set_h(self, x): self.h = x
    def area(self): return self.w * self.h
class Square(Rectangle):
    def set_w(self, x): self.w = self.h = x   # surprise
    def set_h(self, x): self.w = self.h = x
# r.set_w(5); r.set_h(4); area()==16, expected 20

# REFACTOR: don't force a false IS-A
class Shape:
    def area(self): ...
class Rectangle2(Shape): ...   # w,h independent
class Square2(Shape): ...      # one side`,
        lines: { bad: [2, 3, 4, 5, 6, 7, 8, 9], good: [12, 13, 14, 15] },
      },
    },
  },
  {
    key: "interface-segregation",
    title: "Interface Segregation",
    samples: {
      java: {
        code: `// VIOLATION: a fat interface forces unused methods
interface Worker {
    void work();
    void eat();
}
class Robot implements Worker {
    public void work() {}
    public void eat() {}   // robots don't eat — forced stub
}

// REFACTOR: small, focused interfaces
interface Workable { void work(); }
interface Eatable  { void eat(); }
class Human implements Workable, Eatable { /* both */ }
class Robot2 implements Workable { /* only work */ }`,
        lines: { bad: [2, 3, 4, 5, 6, 7, 8, 9], good: [12, 13, 14, 15] },
      },
      cpp: {
        code: `// VIOLATION: a fat interface forces unused methods
struct Worker {
    virtual void work() = 0;
    virtual void eat() = 0;
};
struct Robot : Worker {
    void work() override {}
    void eat() override {}   // forced stub
};

// REFACTOR: small, focused interfaces
struct Workable { virtual void work() = 0; };
struct Eatable  { virtual void eat() = 0; };
struct Human : Workable, Eatable { /* both */ };
struct Robot2 : Workable { /* only work */ };`,
        lines: { bad: [2, 3, 4, 5, 6, 7, 8, 9], good: [12, 13, 14, 15] },
      },
      python: {
        code: `# VIOLATION: a fat interface forces unused methods
class Worker(ABC):
    @abstractmethod
    def work(self): ...
    @abstractmethod
    def eat(self): ...
class Robot(Worker):
    def work(self): ...
    def eat(self): ...   # forced stub

# REFACTOR: small, focused interfaces
class Workable(ABC):
    @abstractmethod
    def work(self): ...
class Eatable(ABC):
    @abstractmethod
    def eat(self): ...
class Robot2(Workable): ...   # only work`,
        lines: { bad: [2, 3, 4, 5, 6, 7, 8, 9], good: [12, 13, 14, 15, 16, 17, 18] },
      },
    },
  },
  {
    key: "dependency-inversion",
    title: "Dependency Inversion",
    samples: {
      java: {
        code: `// VIOLATION: high-level class nailed to a concrete one
class EmailSender {
    void send(String msg) {}
}
class Notifier {
    EmailSender sender = new EmailSender();   // hard dependency
    void alert(String m) { sender.send(m); }
}

// REFACTOR: both depend on an abstraction
interface MessageSender { void send(String msg); }
class EmailSender2 implements MessageSender { public void send(String m) {} }
class SmsSender    implements MessageSender { public void send(String m) {} }
class Notifier2 {
    MessageSender sender;   // injected — any implementation
    Notifier2(MessageSender s) { sender = s; }
}`,
        lines: { bad: [2, 3, 4, 5, 6, 7, 8], good: [11, 12, 13, 14, 15, 16, 17] },
      },
      cpp: {
        code: `// VIOLATION: high-level class nailed to a concrete one
struct EmailSender {
    void send(const string& m) {}
};
struct Notifier {
    EmailSender sender;   // hard dependency
    void alert(const string& m) { sender.send(m); }
};

// REFACTOR: both depend on an abstraction
struct MessageSender { virtual void send(const string&) = 0; };
struct EmailSender2 : MessageSender { void send(const string&) override {} };
struct SmsSender    : MessageSender { void send(const string&) override {} };
struct Notifier2 {
    MessageSender* sender;   // injected
    Notifier2(MessageSender* s) : sender(s) {}
};`,
        lines: { bad: [2, 3, 4, 5, 6, 7, 8], good: [11, 12, 13, 14, 15, 16, 17] },
      },
      python: {
        code: `# VIOLATION: high-level class nailed to a concrete one
class EmailSender:
    def send(self, msg): ...
class Notifier:
    def __init__(self):
        self.sender = EmailSender()   # hard dependency
    def alert(self, m): self.sender.send(m)

# REFACTOR: both depend on an abstraction
class MessageSender(ABC):
    @abstractmethod
    def send(self, msg): ...
class EmailSender2(MessageSender):
    def send(self, msg): ...
class Notifier2:
    def __init__(self, sender: MessageSender):
        self.sender = sender   # injected`,
        lines: { bad: [2, 3, 4, 5, 6, 7], good: [10, 11, 12, 13, 14, 15, 16, 17] },
      },
    },
  },
];
