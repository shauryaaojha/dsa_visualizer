import type { OopsCodeEntry } from "./types";

// OOP · Design Patterns — Singleton, Factory Method, Observer, Strategy,
// Decorator. Anchors match engines/oopsEngine.ts.

export const PATTERNS_CODE: OopsCodeEntry[] = [
  {
    key: "singleton",
    title: "Singleton",
    samples: {
      java: {
        code: `class Database {
    private static Database instance;   // the single instance

    private Database() { }              // no outside \`new\`

    public static Database getInstance() {
        if (instance == null) {
            instance = new Database();  // created once, lazily
        }
        return instance;
    }
}

public class Main {
    public static void main(String[] args) {
        Database a = Database.getInstance();
        Database b = Database.getInstance();
        System.out.println(a == b);   // true — same object
    }
}`,
        lines: {
          "static-instance": [2],
          "private-ctor": [4],
          getinstance: [6, 7, 8, 9, 10, 11],
          "first-call": [16],
          create: [8],
          "second-call": [17],
          same: [18],
        },
      },
      cpp: {
        code: `#include <iostream>
using namespace std;

class Database {
    static Database* instance;
    Database() {}                       // private ctor
public:
    static Database* getInstance() {
        if (!instance)
            instance = new Database();  // created once
        return instance;
    }
};

Database* Database::instance = nullptr;

int main() {
    Database* a = Database::getInstance();
    Database* b = Database::getInstance();
    cout << (a == b) << endl;   // 1 — same object
}`,
        lines: {
          "static-instance": [5],
          "private-ctor": [6],
          getinstance: [8, 9, 10, 11, 12],
          "first-call": [18],
          create: [10],
          "second-call": [19],
          same: [20],
        },
      },
      python: {
        code: `class Database:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)   # once
        return cls._instance


a = Database()
b = Database()
print(a is b)   # True — same object`,
        lines: {
          "static-instance": [2],
          "private-ctor": [4],
          getinstance: [4, 5, 6, 7],
          "first-call": [10],
          create: [6],
          "second-call": [11],
          same: [12],
        },
      },
    },
  },
  {
    key: "factory-method",
    title: "Factory Method",
    samples: {
      java: {
        code: `interface Shape { void draw(); }

class Circle implements Shape {
    public void draw() { System.out.println("O"); }
}
class Square implements Shape {
    public void draw() { System.out.println("[]"); }
}

class ShapeFactory {
    static Shape create(String type) {
        if (type.equals("circle")) return new Circle();
        return new Square();
    }
}

public class Main {
    public static void main(String[] args) {
        Shape s = ShapeFactory.create("circle");
        s.draw();   // O — client never called \`new Circle\`
    }
}`,
        lines: {
          "product-interface": [1],
          concrete: [3, 4, 5, 6, 7, 8],
          factory: [10, 11, 12, 13, 14, 15],
          "create-call": [19],
          "create-circle": [12],
          use: [20],
        },
      },
      cpp: {
        code: `#include <iostream>
#include <string>
using namespace std;

struct Shape { virtual void draw() = 0; };

struct Circle : Shape { void draw() override { cout << "O\\n"; } };
struct Square : Shape { void draw() override { cout << "[]\\n"; } };

struct ShapeFactory {
    static Shape* create(const string& type) {
        if (type == "circle") return new Circle();
        return new Square();
    }
};

int main() {
    Shape* s = ShapeFactory::create("circle");
    s->draw();   // O
    delete s;
}`,
        lines: {
          "product-interface": [5],
          concrete: [7, 8],
          factory: [10, 11, 12, 13, 14, 15],
          "create-call": [18],
          "create-circle": [12],
          use: [19],
        },
      },
      python: {
        code: `class Shape:
    def draw(self): ...

class Circle(Shape):
    def draw(self): print("O")
class Square(Shape):
    def draw(self): print("[]")

class ShapeFactory:
    @staticmethod
    def create(kind):
        if kind == "circle": return Circle()
        return Square()


s = ShapeFactory.create("circle")
s.draw()   # O — client never called Circle()`,
        lines: {
          "product-interface": [1, 2],
          concrete: [4, 5, 6, 7],
          factory: [9, 10, 11, 12, 13],
          "create-call": [16],
          "create-circle": [12],
          use: [17],
        },
      },
    },
  },
  {
    key: "observer",
    title: "Observer",
    samples: {
      java: {
        code: `interface Observer { void update(String news); }

class Subscriber implements Observer {
    String name;
    Subscriber(String n) { name = n; }
    public void update(String news) {
        System.out.println(name + " got: " + news);
    }
}

class Channel {
    List<Observer> subs = new ArrayList<>();
    void attach(Observer o) { subs.add(o); }
    void detach(Observer o) { subs.remove(o); }
    void publish(String news) {
        for (Observer o : subs) o.update(news);
    }
}

public class Main {
    public static void main(String[] args) {
        Channel c = new Channel();
        Observer a = new Subscriber("Alice");
        Observer b = new Subscriber("Bob");
        c.attach(a); c.attach(b);
        c.publish("Episode 1");   // both notified
        c.detach(b);
        c.publish("Episode 2");   // only Alice
    }
}`,
        lines: {
          "observer-interface": [1],
          subject: [11, 12, 13, 14, 15, 16, 17, 18],
          attach: [25],
          publish1: [26],
          notify: [16],
          detach: [27],
          publish2: [28],
        },
      },
      cpp: {
        code: `#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;

struct Observer { virtual void update(const string&) = 0; };

struct Subscriber : Observer {
    string name;
    Subscriber(string n) : name(n) {}
    void update(const string& news) override {
        cout << name << " got: " << news << "\\n";
    }
};

struct Channel {
    vector<Observer*> subs;
    void attach(Observer* o) { subs.push_back(o); }
    void detach(Observer* o) { subs.erase(remove(subs.begin(), subs.end(), o), subs.end()); }
    void publish(const string& news) {
        for (auto* o : subs) o->update(news);
    }
};

int main() {
    Channel c;
    Subscriber a("Alice"), b("Bob");
    c.attach(&a); c.attach(&b);
    c.publish("Episode 1");   // both
    c.detach(&b);
    c.publish("Episode 2");   // only Alice
}`,
        lines: {
          "observer-interface": [7],
          subject: [17, 18, 19, 20, 21, 22, 23, 24],
          attach: [29],
          publish1: [30],
          notify: [22],
          detach: [31],
          publish2: [32],
        },
      },
      python: {
        code: `class Channel:
    def __init__(self):
        self.subs = []
    def attach(self, o): self.subs.append(o)
    def detach(self, o): self.subs.remove(o)
    def publish(self, news):
        for o in self.subs:
            o(news)              # each observer is a callback


def make(name):
    return lambda news: print(f"{name} got: {news}")

c = Channel()
alice, bob = make("Alice"), make("Bob")
c.attach(alice); c.attach(bob)
c.publish("Episode 1")   # both
c.detach(bob)
c.publish("Episode 2")   # only Alice`,
        lines: {
          "observer-interface": [11, 12],
          subject: [1, 2, 3, 4, 5, 6, 7, 8],
          attach: [16],
          publish1: [17],
          notify: [8],
          detach: [18],
          publish2: [19],
        },
      },
    },
  },
  {
    key: "strategy",
    title: "Strategy",
    samples: {
      java: {
        code: `interface Sorter { void sort(int[] a); }

class QuickSort implements Sorter {
    public void sort(int[] a) { System.out.println("quicksort"); }
}
class BubbleSort implements Sorter {
    public void sort(int[] a) { System.out.println("bubblesort"); }
}

class Context {
    private Sorter strategy;
    void setStrategy(Sorter s) { strategy = s; }
    void run(int[] a) { strategy.sort(a); }
}

public class Main {
    public static void main(String[] args) {
        Context ctx = new Context();
        ctx.setStrategy(new QuickSort());
        ctx.run(data);    // quicksort
        ctx.setStrategy(new BubbleSort());
        ctx.run(data);    // bubblesort — swapped at runtime
    }
}`,
        lines: {
          "strategy-interface": [1],
          concrete: [3, 4, 5, 6, 7, 8],
          context: [10, 11, 12, 13, 14],
          "set-quick": [19],
          "run-quick": [20],
          "set-bubble": [21],
          "run-bubble": [22],
        },
      },
      cpp: {
        code: `#include <iostream>
using namespace std;

struct Sorter { virtual void sort() = 0; };
struct QuickSort  : Sorter { void sort() override { cout << "quicksort\\n"; } };
struct BubbleSort : Sorter { void sort() override { cout << "bubblesort\\n"; } };

struct Context {
    Sorter* strategy = nullptr;
    void setStrategy(Sorter* s) { strategy = s; }
    void run() { strategy->sort(); }
};

int main() {
    Context ctx;
    ctx.setStrategy(new QuickSort());
    ctx.run();    // quicksort
    ctx.setStrategy(new BubbleSort());
    ctx.run();    // bubblesort
}`,
        lines: {
          "strategy-interface": [4],
          concrete: [5, 6],
          context: [8, 9, 10, 11, 12],
          "set-quick": [16],
          "run-quick": [17],
          "set-bubble": [18],
          "run-bubble": [19],
        },
      },
      python: {
        code: `def quicksort():  print("quicksort")
def bubblesort(): print("bubblesort")

class Context:
    def __init__(self):
        self.strategy = None
    def set_strategy(self, s):
        self.strategy = s        # swap the algorithm object
    def run(self):
        self.strategy()


ctx = Context()
ctx.set_strategy(quicksort)
ctx.run()    # quicksort
ctx.set_strategy(bubblesort)
ctx.run()    # bubblesort`,
        lines: {
          "strategy-interface": [1, 2],
          concrete: [1, 2],
          context: [4, 5, 6, 7, 8, 9, 10],
          "set-quick": [14],
          "run-quick": [15],
          "set-bubble": [16],
          "run-bubble": [17],
        },
      },
    },
  },
  {
    key: "decorator",
    title: "Decorator",
    samples: {
      java: {
        code: `interface Coffee { double cost(); }

class Espresso implements Coffee {
    public double cost() { return 5; }
}

class Milk implements Coffee {
    private Coffee inner;
    Milk(Coffee c) { inner = c; }
    public double cost() { return inner.cost() + 1.5; }
}
class Sugar implements Coffee {
    private Coffee inner;
    Sugar(Coffee c) { inner = c; }
    public double cost() { return inner.cost() + 0.5; }
}

public class Main {
    public static void main(String[] args) {
        Coffee c = new Sugar(new Milk(new Espresso()));
        System.out.println(c.cost());   // 5 + 1.5 + 0.5 = 7
    }
}`,
        lines: {
          component: [1, 3, 4, 5],
          "milk-dec": [7, 8, 9, 10, 11],
          "sugar-dec": [12, 13, 14, 15, 16],
          wrap: [20],
          "cost-espresso": [4],
          "cost-milk": [10],
          "cost-sugar": [15],
          result: [21],
        },
      },
      cpp: {
        code: `#include <iostream>
using namespace std;

struct Coffee { virtual double cost() = 0; };

struct Espresso : Coffee { double cost() override { return 5; } };

struct Milk : Coffee {
    Coffee* inner;
    Milk(Coffee* c) : inner(c) {}
    double cost() override { return inner->cost() + 1.5; }
};
struct Sugar : Coffee {
    Coffee* inner;
    Sugar(Coffee* c) : inner(c) {}
    double cost() override { return inner->cost() + 0.5; }
};

int main() {
    Coffee* c = new Sugar(new Milk(new Espresso()));
    cout << c->cost() << endl;   // 7
}`,
        lines: {
          component: [4, 6],
          "milk-dec": [8, 9, 10, 11, 12],
          "sugar-dec": [13, 14, 15, 16, 17],
          wrap: [20],
          "cost-espresso": [6],
          "cost-milk": [11],
          "cost-sugar": [16],
          result: [21],
        },
      },
      python: {
        code: `class Espresso:
    def cost(self): return 5

class Milk:
    def __init__(self, inner): self.inner = inner
    def cost(self): return self.inner.cost() + 1.5

class Sugar:
    def __init__(self, inner): self.inner = inner
    def cost(self): return self.inner.cost() + 0.5


c = Sugar(Milk(Espresso()))
print(c.cost())   # 5 + 1.5 + 0.5 = 7`,
        lines: {
          component: [1, 2],
          "milk-dec": [4, 5, 6],
          "sugar-dec": [8, 9, 10],
          wrap: [13],
          "cost-espresso": [2],
          "cost-milk": [6],
          "cost-sugar": [10],
          result: [14],
        },
      },
    },
  },
];
