(function () {
  function section(number, title, body) {
    return '<h2>' + number + '. ' + title + '</h2>' + body;
  }
  function sub(title, text) {
    return '<h3>' + title + '</h3><p>' + text + '</p>';
  }
  function code(title, source, output, explanation) {
    return '<section class="py-code-card"><div class="py-card-head"><span>' + title + '</span><span>python</span></div><pre><code>' + esc(source) + '</code></pre></section><section class="py-output-card"><div class="py-card-head"><span>Expected output</span><span>result</span></div><pre><code>' + esc(output) + '</code></pre></section><p><b>Why this output:</b> ' + explanation + '</p>';
  }
  function bullets(items) {
    return '<ul>' + items.map(function (item) { return '<li>' + item + '</li>'; }).join('') + '</ul>';
  }
  function note(title, text) {
    return '<div class="box"><b>' + title + '</b><p>' + text + '</p></div>';
  }

  window.renderPythonOopDeepLesson = function (D, f) {
    var html = '<div class="python-lesson"><div class="crumb">' + esc(D.MN[f.m]) + ' · Lesson ' + f.n + '</div>';
    html += '<div class="py-lesson-head"><span class="py-badge">PYTHON OOP</span><span>Step-by-step complete guide</span></div>';
    html += '<h1>Python Object-Oriented Programming</h1><p>Object-oriented programming is a way of organizing a program around objects. An object combines data that describes something with functions that operate on that data. This chapter begins with the smallest useful class and gradually builds toward inheritance, abstraction, design principles, and patterns.</p>';
    html += note('How to study this chapter', 'Run every example, change one value, predict the output, and then compare your prediction with the result. In Python, OOP is a tool: use it when it makes related data and behavior easier to understand, not merely because a class is available.');

    html += section(1, 'Introduction to OOP',
      sub('What is OOP?', 'OOP models a program as cooperating objects. A BankAccount object may own an account number and balance, and expose deposit and withdraw methods. The object protects the rules around its data, so callers do not need to repeat the same validation everywhere.') +
      sub('Procedural versus object-oriented programming', 'In procedural programming, data and functions are commonly kept separate: withdraw(balance, amount) receives the data as an argument. In OOP, account.withdraw(amount) keeps the operation beside the account state. Procedural code is often excellent for short, linear tasks. OOP becomes useful when many entities have their own state, rules, and life cycle.') +
      sub('Features and advantages', 'OOP supports reuse, modularity, encapsulation, testability, and extensibility. A class gives one place to maintain a rule. Multiple objects can use the same implementation while keeping separate values. The trade-off is extra structure: a tiny script can become harder to read if it is split into too many classes.') +
      sub('The four pillars', 'Encapsulation controls access to state. Abstraction exposes a useful interface while hiding implementation details. Inheritance specializes an existing class. Polymorphism allows different classes to respond to the same operation.') +
      code('First class and object', 'class Lamp:\n    def turn_on(self):\n        return "Light is on"\n\nlamp = Lamp()\nprint(lamp.turn_on())', 'Light is on', 'Lamp is the class definition, lamp is an object created from it, and turn_on is behavior available through that object.')
    );

    html += section(2, 'Classes and Objects',
      sub('Class declaration', 'Use class followed by a name and a colon. The indented body contains attributes and methods. The class itself is also an object: it can be stored in a variable, passed to a function, and inspected.') +
      sub('Object creation', 'Calling a class looks like calling a function: Student("Ravi", 90). Python creates an instance and initializes it. The variable on the left is only a name pointing to that object; it is not the object container itself.') +
      sub('Class attributes and instance attributes', 'A class attribute is defined directly in the class body and is normally shared. An instance attribute is assigned through self and belongs to one object. If an instance receives an attribute with the same name as a class attribute, the instance value shadows the class value.') +
      sub('Accessing and deleting members', 'Use dot notation, such as student.name or Student.school. del student.name removes one attribute; del student removes the name binding. Deleting a name does not necessarily destroy the object if another name still refers to it. __del__ is not a reliable place for business cleanup.') +
      code('Two objects, separate state', 'class Student:\n    school = "Central School"\n\n    def __init__(self, name, marks):\n        self.name = name\n        self.marks = marks\n\nfirst = Student("Ravi", 90)\nsecond = Student("Asha", 85)\nfirst.marks = 95\nprint(first.name, first.marks)\nprint(second.name, second.marks)\nprint(first.school)', 'Ravi 95\nAsha 85\nCentral School', 'Both objects use the same class definition and school value, but marks is stored separately on first and second.')
    );

    html += section(3, 'Constructors',
      sub('__init__()', '__init__ is an initializer, not the method that physically creates the object. It receives the newly created instance as self and assigns its starting state.') +
      sub('Default and parameterized constructors', 'A class with no explicit __init__ can use a basic inherited initializer. A parameterized initializer accepts values so each object starts with meaningful data. Default arguments allow callers to omit common values.') +
      sub('Constructor chaining', 'When a child class has its own __init__, call super().__init__(...) to initialize the parent portion. This prevents duplicated initialization logic.') +
      sub('__new__()', '__new__ creates and returns an instance before __init__ runs. It is mainly used for immutable subclasses, controlled instance creation, or advanced patterns. Beginners should normally implement __init__, not override __new__.') +
      code('Default arguments and super()', 'class Person:\n    def __init__(self, name):\n        self.name = name\n\nclass Employee(Person):\n    def __init__(self, name, role="Trainee"):\n        super().__init__(name)\n        self.role = role\n\nworker = Employee("Ravi")\nprint(worker.name, worker.role)', 'Ravi Trainee', 'Employee calls the parent initializer for name and supplies its own default role.')
    );

    html += section(4, 'Variables in OOP',
      sub('Instance variables', 'Instance variables describe one object, such as self.name. They should normally be assigned in __init__ so every object starts in a predictable state.') +
      sub('Class variables', 'Class variables belong to the class and are useful for constants or values shared by all instances. Do not use a mutable class variable such as records = [] when each object should have its own list.') +
      sub('Local variables', 'A local variable exists only during a method call, for example total inside calculate_total. It is not automatically available as object state.') +
      sub('Accessing and modifying variables', 'Read with object.attribute and assign with object.attribute = value. A method is usually safer than unrestricted assignment when a value must obey a rule.') +
      code('Instance versus class variable', 'class Counter:\n    total_created = 0\n\n    def __init__(self, name):\n        self.name = name\n        Counter.total_created += 1\n\na = Counter("A")\nb = Counter("B")\nprint(a.name, b.name)\nprint(Counter.total_created)', 'A B\n2', 'name is different for each instance; total_created is deliberately shared and counts all objects created.')
    );

    html += section(5, 'Methods in Python',
      sub('Instance methods', 'An instance method receives self and works with one object. Calling account.deposit(100) automatically passes account as the first argument.') +
      sub('Class methods', '@classmethod changes the first automatic argument to cls. Use it for alternate constructors or operations that work with class-level data.') +
      sub('Static methods', '@staticmethod disables automatic self and cls. It is a utility placed inside a class because it conceptually belongs to that class, but it does not need object or class state.') +
      sub('self and cls', 'self is a naming convention, not a reserved keyword, although changing it is strongly discouraged. cls is also a convention. Python makes these references explicit so the method signature shows what the method receives.') +
      code('Three method types', 'class Temperature:\n    scale = "Celsius"\n\n    def __init__(self, value):\n        self.value = value\n\n    def fahrenheit(self):\n        return self.value * 9 / 5 + 32\n\n    @classmethod\n    def from_fahrenheit(cls, value):\n        return cls((value - 32) * 5 / 9)\n\n    @staticmethod\n    def is_valid(value):\n        return value >= -273.15\n\nt = Temperature.from_fahrenheit(212)\nprint(t.value)\nprint(Temperature.is_valid(t.value))', '100.0\nTrue', 'The class method constructs a Temperature through cls, the instance method reads self.value, and the static method validates a value without either reference.')
    );

    html += section(6, 'Encapsulation',
      sub('Public, protected, and private members', 'Public members have ordinary names and are intended for normal use. A single leading underscore, such as _balance, communicates “internal use” but does not enforce privacy. A double leading underscore triggers name mangling, which makes accidental access from subclasses less likely; it is not absolute security.') +
      sub('Getters, setters, and properties', 'A getter reads a value and a setter validates a new value. Python properties let callers use natural attribute syntax while the class runs methods behind the scenes. This is useful for invariants such as age >= 0 or balance never becoming negative.') +
      code('Validated property', 'class Product:\n    def __init__(self, price):\n        self.price = price\n\n    @property\n    def price(self):\n        return self._price\n\n    @price.setter\n    def price(self, value):\n        if value < 0:\n            raise ValueError("Price cannot be negative")\n        self._price = value\n\nitem = Product(100)\nitem.price = 125\nprint(item.price)', '125', 'The setter validates 125 and stores it as _price. The getter returns the validated value.')
    );

    html += section(7, 'Abstraction',
      sub('Abstract classes and methods', 'An abstract class describes a contract for related subclasses. An abstract method names behavior that concrete subclasses must implement. Python provides ABC and @abstractmethod in the abc module.') +
      sub('Interfaces using abstract classes', 'Python does not require a separate interface keyword. An ABC can play that role by defining required methods. Attempting to instantiate a class with an unimplemented abstract method raises TypeError.') +
      code('Abstract payment contract', 'from abc import ABC, abstractmethod\n\nclass Payment(ABC):\n    @abstractmethod\n    def pay(self, amount):\n        pass\n\nclass CardPayment(Payment):\n    def pay(self, amount):\n        return f"Card paid {amount}"\n\npayment = CardPayment()\nprint(payment.pay(500))', 'Card paid 500', 'Payment defines the required operation, while CardPayment provides the concrete implementation.')
    );

    html += section(8, 'Inheritance',
      sub('Inheritance forms', 'Single inheritance has one parent. Multilevel inheritance forms a chain. Hierarchical inheritance gives several children one parent. Multiple inheritance has more than one parent. Hybrid inheritance combines these forms.') +
      sub('super()', 'super() gives access to the next implementation in the method-resolution order. It is preferable to naming a parent directly because it works cooperatively with multiple inheritance.') +
      sub('MRO and the diamond problem', 'The method-resolution order is the sequence Python uses to search classes. Python uses C3 linearization to create a consistent order. In a diamond shape, two classes inherit from one base and a final class inherits from both; cooperative super() ensures the shared base is initialized once.') +
      code('Multiple inheritance and MRO', 'class Device:\n    def start(self):\n        return ["Device"]\n\nclass Camera(Device):\n    def start(self):\n        return super().start() + ["Camera"]\n\nclass Phone(Device):\n    def start(self):\n        return super().start() + ["Phone"]\n\nclass SmartPhone(Camera, Phone):\n    def start(self):\n        return super().start() + ["SmartPhone"]\n\nprint(SmartPhone().start())\nprint([cls.__name__ for cls in SmartPhone.mro()])', "['Device', 'Phone', 'Camera', 'SmartPhone']\n['SmartPhone', 'Camera', 'Phone', 'Device', 'object']", 'The exact list demonstrates the MRO chain. super() follows that chain rather than simply jumping to one named parent.')
    );

    html += section(9, 'Polymorphism',
      sub('Meaning', 'Polymorphism means one operation can work with many object types. Python commonly uses runtime polymorphism and duck typing: if an object provides the required method, the caller can use it.') +
      sub('Overloading and overriding', 'Python does not choose between methods with the same name by parameter count in the Java-style compile-time sense. Use default arguments, *args, or separate method names as alternatives. Method overriding occurs when a child supplies a new implementation with the same name.') +
      sub('Operator overloading and runtime dispatch', 'Operators call dunder methods such as __add__ and __eq__. At runtime, Python dispatches the method belonging to the actual object, so the same function call can produce different behavior.') +
      code('Duck typing', 'class PdfReport:\n    def export(self):\n        return "PDF exported"\n\nclass CsvReport:\n    def export(self):\n        return "CSV exported"\n\ndef publish(report):\n    print(report.export())\n\npublish(PdfReport())\npublish(CsvReport())', 'PDF exported\nCSV exported', 'publish does not check the concrete class. It only requires an object with an export method.')
    );

    html += section(10, 'Magic / Dunder Methods',
      sub('What they are', 'Dunder means double underscore. These methods connect user-defined objects to Python syntax. They are called by Python in response to operations, rather than usually being called directly.') +
      sub('Important methods', '__init__ initializes, __new__ creates, __str__ provides friendly text, __repr__ provides debugging text, __len__ supports len(), __add__ supports +, __eq__ supports equality, __lt__ supports ordering, __call__ lets an object behave like a function, and __del__ may run during cleanup but should not manage important resources.') +
      code('Custom object behavior', 'class Money:\n    def __init__(self, amount):\n        self.amount = amount\n\n    def __str__(self):\n        return f"Rs.{self.amount:.2f}"\n\n    def __add__(self, other):\n        return Money(self.amount + other.amount)\n\n    def __eq__(self, other):\n        return isinstance(other, Money) and self.amount == other.amount\n\na = Money(100)\nb = Money(50)\nprint(a + b)\nprint(a == Money(100))', 'Rs.150.00\nTrue', 'The + operator calls __add__, print calls __str__, and == calls __eq__.')
    );

    html += section(11, 'Object Relationships',
      sub('Association and dependency', 'Association means two objects know about or communicate with each other. A dependency is a temporary “uses” relationship, such as a function receiving a logger. These relationships do not imply ownership.') +
      sub('Aggregation and composition', 'Aggregation is a has-a relationship where the contained object can exist independently, such as a Team using an existing Player. Composition is stronger ownership: a House creates its Room objects and their life cycle is tied to the house.') +
      sub('IS-A and HAS-A', 'Inheritance expresses IS-A: a SavingsAccount is an Account. Composition expresses HAS-A: a Car has an Engine. Prefer composition when the relationship is about assembling parts rather than specialization.') +
      code('Composition', 'class Engine:\n    def start(self):\n        return "Engine started"\n\nclass Car:\n    def __init__(self):\n        self.engine = Engine()\n\n    def start(self):\n        return self.engine.start()\n\nprint(Car().start())', 'Engine started', 'Car owns an Engine object and delegates the start operation to it. This is HAS-A, not IS-A.')
    );

    html += section(12, 'Decorators in OOP',
      sub('Method and built-in decorators', 'A decorator wraps or changes a function or class. @property changes a method into managed attribute access. @classmethod and @staticmethod change how Python binds a method. The @ syntax is shorter than assigning the decorated result manually.') +
      sub('Class decorators', 'A class decorator receives a class and returns a class, often adding registration, logging, validation, or metadata. Decorators should have one clear responsibility and preserve metadata when appropriate.') +
      code('A class decorator', 'def register(cls):\n    cls.registered = True\n    return cls\n\n@register\nclass Plugin:\n    pass\n\nprint(Plugin.registered)', 'True', 'Python evaluates the class and then passes it to register. The returned class is bound to the name Plugin.')
    );

    html += section(13, 'Dataclasses',
      sub('@dataclass and fields', 'A dataclass is designed for classes whose main purpose is storing data. The decorator can generate __init__, __repr__, and __eq__, reducing repetitive code. Type annotations describe fields.') +
      sub('Defaults, field(), frozen, and inheritance', 'Use ordinary defaults for immutable values. Use field(default_factory=list) for a new list per object. frozen=True prevents normal field assignment. Dataclasses can inherit from other dataclasses, but default and non-default fields must be arranged carefully.') +
      code('Dataclass with a safe default', 'from dataclasses import dataclass, field\n\n@dataclass\nclass Course:\n    title: str\n    tags: list[str] = field(default_factory=list)\n\nfirst = Course("Python")\nsecond = Course("OOP")\nfirst.tags.append("beginner")\nprint(first)\nprint(second)', "Course(title='Python', tags=['beginner'])\nCourse(title='OOP', tags=[])", 'default_factory creates a fresh list for each Course, so modifying first does not modify second.')
    );

    html += section(14, 'Advanced OOP Concepts',
      sub('Object lifecycle and garbage collection', 'An object is created, initialized, used, and eventually becomes unreachable. Python uses reference counting in common implementations plus cyclic garbage collection. Use context managers for files, locks, and other resources instead of depending on __del__.') +
      sub('Shallow and deep copy', 'A shallow copy creates a new outer object but keeps references to nested objects. A deep copy recursively copies nested objects. Choose deliberately because deep copying can be expensive or invalid for resources.') +
      sub('__slots__ and descriptors', '__slots__ can reduce per-object memory and restrict dynamic attributes. A descriptor is an object implementing methods such as __get__ or __set__; properties are a familiar descriptor-based feature.') +
      sub('Mixins and metaclasses', 'A mixin is a small reusable class that adds one focused capability and is not usually meant to stand alone. A metaclass controls class creation; it is powerful but should be reserved for framework-level behavior.') +
      sub('Reflection, dynamic access, and protocols', 'Reflection means inspecting objects with type, dir, getattr, setattr, and hasattr. Dynamic access is useful for adapters but should validate names. Protocols support structural typing: an object qualifies by providing the required behavior, even without inheriting from a specific class.') +
      code('Shallow versus deep copy', 'from copy import copy, deepcopy\n\noriginal = [[1, 2], [3, 4]]\nshallow = copy(original)\ndeep = deepcopy(original)\noriginal[0].append(99)\nprint(shallow)\nprint(deep)', '[[1, 2, 99], [3, 4]]\n[[1, 2], [3, 4]]', 'The shallow copy shares the nested first list; the deep copy owns independent nested lists.')
    );

    html += section(15, 'SOLID Principles',
      sub('Single Responsibility', 'A class should have one main reason to change. Separate invoice calculation from invoice printing so a display change does not risk calculation logic.') +
      sub('Open/Closed and Liskov Substitution', 'Open/Closed means extend behavior without rewriting stable code. Liskov Substitution means a subclass should honor the expectations of its base type; a subclass that breaks those expectations is a design problem.') +
      sub('Interface Segregation and Dependency Inversion', 'Prefer small focused interfaces over one large interface. High-level policy should depend on abstractions, not concrete database or email classes. Dependency injection makes the concrete service a parameter, which improves testing.') +
      code('Dependency inversion through injection', 'class OrderService:\n    def __init__(self, payment_gateway):\n        self.payment_gateway = payment_gateway\n\n    def checkout(self, amount):\n        return self.payment_gateway.pay(amount)\n\nclass FakeGateway:\n    def pay(self, amount):\n        return f"Test payment: {amount}"\n\nprint(OrderService(FakeGateway()).checkout(100))', 'Test payment: 100', 'OrderService depends on the small pay behavior, not on a hard-coded payment provider. A test double can be injected easily.')
    );

    html += section(16, 'Design Patterns',
      sub('What a pattern is', 'A design pattern is a reusable design idea, not a copy-and-paste class. Patterns help teams discuss common structures, but applying a pattern unnecessarily adds complexity.') +
      sub('Creational patterns', 'Singleton restricts creation to one shared instance, although module-level state is often simpler in Python. Factory chooses which object to create. Abstract Factory creates related families. Builder constructs a complex object step by step.') +
      sub('Structural patterns', 'Adapter converts one interface into another. Decorator adds behavior by wrapping an object. Repository hides storage details behind operations such as add and find.') +
      sub('Behavioral patterns', 'Observer notifies subscribers when state changes. Strategy makes an algorithm replaceable. Command represents an action as an object, enabling queues, logs, and undo operations.') +
      code('Strategy pattern', 'class Checkout:\n    def __init__(self, discount_strategy):\n        self.discount_strategy = discount_strategy\n\n    def total(self, price):\n        return self.discount_strategy(price)\n\ndef no_discount(price):\n    return price\n\ndef student_discount(price):\n    return price * 0.9\n\nprint(Checkout(student_discount).total(100))', '90.0', 'Checkout does not contain every pricing rule. It receives a strategy, so the algorithm can be replaced without changing Checkout.')
    );

    html += '<h2>Complete learning checklist</h2>' + bullets(['Can you explain the difference between a class and an object?', 'Can you create independent instance state with __init__ and self?', 'Can you choose instance, class, and static methods correctly?', 'Can you protect valid state with a property?', 'Can you explain IS-A versus HAS-A and choose composition when appropriate?', 'Can you predict MRO and explain overriding and polymorphism?', 'Can you use dataclasses for data-focused objects?', 'Can you identify when a SOLID principle or design pattern is useful?']);
    html += '<h2>Common mistakes and fixes</h2>' + bullets(['Forgetting self: add it as the first parameter of every instance method.', 'Using a mutable class variable for per-object data: initialize a new list or dictionary inside __init__.', 'Calling a class method as if it were an instance method: use cls for class state and self for instance state.', 'Using inheritance only to reuse code: prefer composition when the relationship is HAS-A.', 'Treating _name as secure private data: it is a convention; enforce rules through methods or properties.', 'Writing a huge class: split responsibilities and inject collaborators.', 'Using __del__ for important cleanup: use with and context managers instead.']);
    html += '<h2>Practice exercises with solutions</h2>';
    html += '<h3>Exercise 1: Student class</h3><p>Create a Student class with name, marks, a validated marks property, and a grade method.</p>' + code('Solution', 'class Student:\n    def __init__(self, name, marks):\n        self.name = name\n        self.marks = marks\n\n    @property\n    def marks(self):\n        return self._marks\n\n    @marks.setter\n    def marks(self, value):\n        if not 0 <= value <= 100:\n            raise ValueError("Marks must be between 0 and 100")\n        self._marks = value\n\n    def grade(self):\n        return "A" if self.marks >= 80 else "B"\n\nprint(Student("Ravi", 90).grade())', 'A', 'The setter rejects invalid marks before storing them, and grade reads the validated value.');
    html += '<h3>Exercise 2: Choose inheritance or composition</h3><p>Model a Car that uses an Engine. Do not make Car inherit from Engine.</p>' + code('Solution', 'class Engine:\n    def start(self):\n        return "started"\n\nclass Car:\n    def __init__(self):\n        self.engine = Engine()\n\n    def start(self):\n        return self.engine.start()\n\nprint(Car().start())', 'started', 'A Car has an Engine, so composition expresses the relationship more accurately than inheritance.');
    html += '<h2>Final summary</h2><p>Start OOP with a class that owns related state and behavior. Create objects by calling the class, initialize them in __init__, and use self to work with the current object. Add properties when state needs validation, class methods for alternate constructors, and static methods for related utilities. Use inheritance for genuine specialization, composition for assembled parts, and polymorphism for a common interface. Dataclasses reduce boilerplate for data containers. Advanced tools such as descriptors, metaclasses, and patterns are valuable only when they solve a real design problem.</p></div>';
    return html;
  };
})();
