import type { OopsCodeEntry } from "./types";

// OOP · Advanced — interfaces vs abstract classes, static & final members, and
// composition vs inheritance. Anchors match engines/oopsEngine.ts.

export const ADVANCED_CODE: OopsCodeEntry[] = [
  {
    key: "interfaces-vs-abstract",
    title: "Interfaces vs Abstract Classes",
    samples: {
      java: {
        code: `interface Swimmer {
    void swim();   // no body — a pure contract
}

class Bird {
    void fly() { System.out.println("flap flap"); }
}

class Duck extends Bird implements Swimmer {
    public void swim() { System.out.println("paddle paddle"); }
}

public class Main {
    public static void main(String[] args) {
        // Swimmer s = new Swimmer();   // ERROR: interface
        Duck d = new Duck();
        d.fly();    // inherited from Bird
        d.swim();   // from the Swimmer contract
    }
}`,
        lines: {
          "interface-def": [1, 2, 3],
          "base-class": [5, 6, 7],
          derived: [9, 10, 11],
          blocked: [15],
          "new-call": [16],
          "call-fly": [17],
          "call-swim": [18],
        },
      },
      cpp: {
        code: `#include <iostream>
using namespace std;

struct Swimmer {          // interface = all-pure-virtual class
    virtual void swim() = 0;
};

struct Bird {
    void fly() { cout << "flap flap\\n"; }
};

struct Duck : Bird, Swimmer {
    void swim() override { cout << "paddle paddle\\n"; }
};

int main() {
    // Swimmer s;              // ERROR: abstract
    Duck d;
    d.fly();    // from Bird
    d.swim();   // from Swimmer
}`,
        lines: {
          "interface-def": [4, 5, 6],
          "base-class": [8, 9, 10],
          derived: [12, 13, 14],
          blocked: [17],
          "new-call": [18],
          "call-fly": [19],
          "call-swim": [20],
        },
      },
      python: {
        code: `from abc import ABC, abstractmethod

class Swimmer(ABC):        # a contract via abstractmethod
    @abstractmethod
    def swim(self): ...

class Bird:
    def fly(self): print("flap flap")

class Duck(Bird, Swimmer): # multiple inheritance
    def swim(self): print("paddle paddle")


# s = Swimmer()   # TypeError: abstract
d = Duck()
d.fly()    # from Bird
d.swim()   # from Swimmer`,
        lines: {
          "interface-def": [3, 4, 5],
          "base-class": [7, 8],
          derived: [10, 11],
          blocked: [14],
          "new-call": [15],
          "call-fly": [16],
          "call-swim": [17],
        },
      },
    },
  },
  {
    key: "static-final",
    title: "static & final",
    samples: {
      java: {
        code: `class Counter {
    static int count = 0;    // one per CLASS
    final int MAX = 100;     // set once, never reassigned
    int id;

    Counter() {
        count++;             // shared across all objects
        id = count;
    }
}

public class Main {
    public static void main(String[] args) {
        Counter a = new Counter();   // count -> 1
        Counter b = new Counter();   // count -> 2
        Counter c = new Counter();   // count -> 3
        System.out.println(Counter.count);  // 3
        // a.MAX = 200;   // ERROR: MAX is final
    }
}`,
        lines: {
          "static-field": [2],
          "final-field": [3],
          ctor: [6, 7, 8, 9],
          new1: [14],
          new2: [15],
          new3: [16],
          read: [17],
          "final-blocked": [18],
        },
      },
      cpp: {
        code: `#include <iostream>
using namespace std;

class Counter {
public:
    static int count;      // one per CLASS
    const int MAX = 100;   // set once, never reassigned
    int id;
    Counter() { count++; id = count; }
};

int Counter::count = 0;    // static members need a definition

int main() {
    Counter a;   // count -> 1
    Counter b;   // count -> 2
    Counter c;   // count -> 3
    cout << Counter::count << endl;   // 3
    // a.MAX = 200;   // ERROR: MAX is const
}`,
        lines: {
          "static-field": [6],
          "final-field": [7],
          ctor: [9],
          new1: [15],
          new2: [16],
          new3: [17],
          read: [18],
          "final-blocked": [19],
        },
      },
      python: {
        code: `class Counter:
    count = 0             # class attribute (shared)
    MAX = 100             # convention: constant, don't reassign

    def __init__(self):
        Counter.count += 1    # bump the shared class attribute
        self.id = Counter.count


a = Counter()   # count -> 1
b = Counter()   # count -> 2
c = Counter()   # count -> 3
print(Counter.count)   # 3
# Python can't truly enforce final / const`,
        lines: {
          "static-field": [2],
          "final-field": [3],
          ctor: [5, 6, 7],
          new1: [10],
          new2: [11],
          new3: [12],
          read: [13],
          "final-blocked": [14],
        },
      },
    },
  },
  {
    key: "composition-vs-inheritance",
    title: "Composition vs Inheritance",
    samples: {
      java: {
        code: `class Engine {
    void start() { System.out.println("Engine roars"); }
}

class Car {
    private Engine engine = new Engine();   // HAS-A (composition)

    void start() {
        engine.start();   // delegate to the part
    }
}

public class Main {
    public static void main(String[] args) {
        Car car = new Car();
        car.start();   // Car -> Engine
    }
}`,
        lines: {
          "part-class": [1, 2, 3],
          "whole-class": [5, 6, 7, 8, 9, 10, 11],
          "has-a": [6],
          "new-call": [15],
          delegate: [9],
          "call-start": [16],
        },
      },
      cpp: {
        code: `#include <iostream>
using namespace std;

class Engine {
public:
    void start() { cout << "Engine roars\\n"; }
};

class Car {
    Engine engine;          // HAS-A: the Engine is part of the Car
public:
    void start() { engine.start(); }   // delegate
};

int main() {
    Car car;
    car.start();   // Car -> Engine
}`,
        lines: {
          "part-class": [4, 5, 6, 7],
          "whole-class": [9, 10, 11, 12, 13],
          "has-a": [10],
          "new-call": [16],
          delegate: [12],
          "call-start": [17],
        },
      },
      python: {
        code: `class Engine:
    def start(self):
        print("Engine roars")

class Car:
    def __init__(self):
        self.engine = Engine()   # HAS-A (composition)

    def start(self):
        self.engine.start()      # delegate to the part


car = Car()
car.start()   # Car -> Engine`,
        lines: {
          "part-class": [1, 2, 3],
          "whole-class": [5, 6, 7, 9, 10],
          "has-a": [7],
          "new-call": [13],
          delegate: [10],
          "call-start": [14],
        },
      },
    },
  },
];
