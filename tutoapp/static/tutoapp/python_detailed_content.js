(function () {
  function item(title, objective, definition, explanation, internals, terms, syntax, beginner, intermediate, realWorld, approaches, tradeoffs, mistakes, best, related, questions, exercises, solutions, summary) {
    return {title, objective, definition, explanation, internals, terms, syntax, beginner, intermediate, realWorld, approaches, tradeoffs, mistakes, best, related, questions, exercises, solutions, summary};
  }

  window.PY_DETAILED = {
    "Python Introduction": item(
      "Python introduces programming through readable instructions, values, decisions, repetition, and reusable functions. It is used in web applications, automation, data analysis, testing, and artificial intelligence.",
      ["Run a Python program", "Identify source code, interpreter, expression, statement, and function", "Predict and verify output"],
      "Python is a high-level, general-purpose programming language. High-level means it hides many machine details; general-purpose means it can solve many kinds of problems.",
      "A Python program is a sequence of statements. Python evaluates each statement, stores values in objects, and produces output when a function such as print is called. Indentation makes the structure of decisions and loops visible. The language is dynamically typed: a name can refer to objects of different types at different times.",
      "The interpreter tokenizes source code, parses its structure, compiles it to bytecode, and executes that bytecode in the Python virtual machine. Beginners can think of the interpreter as the program that reads Python instructions and performs them in order.",
      ["source code: text written by the programmer", "interpreter: software that executes Python", "expression: code that produces a value", "statement: an instruction", "function: reusable behavior"],
      "print(value)\nname = expression\nif condition:\n    indented_statement",
      {code:"print(\"Hello, Python\")\nprint(2 + 3)", lines:["The first print receives a string.", "The second print evaluates 2 + 3 before printing it."], output:"Hello, Python\n5", why:"The text is printed unchanged and the arithmetic expression produces 5."},
      {code:"name = \"Asha\"\nage = 20\nif age >= 18:\n    print(name, \"is an adult\")", lines:["name and age are bindings.", "The condition compares age with 18.", "The indented statement runs only when the condition is true."], output:"Asha is an adult", why:"20 is greater than or equal to 18."},
      {code:"price = 1200\nquantity = 3\ntotal = price * quantity\nprint(f\"Order total: Rs.{total}\")", lines:["The first two lines represent business inputs.", "Multiplication calculates total.", "The f-string inserts total into a message."], output:"Order total: Rs.3600", why:"1200 multiplied by 3 equals 3600."},
      ["Use the interactive shell for one expression, a .py script for repeatable programs, and a notebook for experiments with narrative output."],
      "Readable syntax and a large ecosystem are major advantages. Dynamic typing and runtime package differences can defer errors, and Python is not the fastest choice for every CPU-heavy workload.",
      ["Forgetting that scripts need print to show a value.", "Using inconsistent indentation.", "Running a different Python installation than the one you configured."],
      ["Use descriptive names.", "Run small programs frequently.", "Read the first traceback line that points to your code.", "Keep examples reproducible."],
      ["variables", "data types", "operators", "conditions", "functions"],
      [["What is Python?", "A high-level, general-purpose programming language."], ["What does an interpreter do?", "It reads, parses, and executes Python instructions."], ["Why is indentation important?", "It defines blocks such as if and for."]],
      ["Print your name and the result of 7 * 8.", "Write a program that reports whether a number is positive, negative, or zero."],
      ["print(\"Ravi\")\nprint(7 * 8)", "number = -3\nif number > 0:\n    print(\"positive\")\nelif number < 0:\n    print(\"negative\")\nelse:\n    print(\"zero\")"],
      "Python programs are readable instructions evaluated by an interpreter. Learn by changing one value, predicting output, and checking the result."
    ),
    "Python Editors": item(
      "An editor is where source code is written and saved; the Python interpreter is what runs it. This distinction prevents many setup problems.",
      ["Choose an editor for a task", "Run a file with the intended interpreter", "Distinguish an editor, terminal, IDE, and notebook"],
      "A Python editor creates .py files. An IDE adds project navigation, debugging, testing, and environment management. The interpreter remains a separate runtime even when an IDE hides that detail.",
      "Notepad can edit Python because Python files are plain text. A code editor adds syntax highlighting and indentation help. An IDE adds debugging and project tools. Jupyter notebooks mix code, output, and explanation, which is useful for experiments but different from a normal application file.",
      "When you run python lesson.py, the operating system starts the Python executable and passes the file path to it. VS Code may use a system interpreter or a virtual environment. Packages must be installed in the same environment that runs the file.",
      ["editor: writes text", "IDE: editor plus development tools", "terminal: text interface for commands", "interpreter: executes Python", "virtual environment: isolated package installation"],
      "python filename.py\npython -m module_name\npython -c \"print(2 + 2)\"",
      {code:"# hello.py\nprint(\"Saved in a file\")", lines:["The comment identifies the file.", "The print call runs when the file is executed."], output:"Saved in a file", why:"The interpreter reads the saved file from top to bottom."},
      {code:"import sys\nprint(sys.executable)\nprint(sys.version.split()[0])", lines:["sys exposes runtime information.", "sys.executable identifies the interpreter.", "sys.version contains the version string."], output:"Path to the selected Python executable\n3.x.x", why:"The exact path and version depend on the environment."},
      {code:"# Project setup commands:\n# python -m venv .venv\n# .venv\\\\Scripts\\\\python -m pip install requests\nprint(\"Use the project interpreter\")", lines:["A virtual environment isolates dependencies.", "Installing through its Python connects pip to that environment.", "The program can now import packages installed there."], output:"Use the project interpreter", why:"The script uses the environment that owns its packages."},
      ["A plain editor plus terminal teaches fundamentals, VS Code is useful for projects, and notebooks are useful for exploratory data work."],
      "Editors improve feedback but cannot fix invalid logic. IDEs provide more features but require configuration. Notebooks are convenient but can hide execution order.",
      ["Installing a package globally but running a virtual environment.", "Saving filename.py.txt on Windows.", "Using notebook cells out of order.", "Running a different interpreter from the one shown by the editor."],
      ["Confirm sys.executable.", "Use one environment per project.", "Use python -m pip.", "Avoid file names that shadow standard modules."],
      ["installation", "virtual environments", "modules", "packages", "debugging"],
      [["Is VS Code Python?", "No. It is an editor; the interpreter runs Python."], ["Why use a virtual environment?", "To isolate project dependencies and versions."], ["What is a notebook?", "A document containing executable cells and rich output."]],
      ["Create hello.py and run it from a terminal.", "Print the selected interpreter path and version."],
      ["print(\"Hello from a script\")", "import sys\nprint(sys.executable)\nprint(sys.version)"],
      "Choose the simplest tool that gives useful feedback, but always know which interpreter actually runs your code."
    ),
    "Python Syntax": item(
      "Syntax is the set of rules that tells Python how code must be written. It includes names, values, operators, statements, expressions, punctuation, and indentation.",
      ["Read syntax errors", "Use indentation and punctuation correctly", "Separate expressions from statements"],
      "Python syntax is the grammar of Python programs. A syntax error occurs before normal execution because Python cannot construct a valid program from the text.",
      "Python uses newlines and indentation to make blocks visible. A colon introduces a block after if, for, while, def, and class. The following lines must be indented consistently. Parentheses can continue an expression across lines.",
      "Python tokenizes source into keywords, names, literals, operators, and delimiters. The parser checks whether those tokens follow the grammar. Only after parsing succeeds does execution begin.",
      ["keyword: reserved word such as if or def", "identifier: programmer-defined name", "literal: written value such as 42", "block: indented group of statements", "syntax error: invalid structure"],
      "if condition:\n    statement\nname = expression\nfunction(argument)",
      {code:"score = 75\nif score >= 50:\n    print(\"Pass\")", lines:["score is assigned.", "The colon introduces the if block.", "Indentation makes print part of that block."], output:"Pass", why:"75 >= 50 is True."},
      {code:"numbers = [1, 2, 3]\nsquares = [n * n for n in numbers]\nprint(squares)", lines:["The list literal creates values.", "The comprehension evaluates n*n for each value.", "print displays the resulting list."], output:"[1, 4, 9]", why:"Each number is multiplied by itself."},
      {code:"email = \"student@example.com\"\nif \"@\" not in email:\n    print(\"Invalid email\")\nelse:\n    print(\"Email accepted\")", lines:["email stores input.", "not in checks for absence.", "else runs when the check passes."], output:"Email accepted", why:"The string contains @."},
      ["Use four spaces for indentation, parentheses for long expressions, and a formatter such as Black after understanding the code."],
      "Python syntax is compact and readable, but whitespace is meaningful. A formatter improves consistency; it cannot decide whether logic is correct.",
      ["Mixing tabs and spaces.", "Forgetting the colon.", "Using = when == was intended.", "Indenting at the wrong level."],
      ["Read the reported line and the line before it.", "Keep blocks shallow.", "Name intermediate values.", "Format consistently."],
      ["indentation", "conditions", "loops", "functions", "exceptions"],
      [["What does a colon do?", "It introduces the indented suite of a compound statement."], ["When does a syntax error occur?", "During parsing, before normal execution."], ["Why does indentation matter?", "It defines block membership."]],
      ["Fix a missing-colon example.", "Rewrite a nested condition using an intermediate variable."],
      ["if True:\n    print(\"valid\")", "has_access = is_member and not is_suspended\nif has_access:\n    print(\"Allow\")"],
      "Syntax gives Python the structure it needs to understand your program."
    ),
    "Python Comments": item(
      "Comments explain intent to human readers. They are valuable when they describe why code exists, a constraint, or a surprising decision.",
      ["Write useful comments", "Distinguish comments from docstrings", "Avoid comments that merely repeat code"],
      "A comment is text ignored by the interpreter. A docstring is a string placed in a module, class, or function to document that object and can be read at runtime.",
      "Use # for a line comment. Use a triple-quoted string as a docstring immediately inside a module, function, or class. Clear names and simple code should explain ordinary mechanics; comments should preserve reasoning.",
      "The tokenizer discards comments before parsing. Docstrings are different: Python stores them in __doc__. help(), IDEs, and documentation tools can use docstrings.",
      ["comment: ignored annotation", "docstring: runtime documentation string", "inline comment: comment after code", "TODO: planned work marker"],
      "# comment\n\ndef function():\n    \"\"\"Document the function contract.\"\"\"\n    pass",
      {code:"# Convert minutes to seconds\nminutes = 5\nseconds = minutes * 60\nprint(seconds)", lines:["The comment describes purpose.", "minutes is input.", "Multiplication performs the conversion.", "print displays the result."], output:"300", why:"Five minutes contains 5*60 seconds."},
      {code:"def area(width, height):\n    \"\"\"Return a rectangle area.\"\"\"\n    return width * height\nprint(area.__doc__)\nprint(area(4, 3))", lines:["def creates a function.", "The triple-quoted string becomes its docstring.", "return sends the product back.", "__doc__ reads the documentation."], output:"Return a rectangle area.\n12", why:"The function documents itself and calculates 4*3."},
      {code:"discount = 0.10  # Members receive ten percent off\nprice = 1000\nfinal_price = price * (1 - discount)\nprint(final_price)", lines:["The comment records the business policy.", "The expression subtracts the discount.", "The final value is printed."], output:"900.0", why:"1000*(1-0.10) equals 900."},
      ["Use comments for intent and constraints, docstrings for public APIs, and issue tracking for large TODOs."],
      "Comments add no execution cost, but stale comments create confusion. A docstring is discoverable; a comment is local context.",
      ["Commenting every obvious line.", "Leaving outdated comments.", "Using docstrings as arbitrary multiline comments.", "Writing secrets in comments."],
      ["Prefer self-explanatory code.", "Update comments with code.", "Document inputs, outputs, side effects, and exceptions."],
      ["documentation", "functions", "classes", "testing", "type hints"],
      [["Are comments executed?", "No, ordinary comments are discarded."], ["What is a docstring?", "A documentation string stored on a module, function, or class."], ["What should a comment explain?", "Intent, constraints, or a surprising decision."]],
      ["Add a useful comment without describing obvious syntax.", "Write a function with a docstring and inspect __doc__."],
      ["# Store cents to avoid floating-point money errors", "def greet(name):\n    \"\"\"Return a friendly greeting.\"\"\"\n    return f\"Hello, {name}\"\nprint(greet.__doc__)"],
      "Good comments preserve reasoning. Clear code, meaningful names, tests, and docstrings work together."
    ),
    "Python Variables": item(
      "Variables give names to objects so a program can use data more than once.",
      ["Assign and reassign names", "Distinguish identity from equality", "Recognize mutable and immutable values"],
      "A variable is a name bound to an object. Reassignment changes the binding; it does not change the type of the name.",
      "Assignment evaluates the right side first, then binds its result to the left-side name. Multiple names can reference one object. Mutating a shared list changes the object; rebinding one name changes only that name.",
      "Python stores objects in memory and names in namespaces. Each object has a type, identity, and value. Assignment normally binds a name rather than copying an object.",
      ["binding: association of a name with an object", "namespace: mapping of names to objects", "identity: object uniqueness checked with is", "equality: equal values checked with ==", "mutable: can change in place"],
      "name = expression\nname += value\nfirst = second = expression",
      {code:"name = \"Asha\"\nage = 25\nprint(name, age)", lines:["name binds to a string.", "age binds to an integer.", "print reads both bindings."], output:"Asha 25", why:"The names refer to the values assigned above."},
      {code:"items = [\"pen\"]\nalias = items\nalias.append(\"book\")\nprint(items)\nprint(items is alias)", lines:["alias refers to the same list.", "append mutates the shared list.", "is checks object identity."], output:"['pen', 'book']\nTrue", why:"Both names observe one mutated list."},
      {code:"balance = 1000\ndeposit = 250\nbalance += deposit\nprint(balance)", lines:["balance is starting state.", "deposit is a transaction value.", "+= calculates and rebinds the new balance."], output:"1250", why:"1000 plus 250 equals 1250."},
      ["Simple assignment for ordinary state", "Unpacking for structured values", "copy() or list() when independent mutable state is required"],
      "Names make state readable, but aliasing can create unexpected changes. Immutable values are safer to share; copies are appropriate for independent state.",
      ["Using a name before assignment.", "Using is instead of == for values.", "Accidentally sharing a mutable list.", "Naming a variable list, id, or str."],
      ["Use descriptive names.", "Keep scopes small.", "Copy mutable data deliberately.", "Use UPPER_CASE for constants by convention."],
      ["data types", "scope", "mutability", "lists", "dictionaries"],
      [["Does a Python variable have a fixed type?", "No; the referenced object has a type."], ["What is == versus is?", "== compares values; is checks identity."], ["Why can two names change together?", "They can reference the same mutable object."]],
      ["Predict an aliasing example.", "Copy a list and prove the copy is independent."],
      ["a=[1]; b=a; b.append(2); print(a)", "a=[1]; b=a.copy(); b.append(2); print(a); print(b)"],
      "Think in terms of names, objects, bindings, identity, equality, and deliberate mutation."
    ),
    "Python Data Types": item(
      "A data type describes what a value represents and which operations make sense for it.",
      ["Identify built-in types", "Convert values safely", "Choose a type that matches the problem"],
      "A type is a classification and behavior contract for an object. type inspects a value; isinstance checks whether it belongs to a type or subclass.",
      "Python includes int, float, complex, bool, str, None, list, tuple, set, and dict. Lists and dictionaries are mutable; strings and tuples are immutable. Functions and classes are objects too.",
      "Every object carries a reference to its type. Operators dispatch according to that type, which is why + adds numbers but concatenates strings. Dynamic typing moves many checks to runtime.",
      ["int: whole number", "float: floating-point number", "str: Unicode text", "bool: True or False", "None: absence of a value", "mutable: changeable object"],
      "type(value)\nisinstance(value, Type)\nnew_value = Type(value)",
      {code:"values = [42, 3.5, \"hi\", True, None]\nfor value in values:\n    print(type(value).__name__)", lines:["The list contains different objects.", "for visits each value.", "type(...).__name__ prints its type name."], output:"int\nfloat\nstr\nbool\nNoneType", why:"Each object retains its own type."},
      {code:"text = \"42\"\nnumber = int(text)\nprint(number + 8)", lines:["text is a string.", "int converts it.", "Addition is now numeric."], output:"50", why:"42 converts to an integer and 8 is added."},
      {code:"record = {\"name\":\"Ravi\", \"age\":28}\nif isinstance(record.get(\"age\"), int):\n    print(\"Age is numeric\")", lines:["The dictionary represents external data.", "get reads age.", "isinstance verifies the expected type."], output:"Age is numeric", why:"The value 28 is an integer."},
      ["Use int for counts, str for text, bool for flags, list for ordered mutable data, tuple for fixed records, set for uniqueness, and dict for keyed data."],
      "Types make operations meaningful, but dynamic typing defers checks. Conversion can fail and float is approximate.",
      ["Doing arithmetic on unconverted input.", "Using float for exact currency.", "Confusing (value,) with (value).", "Treating None as zero without a decision."],
      ["Validate at boundaries.", "Use isinstance for accepted type families.", "Use type hints to communicate intent.", "Keep data models consistent."],
      ["variables", "conversion", "collections", "type hints", "exceptions"],
      [["What is dynamic typing?", "Names can refer to different types at different times."], ["Why use isinstance?", "It checks a value while respecting inheritance."], ["Which type stores key-value pairs?", "dict."]],
      ["Classify five values.", "Convert a string age and handle invalid input."],
      ["print(type(7).__name__)", "try:\n    age=int(\"x\")\nexcept ValueError:\n    print(\"Enter a whole number\")"],
      "Choose types according to data and operations, then validate values at system boundaries."
    ),
    "Python Numbers": item(
      "Numbers support counting, measurement, pricing, statistics, indexing, and decisions.",
      ["Use arithmetic operators", "Recognize floating-point precision", "Choose a numeric representation"],
      "int represents whole numbers, float represents binary floating-point values, and complex represents real plus imaginary parts. Decimal is useful when decimal rounding must be exact.",
      "The operators +, -, *, /, //, %, and ** have different meanings. / returns a float, // performs floor division, % returns a remainder, and ** raises to a power.",
      "Integers have arbitrary precision. Floats use finite binary representation, so many decimal fractions are approximate. This explains why 0.1 + 0.2 may not equal exactly 0.3.",
      ["operand: value used by an operator", "quotient: result of division", "remainder: result of %", "precision: detail represented", "rounding: choosing a nearby value"],
      "a + b\na / b\na // b\na % b\na ** b\nround(value, digits)",
      {code:"a, b = 17, 5\nprint(a + b)\nprint(a // b)\nprint(a % b)", lines:["+ adds.", "// gives the floor quotient.", "% gives the remainder."], output:"22\n3\n2", why:"17 divided by 5 is 3 remainder 2."},
      {code:"total = 0.1 + 0.2\nprint(total)\nprint(round(total, 2))", lines:["Addition uses binary floating point.", "round controls displayed precision."], output:"0.30000000000000004\n0.3", why:"Binary floating point cannot represent both tenths exactly."},
      {code:"from decimal import Decimal\nprice = Decimal(\"19.99\")\nprint(price * 3)", lines:["Decimal parses exact decimal text.", "Multiplication preserves decimal behavior."], output:"59.97", why:"19.99 multiplied by 3 is the exact decimal 59.97."},
      ["int for counts, float for scientific approximation, Decimal for money, and complex for mathematical domains."],
      "Numeric operations are concise. Float is approximate; Decimal is more exact for decimal business rules but has overhead.",
      ["Using / when integer division was intended.", "Comparing calculated floats with ==.", "Rounding too early.", "Using float for financial totals."],
      ["Round at the presentation or business boundary.", "Use Decimal from strings.", "Test zero, negative, large, and fractional inputs."],
      ["operators", "booleans", "Decimal", "statistics", "input validation"],
      [["What does // do?", "Floor division."], ["Why is 0.1+0.2 approximate?", "Those fractions are approximations in binary floating point."], ["When use Decimal?", "When decimal rounding rules matter, especially for money."]],
      ["Calculate quotient and remainder for 29 and 6.", "Write a receipt using Decimal."],
      ["print(29 // 6, 29 % 6)", "from decimal import Decimal\nprint(Decimal(\"12.50\") * 2)"],
      "Choose numeric behavior and rounding rules that match the domain."
    ),
    "Python Strings": item(
      "Strings represent names, messages, paths, JSON, and user input. They are ordered, indexable, Unicode-aware, and immutable.",
      ["Index and slice text", "Use string methods", "Understand immutability and Unicode"],
      "A string is an immutable sequence of Unicode characters. Indexing selects one character; slicing creates a new string range.",
      "Indexes start at zero; negative indexes count from the end. A slice uses start:stop:step and excludes stop. strip, split, join, replace, lower, and startswith are common transformations.",
      "Python cannot change a string in place. Operations create another string. Unicode represents many writing systems, though display width varies by font and terminal.",
      ["character: one text element", "index: position starting at zero", "slice: selected range", "immutable: cannot change in place", "Unicode: standard for text representation"],
      "text[index]\ntext[start:stop:step]\ntext.method(arguments)",
      {code:"text = \"Python\"\nprint(text[0])\nprint(text[-1])\nprint(text[1:4])", lines:["0 selects P.", "-1 selects the final n.", "1:4 selects positions 1, 2, and 3."], output:"P\nn\nyth", why:"Slices stop before index 4."},
      {code:"raw = \"  Ravi@Example.COM  \"\nemail = raw.strip().lower()\nprint(email)\nprint(email.endswith(\".com\"))", lines:["strip removes outer whitespace.", "lower creates lowercase text.", "endswith checks the suffix."], output:"ravi@example.com\nTrue", why:"The normalized email ends with .com."},
      {code:"line = \"Ravi,Python,92\"\nname, course, score = line.split(\",\")\nprint(f\"{name} scored {score} in {course}\")", lines:["split separates fields.", "Unpacking assigns three names.", "The f-string builds the report."], output:"Ravi scored 92 in Python", why:"The three fields are inserted into the sentence."},
      ["Concatenation for small joins, f-strings for messages, split/join for structured text, and regular expressions for complex patterns."],
      "Strings are safe to share because they are immutable. Repeated concatenation in a large loop can be inefficient; collect parts and join them.",
      ["Out-of-range indexing.", "Expecting strip to remove internal spaces.", "Trying to assign text[0].", "Calling lower without parentheses."],
      ["Normalize at input boundaries.", "Use explicit encodings for files.", "Use f-strings.", "Validate before parsing."],
      ["input", "formatting", "lists", "regular expressions", "file encoding"],
      [["Are strings mutable?", "No; operations return new strings."], ["Why exclude the slice stop?", "It makes adjacent slices compose cleanly."], ["How compare ignoring case?", "Normalize with casefold or lower according to the requirement."]],
      ["Extract a domain from an email.", "Count a word after splitting a sentence."],
      ["email=\"a@b.com\"; print(email.split(\"@\")[1])", "sentence=\"one two one\"; print(sentence.split().count(\"one\"))"],
      "Treat text as an immutable sequence and be explicit about normalization and encoding."
    ),
    "String Formatting": item(
      "Formatting turns values into readable messages, reports, logs, and user interfaces.",
      ["Use f-strings", "Control precision and alignment", "Separate presentation from calculation"],
      "An f-string is a string literal prefixed with f that evaluates expressions inside braces. A format specification controls width, alignment, precision, and separators.",
      "F-strings are usually clearest for Python 3. Expressions belong in braces; a colon begins a format specification such as :.2f or :,.2f. Complex business logic should be calculated before formatting.",
      "Python evaluates expressions, converts values according to the format specification, and builds a new string. Formatting changes presentation, not the original value. Never use eval on formatted user input.",
      ["field: replacement inside braces", "format specification: presentation rules", "precision: displayed digits", "alignment: field placement", "interpolation: inserting values"],
      "f\"{expression:format_spec}\"\n\"{} {}\".format(value1, value2)",
      {code:"name = \"Asha\"\nscore = 92\nprint(f\"{name} scored {score}\")", lines:["The f-string evaluates name and score.", "The values are converted and inserted."], output:"Asha scored 92", why:"Both values appear in their brace positions."},
      {code:"price = 1234567.8\nprint(f\"Rs.{price:,.2f}\")\nprint(f\"{'Python':>10}\")", lines:[", adds separators.", ".2f displays two decimals.", ">10 right-aligns in ten spaces."], output:"Rs.1,234,567.80\n    Python", why:"The format specification controls presentation."},
      {code:"item = \"Notebook\"\nquantity = 3\nunit_price = 45.5\nprint(f\"{item:<12} {quantity:>3} x Rs.{unit_price:>7.2f}\")", lines:["item is left-aligned.", "quantity is right-aligned.", "unit_price is right-aligned with two decimals."], output:"Notebook       3 x Rs.  45.50", why:"Each field receives its requested width."},
      ["f-strings for modern code, format for reusable templates, and csv/json libraries for structured output."],
      "Formatting is expressive and fast. It becomes hard to read when expressions are complex; compute values first. Use parameterized queries rather than string interpolation for SQL.",
      ["Forgetting the f prefix.", "Using the wrong format type.", "Rounding a value when only display rounding was needed.", "Building HTML, SQL, or shell commands unsafely."],
      ["Keep expressions short.", "Use explicit money precision.", "Use serializers for data exchange.", "Test zero, negative, large, and missing values."],
      ["strings", "numbers", "logging", "JSON", "templates"],
      [["What does :.2f mean?", "Display two digits after the decimal point."], ["Why use f-strings?", "They are readable and evaluate expressions directly."], ["Should f-strings build SQL?", "No; use parameterized queries."]],
      ["Format a percentage to one decimal place.", "Create aligned columns for three products."],
      ["rate=0.875; print(f\"{rate:.1%}\")", "for name, price in [(\"Pen\",10),(\"Book\",50)]: print(f\"{name:<8} {price:>6.2f}\")"],
      "Formatting is presentation: calculate and validate first, then format the result."
    ),
    "User Input": item(
      "Input connects a program to a person or external source. input() returns text, even when the user types digits.",
      ["Read text input", "Convert input safely", "Validate with clear feedback"],
      "input(prompt) displays a prompt, waits for a line, removes the ending newline, and returns a string.",
      "A robust flow is read, normalize, validate, convert, and use. int and float can raise ValueError. A loop should ask again instead of crashing.",
      "input reads standard input and blocks until a line is entered. The returned string is untrusted data. Web requests and form values require the same boundary mindset, with server-side validation and context-specific security.",
      ["prompt: message before reading", "validation: checking rules", "conversion: changing type", "ValueError: invalid conversion", "sentinel: value that ends a loop"],
      "value = input(\"Prompt: \")\nnumber = int(value)\nwhile not valid:\n    value = input(\"Try again: \")",
      {code:"name = input(\"Name: \")\nprint(f\"Hello, {name}\")", lines:["input returns typed text.", "The f-string inserts it.", "print displays the greeting."], output:"Name: Ravi\nHello, Ravi", why:"The second line uses the entered value."},
      {code:"text = \"27\"\ntry:\n    age = int(text)\nexcept ValueError:\n    print(\"Enter a whole number\")\nelse:\n    print(age + 1)", lines:["text begins as a string.", "int attempts conversion.", "except handles invalid text.", "else runs after success."], output:"28", why:"27 converts successfully, then one is added."},
      {code:"choice = \"\"\nwhile choice not in {\"1\", \"2\", \"q\"}:\n    choice = input(\"Choose 1, 2, or q: \").strip().lower()\n    if choice not in {\"1\", \"2\", \"q\"}:\n        print(\"Invalid choice\")\nprint(\"Selected:\", choice)", lines:["The loop starts with an invalid choice.", "strip and lower normalize input.", "Set membership checks allowed commands.", "The loop ends only after validation."], output:"Selected: 1", why:"Only an allowed command can leave the loop."},
      ["Command-line input for small tools, request validation for web apps, and configuration files or environment variables for deployment settings."],
      "Input is interactive but introduces blocking, invalid data, and security concerns. Validation improves reliability but does not replace escaping, parameterization, or authorization.",
      ["Doing arithmetic on input without conversion.", "Catching every exception.", "Accepting blank or out-of-range values.", "Trusting browser validation alone."],
      ["Normalize before validating.", "Check type, range, length, and allowed values.", "Give actionable errors.", "Validate again at the owning boundary."],
      ["strings", "exceptions", "loops", "security", "web forms"],
      [["What type does input return?", "str."], ["How handle invalid numbers?", "Catch the specific conversion error and ask again or report failure."], ["Is validation a security boundary?", "It is one defense; use context-specific protections too."]],
      ["Accept an integer from 1 to 10.", "Reject blank input in a menu."],
      ["while True:\n    try:\n        n=int(input(\"1-10: \"))\n        if 1 <= n <= 10: break\n    except ValueError: print(\"Whole number required\")", "choice=input(\"Choice: \").strip()\nif not choice: print(\"Choice is required\")"],
      "Input is always text and may be invalid. Read, normalize, validate, convert, and only then use it."
    ),
    "Python OOP: Complete Tutorial": item(
      "Object-oriented programming (OOP) organizes a program around objects that combine state and behavior. Python OOP is useful when a system contains several related entities, rules, and actions that must remain understandable as the program grows.",
      ["Explain classes, objects, attributes, and methods.", "Use __init__, self, class methods, and static methods correctly.", "Apply encapsulation, abstraction, inheritance, polymorphism, properties, composition, dataclasses, and dunder methods.", "Design and test a small real-world class model."],
      "A class is a reusable definition; an object is a concrete instance of that definition. Attributes represent state and methods represent behavior. The four commonly taught pillars are encapsulation, abstraction, inheritance, and polymorphism.",
      "Start with a class only when an entity has meaningful state or behavior. The constructor initializes valid state. Instance methods receive self and can change one object's state. Class methods receive cls and are useful for alternate constructors. Static methods are namespaced utilities that do not need object or class state. Python does not enforce Java-style private fields; conventions, name mangling, properties, and controlled methods provide encapsulation.",
      "When a class is called, Python creates an instance and then calls __init__ to initialize it. Attribute lookup checks the instance, its class, and the method-resolution order (MRO). A method call such as account.deposit(50) is effectively a function call with account passed as self. Inheritance reuses behavior; composition places one object inside another. Polymorphism lets different classes respond to the same operation.",
      ["class: blueprint for instances", "object: concrete instance", "attribute: data attached to an object or class", "method: function defined on a class", "self: current instance", "cls: current class", "MRO: method lookup order", "duck typing: using an object's behavior rather than its exact type"],
      "class ClassName:\n    class_attribute = value\n    def __init__(self, value):\n        self.value = value\n    def method(self):\n        return self.value\n\nobject_name = ClassName(argument)\nobject_name.method()",
      {code:"class Student:\n    def __init__(self, name, marks):\n        self.name = name\n        self.marks = marks\n\nstudent = Student(\"Ravi\", 90)\nprint(student.name, student.marks)", lines:["class Student defines a reusable type.", "__init__ receives the new object as self.", "self.name and self.marks store instance-specific state.", "Calling Student creates an object and initializes it.", "The final line reads the two attributes."], output:"Ravi 90", why:"The object was initialized with the arguments Ravi and 90."},
      {code:"class Employee:\n    company = \"ABC\"\n\n    def __init__(self, name):\n        self.name = name\n\n    @classmethod\n    def company_name(cls):\n        return cls.company\n\n    @staticmethod\n    def is_valid_name(name):\n        return bool(name.strip())\n\nemployee = Employee(\"Asha\")\nprint(employee.name)\nprint(Employee.company_name())\nprint(Employee.is_valid_name(\"Asha\"))", lines:["company is shared class state.", "name is instance state.", "@classmethod passes the class as cls.", "@staticmethod receives no automatic object or class.", "The three calls demonstrate the different responsibilities."], output:"Asha\nABC\nTrue", why:"The instance supplies Asha, the class supplies ABC, and the utility confirms that a non-blank name is valid."},
      {code:"from abc import ABC, abstractmethod\n\nclass BankAccount(ABC):\n    def __init__(self, owner, balance=0):\n        self.owner = owner\n        self._balance = balance\n\n    @property\n    def balance(self):\n        return self._balance\n\n    def deposit(self, amount):\n        if amount <= 0:\n            raise ValueError(\"Deposit must be positive\")\n        self._balance += amount\n\n    @abstractmethod\n    def account_type(self):\n        pass\n\nclass SavingsAccount(BankAccount):\n    def account_type(self):\n        return \"Savings\"\n\naccounts = [SavingsAccount(\"Ravi\", 10000)]\naccounts[0].deposit(500)\nfor account in accounts:\n    print(account.owner, account.account_type(), account.balance)", lines:["ABC marks BankAccount as an abstract base class.", "The protected-style balance is exposed through a read-only property.", "deposit validates a business rule before changing state.", "SavingsAccount implements the required account_type method.", "The loop uses the common interface without checking the concrete class."], output:"Ravi Savings 10500", why:"The initial 10000 balance increases by a valid 500 deposit, and polymorphism supplies the account type."},
      ["Use a simple class for one coherent entity.", "Use inheritance only for a genuine is-a relationship.", "Use composition when one object has or uses another.", "Use a dataclass when the class mainly stores data.", "Use an abstract base class when subclasses must honor a contract."],
      "OOP improves cohesion, reuse, and testability, but too many classes can obscure a small problem. Inheritance can create tight coupling and fragile hierarchies. Properties and validation improve invariants but add code. Dataclasses reduce boilerplate but are not a replacement for domain behavior.",
      ["Forgetting self in an instance method.", "Changing a class variable when instance state was intended.", "Trying to instantiate a class with an unimplemented abstract method.", "Using inheritance only to reuse a few lines.", "Exposing mutable internal state without validation.", "Calling a method with the wrong assumption about self or cls."],
      ["Keep each class focused.", "Validate state at construction and mutation boundaries.", "Prefer composition when the relationship is has-a.", "Use type hints and small methods.", "Write tests for normal, invalid, and boundary cases.", "Document public classes and methods."],
      ["constructors", "scope and namespaces", "exceptions", "type hints", "testing", "design patterns"],
      [["What is the difference between a class and an object?", "A class is the definition; an object is a concrete instance."], ["Why is self written explicitly?", "Python makes the instance passed to a method visible in the method signature."], ["What are the four pillars?", "Encapsulation, abstraction, inheritance, and polymorphism."], ["What does MRO determine?", "The order Python uses to find methods and attributes."], ["When is composition better than inheritance?", "When an object contains or delegates to another object rather than being a specialized form of it."]],
      ["Create a Student class with a validated marks property.", "Create Shape, Circle, and Rectangle classes with an area method.", "Add a CurrentAccount subclass to the bank example and test an invalid withdrawal."],
      ["class Student:\n    def __init__(self, marks):\n        self.marks = marks\n    @property\n    def marks(self):\n        return self._marks\n    @marks.setter\n    def marks(self, value):\n        if not 0 <= value <= 100:\n            raise ValueError(\"Marks must be 0..100\")\n        self._marks = value", "from abc import ABC, abstractmethod\nclass Shape(ABC):\n    @abstractmethod\n    def area(self): pass\nclass Rectangle(Shape):\n    def __init__(self, width, height):\n        self.width, self.height = width, height\n    def area(self):\n        return self.width * self.height\nprint(Rectangle(4, 3).area())", "try:\n    account.withdraw(-1)\nexcept ValueError as error:\n    print(error)"],
      "OOP is a modeling tool, not a requirement for every script. Begin with a clear class responsibility, protect valid state, choose composition or inheritance deliberately, and verify behavior with examples and tests."
    )
  };

  var oopLesson = window.PY_DETAILED["Python OOP: Complete Tutorial"];
  oopLesson.explanation = "A class is a design for a kind of object. It describes which data the object should hold and which actions it can perform. An object is one real value created from that class. For example, Student is a class, while student1 and student2 are two different Student objects. Both objects follow the same design, but each stores its own name and marks.\n\nTo implement a class, write the class keyword, a class name, and an indented body. Put initial data in __init__. The first parameter of an instance method is conventionally named self; Python supplies it automatically when the method is called through an object. Assigning self.name creates an instance attribute. Calling Student(\"Ravi\", 90) creates a new object, runs __init__, and stores Ravi and 90 inside that object.\n\nA class can contain attributes and methods. An attribute is data, such as student.name. A method is behavior, such as student.introduce(). The dot operator selects an attribute or method from an object. Two objects made from the same class can call the same method while producing different results because self refers to the particular object making the call. This is the central relationship between classes and objects: the class defines behavior once, and objects hold separate state.\n\nUse a class when several values belong together and the operations on those values should stay close to them. A Student class is clearer than passing name and marks separately to many unrelated functions. Do not create a class only because it is fashionable; a small calculation may be clearer as a function.";
  oopLesson.why = "Classes and objects help us model real entities such as students, orders, bank accounts, users, and products. Without a class, the data and rules for one entity become scattered across separate variables and functions. A class keeps related state and behavior together, prevents repeated code, and gives each object an independent state. For example, changing student1.marks does not accidentally change student2.marks. This makes larger programs easier to read, test, extend, and debug.";
  oopLesson.internals = "When Python evaluates class Student:, it creates a class object and stores its methods in the class namespace. When Student(\"Ravi\", 90) is evaluated, Python creates a new instance, then calls Student.__init__(new_instance, \"Ravi\", 90). The name self is simply the reference to new_instance. The assignment self.name = name stores an attribute on that particular instance.\n\nWhen Python evaluates student.introduce(), it first looks for introduce on the student instance and then on Student. Finding a function on the class creates a bound method: Python supplies student as the first argument. Therefore student.introduce() is conceptually similar to Student.introduce(student). Instance attributes normally take priority over class attributes. If an instance does not contain an attribute, Python searches the class and then its base classes according to the method-resolution order.";
  oopLesson.terms = ["class: reusable definition that describes objects", "object or instance: one concrete value created from a class", "attribute: data reached through dot notation", "method: function defined inside a class", "instance attribute: data belonging to one object", "class attribute: data shared through the class unless shadowed", "self: current object supplied to an instance method", "constructor call: expression such as Student(...) that creates and initializes an object", "state: current data stored by an object", "behavior: actions supplied by its methods"];
  oopLesson.syntax = "class ClassName:\n    class_attribute = shared_value\n\n    def __init__(self, parameter):\n        self.instance_attribute = parameter\n\n    def method(self, argument):\n        return self.instance_attribute + argument\n\nobject_name = ClassName(value)\nresult = object_name.method(argument)";
  oopLesson.beginner = {code:"class Student:\n    def __init__(self, name, marks):\n        self.name = name\n        self.marks = marks\n\n    def introduce(self):\n        return f\"{self.name} scored {self.marks}\"\n\nstudent1 = Student(\"Ravi\", 90)\nstudent2 = Student(\"Asha\", 85)\nprint(student1.introduce())\nprint(student2.introduce())\nprint(student1 is student2)", lines:["class Student creates a reusable type.", "__init__ runs automatically for each new Student.", "self refers to the object currently being initialized.", "self.name and self.marks create attributes on that object.", "introduce uses the current object through self.", "The two constructor calls create two independent objects.", "is checks whether both names refer to one identical object."], output:"Ravi scored 90\nAsha scored 85\nFalse", why:"The class is reused twice, but each constructor call creates a separate object. Each method reads the state of the object supplied as self, and the two objects have different identities."};
  oopLesson.intermediate = {code:"class BankAccount:\n    bank_name = \"Safe Bank\"\n\n    def __init__(self, owner, balance=0):\n        self.owner = owner\n        self.balance = balance\n\n    def deposit(self, amount):\n        self.balance += amount\n        return self.balance\n\naccount1 = BankAccount(\"Ravi\", 1000)\naccount2 = BankAccount(\"Asha\", 500)\naccount1.deposit(250)\nprint(account1.owner, account1.balance)\nprint(account2.owner, account2.balance)\nprint(account1.bank_name)", lines:["bank_name is a class attribute available to every BankAccount object.", "__init__ creates separate owner and balance attributes.", "deposit changes only the object referenced by self.", "account1 and account2 are independent instances.", "account1.deposit(250) supplies account1 as self.", "bank_name is found on the class when it is not on the instance."], output:"Ravi 1250\nAsha 500\nSafe Bank", why:"Only account1 receives the deposit, so its balance changes from 1000 to 1250. account2 remains at 500. Both objects can read the shared class attribute bank_name."};

  window.renderDetailedPythonLesson = function (D, f) {
    var c = window.PY_DETAILED[f.t];
    if (!c) return null;
    function list(a) { return "<ul>" + a.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul>"; }
    function example(label, e) { return "<h3>" + label + "</h3><pre><code>" + esc(e.code) + "</code></pre><h4>Line-by-line explanation</h4>" + list(e.lines) + "<h4>Expected output</h4><pre><code>" + esc(e.output) + "</code></pre><p><b>Why this output:</b> " + e.why + "</p>"; }
    return '<div class="python-lesson"><div class="crumb">' + esc(D.MN[f.m]) + ' · Lesson ' + f.n + '</div><div class="py-lesson-head"><span class="py-badge">PYTHON</span><span>Complete teaching lesson</span></div><h1>' + esc(f.t) + '</h1><h2>1. Topic introduction</h2><p>' + c.title + '</p><h2>2. Learning objectives</h2>' + list(c.objective) + '<h2>3. Definition</h2><p>' + c.definition + '</p><h2>4. Detailed explanation</h2><p>' + c.explanation + '</p><h2>5. Why we need this concept</h2><p>' + (c.why || c.explanation) + '</p><h2>6. How it works internally</h2><p>' + c.internals + '</p><h2>7. Important terminology</h2>' + list(c.terms) + '<h2>8. Syntax and syntax explanation</h2><pre><code>' + esc(c.syntax) + '</code></pre><h2>9. Example 1 – Beginner</h2>' + example("Beginner example", c.beginner) + '<h2>10. Example 2 – Intermediate</h2>' + example("Intermediate example", c.intermediate) + '<h2>11. Example 3 – Real-world scenario</h2>' + example("Real-world example", c.realWorld) + '<h2>16. Different approaches</h2>' + list(c.approaches) + '<h2>17. Advantages and limitations</h2><p>' + c.tradeoffs + '</p><h2>18. Common mistakes and fixes</h2>' + list(c.mistakes) + '<h2>19. Best practices</h2>' + list(c.best) + '<h2>20. Related concepts</h2>' + list(c.related) + '<h2>21. Interview questions with answers</h2><dl>' + c.questions.map(function (q) { return "<dt><b>" + q[0] + "</b></dt><dd>" + q[1] + "</dd>"; }).join("") + '</dl><h2>22. Practice exercises</h2>' + list(c.exercises) + '<h3>Exercise solutions</h3>' + c.solutions.map(function (s) { return "<pre><code>" + esc(s) + "</code></pre>"; }).join("") + '<h2>23. Topic summary</h2><div class="box"><p>' + c.summary + '</p></div></div>';
  };
})();
  /*
  };

  window.renderDetailedPythonLesson = function (D, f) {
    var c = window.PY_DETAILED[f.t];
    if (!c) return null;
    function list(a) { return "<ul>" + a.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul>"; }
    function example(label, e) {
      return "<h3>" + label + "</h3><pre><code>" + esc(e.code) + "</code></pre><h4>Line-by-line explanation</h4>" + list(e.lines) + "<h4>Expected output</h4><pre><code>" + esc(e.output) + "</code></pre><p><b>Why this output:</b> " + e.why + "</p>";
    }
    return '<div class="python-lesson"><div class="crumb">' + esc(D.MN[f.m]) + ' · Lesson ' + f.n + '</div><div class="py-lesson-head"><span class="py-badge">PYTHON</span><span>Complete teaching lesson</span></div><h1>' + esc(f.t) + '</h1><h2>1. Topic introduction</h2><p>' + c.intro + '</p><h2>2. Learning objectives</h2>' + list(c.objective) + '<h2>3. Definition</h2><p>' + c.definition + '</p><h2>4. Detailed explanation</h2><p>' + c.explanation + '</p><h2>5. Why we need this concept</h2><p>' + c.explanation + '</p><h2>6. How it works internally</h2><p>' + c.internals + '</p><h2>7. Important terminology</h2>' + list(c.terms) + '<h2>8. Syntax and syntax explanation</h2><pre><code>' + esc(c.syntax) + '</code></pre><p>Read each construct from left to right: identify inputs, the operation, and the resulting value. Replace the example names with values from your own problem.</p><h2>9. Example 1 – Beginner</h2>' + example("Beginner example", c.beginner) + '<h2>10. Example 2 – Intermediate</h2>' + example("Intermediate example", c.intermediate) + '<h2>11. Example 3 – Real-world scenario</h2>' + example("Real-world example", c.realWorld) + '<h2>16. Different approaches</h2>' + list(c.approaches) + '<h2>17. Advantages and limitations</h2><p>' + c.tradeoffs + '</p><h2>18. Common mistakes and fixes</h2>' + list(c.mistakes) + '<h2>19. Best practices</h2>' + list(c.best) + '<h2>20. Related concepts</h2>' + list(c.related) + '<h2>21. Interview questions with answers</h2><dl>' + c.questions.map(function (q) { return "<dt><b>" + q[0] + "</b></dt><dd>" + q[1] + "</dd>"; }).join("") + '</dl><h2>22. Practice exercises</h2>' + list(c.exercises) + '<h3>Exercise solutions</h3>' + c.solutions.map(function (s) { return "<pre><code>" + esc(s) + "</code></pre>"; }).join("") + '<h2>23. Topic summary</h2><div class="box"><p>' + c.summary + '</p></div></div>';
  };
})();*/
