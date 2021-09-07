from adapters.BDD import BDD
from ordering.FORCE import force
from utils.IO import collect_meta
from utils.InputFormats import CNF
from parsers.DIMACS_Parser import DIMACS_Parser
from parsers.UVL_Parser import UVL_Parser

with DIMACS_Parser("examples/sandwich.dimacs") as parser:
    cnf = parser.parse()

order, _ = force(cnf)

with BDD("cudd") as bdd:
    bdd.fromCNF(cnf, order)
    bdd.dump("test.txt", no_variables = cnf.get_no_variables())