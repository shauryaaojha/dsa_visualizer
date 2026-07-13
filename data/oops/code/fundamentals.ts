import type { OopsCodeEntry } from "./types";

// Real, idiomatic samples for the OOP · Fundamentals pages. Anchors match the
// step frames emitted by engines/oopsEngine.ts; each sample maps every anchor
// to its own line numbers so the notes rail lights the right lines per language.

export const FUNDAMENTALS_CODE: OopsCodeEntry[] = [
  {
    key: "classes-objects",
    title: "Classes & Objects",
    samples: {
      java: {
        code: `class Dog {
    String name;
    String breed;

    Dog(String name, String breed) {
        this.name = name;
        this.breed = breed;
    }

    void bark() {
        System.out.println(name + " says Woof!");
    }
}

public class Main {
    public static void main(String[] args) {
        Dog rex = new Dog("Rex", "Husky");
        Dog buddy = new Dog("Buddy", "Beagle");
        rex.bark();
        buddy.bark();
    }
}`,
        lines: {
          "class-def": [1],
          fields: [2, 3],
          ctor: [5, 6, 7, 8],
          "method-def": [10, 11, 12],
          "new-rex": [17],
          "new-buddy": [18],
          "call-rex": [19],
          "call-buddy": [20],
        },
      },
      cpp: {
        code: `#include <iostream>
#include <string>
using namespace std;

class Dog {
public:
    string name;
    string breed;

    Dog(string name, string breed) {
        this->name = name;
        this->breed = breed;
    }

    void bark() {
        cout << name << " says Woof!" << endl;
    }
};

int main() {
    Dog rex("Rex", "Husky");
    Dog buddy("Buddy", "Beagle");
    rex.bark();
    buddy.bark();
}`,
        lines: {
          "class-def": [5],
          fields: [7, 8],
          ctor: [10, 11, 12, 13],
          "method-def": [15, 16, 17],
          "new-rex": [21],
          "new-buddy": [22],
          "call-rex": [23],
          "call-buddy": [24],
        },
      },
      python: {
        code: `class Dog:
    def __init__(self, name, breed):
        self.name = name
        self.breed = breed

    def bark(self):
        print(f"{self.name} says Woof!")


rex = Dog("Rex", "Husky")
buddy = Dog("Buddy", "Beagle")
rex.bark()
buddy.bark()`,
        lines: {
          "class-def": [1],
          fields: [3, 4],
          ctor: [2, 3, 4],
          "method-def": [6, 7],
          "new-rex": [10],
          "new-buddy": [11],
          "call-rex": [12],
          "call-buddy": [13],
        },
      },
    },
  },
  {
    key: "constructors",
    title: "Constructors & Destructors",
    samples: {
      java: {
        code: `class Animal {
    Animal() {
        System.out.println("Animal constructor");
    }
}

class Dog extends Animal {
    Dog() {
        super();
        System.out.println("Dog constructor");
    }
}

public class Main {
    public static void main(String[] args) {
        Dog d = new Dog();
        // No destructors in Java — the GC frees d later.
    }
}`,
        lines: {
          "base-ctor": [2, 3, 4],
          "derived-ctor": [8, 9, 10, 11],
          "new-call": [16],
          destroy: [17],
        },
      },
      cpp: {
        code: `#include <iostream>
using namespace std;

class Animal {
public:
    Animal()  { cout << "Animal constructor\\n"; }
    ~Animal() { cout << "Animal destructor\\n"; }
};

class Dog : public Animal {
public:
    Dog()  { cout << "Dog constructor\\n"; }
    ~Dog() { cout << "Dog destructor\\n"; }
};

int main() {
    Dog d;   // Animal() then Dog()
}            // ~Dog() then ~Animal() at scope end`,
        lines: {
          "base-ctor": [6],
          "derived-ctor": [12],
          "new-call": [17],
          destroy: [13, 7, 18],
        },
      },
      python: {
        code: `class Animal:
    def __init__(self):
        print("Animal constructor")

class Dog(Animal):
    def __init__(self):
        super().__init__()
        print("Dog constructor")

    def __del__(self):
        print("Dog destroyed")


d = Dog()
del d          # triggers __del__`,
        lines: {
          "base-ctor": [2, 3],
          "derived-ctor": [6, 7, 8],
          "new-call": [14],
          destroy: [10, 11, 15],
        },
      },
    },
  },
  {
    key: "this-references",
    title: "this & References",
    samples: {
      java: {
        code: `class Point {
    int x;
    Point(int x) { this.x = x; }
}

public class Main {
    public static void main(String[] args) {
        Point a = new Point(5);
        Point b = a;        // b and a share ONE object
        b.x = 99;           // mutate via b
        System.out.println(a.x);   // prints 99
        a = null;           // a lets go; b still holds it
        b = null;           // nothing refers to it -> GC
    }
}`,
        lines: {
          "new-call": [8],
          alias: [9],
          mutate: [10],
          read: [11],
          "null-a": [12],
          "null-b": [13],
        },
      },
      cpp: {
        code: `#include <iostream>
using namespace std;

struct Point {
    int x;
    Point(int x) : x(x) {}
};

int main() {
    Point* a = new Point(5);
    Point* b = a;          // b and a point at ONE object
    b->x = 99;             // mutate via b
    cout << a->x << endl;  // prints 99
    delete a;              // free the shared object
    a = b = nullptr;       // avoid dangling pointers
}`,
        lines: {
          "new-call": [10],
          alias: [11],
          mutate: [12],
          read: [13],
          "null-a": [14],
          "null-b": [15],
        },
      },
      python: {
        code: `class Point:
    def __init__(self, x):
        self.x = x


a = Point(5)
b = a            # b and a bind to ONE object
b.x = 99         # mutate via b
print(a.x)       # prints 99
a = None         # a lets go; b still holds it
b = None         # refcount hits 0 -> collected`,
        lines: {
          "new-call": [6],
          alias: [7],
          mutate: [8],
          read: [9],
          "null-a": [10],
          "null-b": [11],
        },
      },
    },
  },
  {
    key: "access-modifiers",
    title: "Access Modifiers",
    samples: {
      java: {
        code: `class BankAccount {
    private double balance = 100;

    public double getBalance() {
        return balance;
    }
}

public class Main {
    public static void main(String[] args) {
        BankAccount acc = new BankAccount();
        // acc.balance;              // ERROR: balance is private
        double b = acc.getBalance();   // OK: public gate
        System.out.println(b);
    }
}`,
        lines: {
          "private-field": [2],
          getter: [4, 5, 6],
          "new-call": [11],
          blocked: [12],
          "getter-call": [13],
        },
      },
      cpp: {
        code: `#include <iostream>
using namespace std;

class BankAccount {
private:
    double balance = 100;
public:
    double getBalance() { return balance; }
};

int main() {
    BankAccount acc;
    // acc.balance;               // ERROR: balance is private
    double b = acc.getBalance();  // OK: public gate
    cout << b << endl;
}`,
        lines: {
          "private-field": [5, 6],
          getter: [7, 8],
          "new-call": [12],
          blocked: [13],
          "getter-call": [14],
        },
      },
      python: {
        code: `class BankAccount:
    def __init__(self):
        self.__balance = 100      # "private" by name-mangling

    def get_balance(self):
        return self.__balance


acc = BankAccount()
# acc.__balance                   # AttributeError
b = acc.get_balance()             # OK: public method
print(b)`,
        lines: {
          "private-field": [3],
          getter: [5, 6],
          "new-call": [9],
          blocked: [10],
          "getter-call": [11],
        },
      },
    },
  },
];
