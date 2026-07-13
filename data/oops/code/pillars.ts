import type { OopsCodeEntry } from "./types";

// OOP · Four Pillars — encapsulation, inheritance, polymorphism (overloading &
// overriding) and abstraction. Anchors match engines/oopsEngine.ts.

export const PILLARS_CODE: OopsCodeEntry[] = [
  {
    key: "encapsulation",
    title: "Encapsulation",
    samples: {
      java: {
        code: `class BankAccount {
    private double balance = 0;

    public void deposit(double amount) {
        if (amount <= 0) {
            System.out.println("Rejected: must be positive");
            return;
        }
        balance += amount;
    }

    public double getBalance() { return balance; }
}

public class Main {
    public static void main(String[] args) {
        BankAccount acc = new BankAccount();
        acc.deposit(-500);   // rejected by the guard
        acc.deposit(200);    // accepted
        System.out.println(acc.getBalance());  // 200
    }
}`,
        lines: {
          "private-field": [2],
          guard: [5, 6, 7, 8],
          update: [9],
          "new-call": [17],
          "call-bad": [18],
          "call-good": [19],
          read: [20],
        },
      },
      cpp: {
        code: `#include <iostream>
using namespace std;

class BankAccount {
private:
    double balance = 0;
public:
    void deposit(double amount) {
        if (amount <= 0) {
            cout << "Rejected: must be positive\\n";
            return;
        }
        balance += amount;
    }
    double getBalance() { return balance; }
};

int main() {
    BankAccount acc;
    acc.deposit(-500);   // rejected by the guard
    acc.deposit(200);    // accepted
    cout << acc.getBalance() << endl;   // 200
}`,
        lines: {
          "private-field": [6],
          guard: [9, 10, 11, 12],
          update: [13],
          "new-call": [19],
          "call-bad": [20],
          "call-good": [21],
          read: [22],
        },
      },
      python: {
        code: `class BankAccount:
    def __init__(self):
        self.__balance = 0

    def deposit(self, amount):
        if amount <= 0:
            print("Rejected: must be positive")
            return
        self.__balance += amount

    def get_balance(self):
        return self.__balance


acc = BankAccount()
acc.deposit(-500)   # rejected by the guard
acc.deposit(200)    # accepted
print(acc.get_balance())   # 200`,
        lines: {
          "private-field": [3],
          guard: [6, 7, 8],
          update: [9],
          "new-call": [15],
          "call-bad": [16],
          "call-good": [17],
          read: [18],
        },
      },
    },
  },
  {
    key: "inheritance",
    title: "Inheritance",
    samples: {
      java: {
        code: `class Animal {
    String name;
    void eat() {
        System.out.println(name + " is eating");
    }
}

class Dog extends Animal {
    void bark() {
        System.out.println(name + " says Woof!");
    }
}

public class Main {
    public static void main(String[] args) {
        Dog dog = new Dog();
        dog.name = "Rex";
        dog.bark();   // Dog's own method
        dog.eat();    // inherited from Animal
    }
}`,
        lines: {
          "base-class": [1, 2, 3, 4, 5, 6],
          "derived-class": [8, 9, 10, 11, 12],
          "new-call": [16],
          "call-own": [18],
          "call-inherited": [19],
          resolve: [3, 4],
        },
      },
      cpp: {
        code: `#include <iostream>
#include <string>
using namespace std;

class Animal {
public:
    string name;
    void eat() { cout << name << " is eating\\n"; }
};

class Dog : public Animal {
public:
    void bark() { cout << name << " says Woof!\\n"; }
};

int main() {
    Dog dog;
    dog.name = "Rex";
    dog.bark();   // Dog's own method
    dog.eat();    // inherited from Animal
}`,
        lines: {
          "base-class": [5, 6, 7, 8, 9],
          "derived-class": [11, 12, 13, 14],
          "new-call": [17],
          "call-own": [19],
          "call-inherited": [20],
          resolve: [8],
        },
      },
      python: {
        code: `class Animal:
    def __init__(self):
        self.name = ""

    def eat(self):
        print(f"{self.name} is eating")

class Dog(Animal):
    def bark(self):
        print(f"{self.name} says Woof!")


dog = Dog()
dog.name = "Rex"
dog.bark()   # Dog's own method
dog.eat()    # inherited from Animal`,
        lines: {
          "base-class": [1, 2, 3, 5, 6],
          "derived-class": [8, 9, 10],
          "new-call": [13],
          "call-own": [15],
          "call-inherited": [16],
          resolve: [5, 6],
        },
      },
    },
  },
  {
    key: "overloading",
    title: "Method Overloading",
    samples: {
      java: {
        code: `class Printer {
    void print(int n) {
        System.out.println("int: " + n);
    }
    void print(String s) {
        System.out.println("String: " + s);
    }
    void print(int a, int b) {
        System.out.println("sum: " + (a + b));
    }
}

public class Main {
    public static void main(String[] args) {
        Printer p = new Printer();
        p.print(42);        // -> print(int)
        p.print("hello");   // -> print(String)
        p.print(3, 4);      // -> print(int, int)
    }
}`,
        lines: {
          "sig-int": [2, 3, 4],
          "sig-str": [5, 6, 7],
          "sig-two": [8, 9, 10],
          "call-int": [16],
          "call-str": [17],
          "call-two": [18],
        },
      },
      cpp: {
        code: `#include <iostream>
#include <string>
using namespace std;

class Printer {
public:
    void print(int n)        { cout << "int: " << n << endl; }
    void print(string s)     { cout << "string: " << s << endl; }
    void print(int a, int b) { cout << "sum: " << a + b << endl; }
};

int main() {
    Printer p;
    p.print(42);        // -> print(int)
    p.print("hello");   // -> print(string)
    p.print(3, 4);      // -> print(int, int)
}`,
        lines: {
          "sig-int": [7],
          "sig-str": [8],
          "sig-two": [9],
          "call-int": [14],
          "call-str": [15],
          "call-two": [16],
        },
      },
      python: {
        code: `# Python has no true overloading — the last def wins.
# Idiom: one method + type checks / default args.
class Printer:
    def print(self, a, b=None):
        if isinstance(a, str):
            print(f"str: {a}")
        elif b is not None:
            print(f"sum: {a + b}")
        else:
            print(f"int: {a}")


p = Printer()
p.print(42)        # int
p.print("hello")   # str
p.print(3, 4)      # sum`,
        lines: {
          "sig-int": [9, 10],
          "sig-str": [5, 6],
          "sig-two": [7, 8],
          "call-int": [14],
          "call-str": [15],
          "call-two": [16],
        },
      },
    },
  },
  {
    key: "overriding",
    title: "Method Overriding",
    samples: {
      java: {
        code: `class Animal {
    void speak() {
        System.out.println("...");
    }
}

class Dog extends Animal {
    @Override void speak() {
        System.out.println("Woof!");
    }
}

class Cat extends Animal {
    @Override void speak() {
        System.out.println("Meow!");
    }
}

public class Main {
    public static void main(String[] args) {
        Animal a = new Dog();
        a.speak();          // Woof! (runtime type = Dog)
        a = new Cat();
        a.speak();          // Meow! (runtime type = Cat)
    }
}`,
        lines: {
          "base-method": [2, 3, 4],
          "dog-override": [8, 9, 10],
          "cat-override": [14, 15, 16],
          "new-dog": [21],
          "call-dog": [22],
          "new-cat": [23],
          "call-cat": [24],
        },
      },
      cpp: {
        code: `#include <iostream>
using namespace std;

class Animal {
public:
    virtual void speak() { cout << "...\\n"; }
};

class Dog : public Animal {
public:
    void speak() override { cout << "Woof!\\n"; }
};

class Cat : public Animal {
public:
    void speak() override { cout << "Meow!\\n"; }
};

int main() {
    Animal* a = new Dog();
    a->speak();          // Woof! (vtable -> Dog)
    delete a;
    a = new Cat();
    a->speak();          // Meow! (vtable -> Cat)
    delete a;
}`,
        lines: {
          "base-method": [6],
          "dog-override": [11],
          "cat-override": [16],
          "new-dog": [20],
          "call-dog": [21],
          "new-cat": [23],
          "call-cat": [24],
        },
      },
      python: {
        code: `class Animal:
    def speak(self):
        print("...")

class Dog(Animal):
    def speak(self):
        print("Woof!")

class Cat(Animal):
    def speak(self):
        print("Meow!")


a = Dog()
a.speak()          # Woof! (type(a) == Dog)
a = Cat()
a.speak()          # Meow! (type(a) == Cat)`,
        lines: {
          "base-method": [2, 3],
          "dog-override": [6, 7],
          "cat-override": [10, 11],
          "new-dog": [14],
          "call-dog": [15],
          "new-cat": [16],
          "call-cat": [17],
        },
      },
    },
  },
  {
    key: "abstraction",
    title: "Abstraction",
    samples: {
      java: {
        code: `abstract class Shape {
    abstract double area();   // no body — subclasses must provide it
}

class Circle extends Shape {
    double r;
    Circle(double r) { this.r = r; }
    double area() { return Math.PI * r * r; }
}

public class Main {
    public static void main(String[] args) {
        // Shape s = new Shape();   // ERROR: Shape is abstract
        Shape s = new Circle(2);
        System.out.println(s.area());   // 12.57
    }
}`,
        lines: {
          "abstract-class": [1],
          "abstract-method": [2],
          concrete: [5, 6, 7, 8],
          blocked: [13],
          "new-circle": [14],
          "call-area": [15],
        },
      },
      cpp: {
        code: `#include <iostream>
#include <cmath>
using namespace std;

class Shape {
public:
    virtual double area() = 0;   // pure virtual -> abstract
};

class Circle : public Shape {
    double r;
public:
    Circle(double r) : r(r) {}
    double area() override { return M_PI * r * r; }
};

int main() {
    // Shape s;                  // ERROR: abstract type
    Shape* s = new Circle(2);
    cout << s->area() << endl;   // 12.57
    delete s;
}`,
        lines: {
          "abstract-class": [5],
          "abstract-method": [7],
          concrete: [10, 13, 14],
          blocked: [18],
          "new-circle": [19],
          "call-area": [20],
        },
      },
      python: {
        code: `from abc import ABC, abstractmethod
import math

class Shape(ABC):
    @abstractmethod
    def area(self):
        ...

class Circle(Shape):
    def __init__(self, r):
        self.r = r
    def area(self):
        return math.pi * self.r ** 2


# s = Shape()   # TypeError: can't instantiate abstract class
s = Circle(2)
print(s.area())   # 12.57`,
        lines: {
          "abstract-class": [4],
          "abstract-method": [5, 6, 7],
          concrete: [9, 10, 11, 12, 13],
          blocked: [16],
          "new-circle": [17],
          "call-area": [18],
        },
      },
    },
  },
];
