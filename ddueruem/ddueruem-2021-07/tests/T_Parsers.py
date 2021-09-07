from utils.InputFormats import CNF
from parsers.DIMACS_Parser import DIMACS_Parser
from parsers.UVL_Parser import UVL_Parser

with DIMACS_Parser("examples/sandwich.dimacs") as parser:
    cnf = parser.parse()

test1 = "(Sandwich) ∧ (Vegetables ∨ ¬Cucumber) ∧ (Vegetables ∨ ¬Tomatoes) ∧ (Vegetables ∨ ¬Lettuce) ∧ (Cheese ∨ ¬Gouda) ∧ (Cheese ∨ ¬Cheddar) ∧ (Cheese ∨ ¬Cream) ∧ (Sandwich0 ∨ ¬SandwichSandwich) ∧ (Sandwich0 ∨ ¬SandwichVegetables) ∧ (Sandwich0 ∨ ¬SandwichCucumber) ∧ (SandwichSandwich ∨ SandwichVegetables ∨ SandwichCucumber ∨ ¬Sandwich0) ∧ (¬SandwichSandwich ∨ ¬SandwichVegetables) ∧ (¬SandwichSandwich ∨ ¬SandwichCucumber) ∧ (¬SandwichVegetables ∨ ¬SandwichCucumber) ∧ (SandwichTomatoes ∨ ¬SandwichLettuce) ∧ (SandwichTomatoes ∨ ¬SandwichCheese) ∧ (SandwichTomatoes ∨ ¬SandwichGouda) ∧ (SandwichLettuce ∨ SandwichCheese ∨ SandwichGouda ∨ ¬SandwichTomatoes) ∧ (Sandwich ∨ ¬Sandwich0) ∧ (Sandwich ∨ ¬Cheese) ∧ (Sandwich ∨ ¬SandwichTomatoes) ∧ (Sandwich ∨ ¬Vegetables) ∧ (Sandwich0 ∨ ¬Sandwich) ∧ (Gouda ∨ ¬SandwichCheddar) ∧ (Gouda ∨ ¬SandwichCream) ∧ (SandwichCheddar ∨ SandwichCream ∨ ¬Gouda) ∧ (¬SandwichCheddar ∨ ¬SandwichCream)"
assert cnf.verbose() == test1

with UVL_Parser("examples/cerf.uvl") as parser:
    fm = parser.parse()

print(fm.computer_erc())