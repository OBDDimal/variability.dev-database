import re

#------------------------------------------------------------------------------#

import utils.Logging as Logging

from utils.InputFormats import CNF
from utils.IO import hash_hex

#------------------------------------------------------------------------------#

# TODO 
# 
# i18n strings, write unit tests, extend parser to fully comply to the standard
#

class DIMACS_Parser: 

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return

    def name(self):
        return "dimacs"

    def parse(self, filename):

        var_descs = {}

        nvars = 0
        nclauses = 0
        ignored_clauses = 0

        clauses = []

        with open(filename) as file:
            for line in file.readlines():
                m = re.match(r"(?P<type>[cp]) (?P<content>.*)", line)

                if m is None:
                    line = re.sub(r"[\n\r]", "", line)
                    clause = re.split(r"\s+", line)
                    clause = sorted([int(x) for x in clause if x != '0'], key = lambda x : abs(x))

                    isTautology = False

                    for i in range(0, len(clause)-1):
                        if clause[i] + clause[i+1] == 0:
                            Logging.log("Removed tautological clause", clause)
                            isTautology = True
                            ignored_clauses += 1
                            break

                    if not isTautology:
                        clauses.append(clause)

                elif m["type"] == "c":
                    m = re.match(r"\s*(?P<id>[1-9][0-9]*) (?P<desc>\w+)", m["content"])

                    if m is not None:
                        var_descs[int(m["id"])] = m["desc"]

                elif m["type"] == "p":
                    m = re.match(r"\s*(?P<type>\w+) (?P<nvars>\d+) (?P<nclauses>\d+)", m["content"])

                    if m["type"] != "cnf":
                        print(f"[ERROR] Only CNFs are supported at this point, but type is ({m['type']})")

                    nvars = int(m["nvars"])
                    nclauses= int(m["nclauses"])

        if nclauses != len(clauses) + ignored_clauses:
            print(f"[WARNING] Specified number of clauses ({nclauses}) differs from number of parsed ones ({len(clauses) + ignored_clauses}).")

        meta = {
            "input-name": filename,
            "input-hash": hash_hex(filename),
            "n_vars": nvars,
            "n_cnf_clauses": len(clauses),
            "n_tautological_clauses": ignored_clauses
        }

        return CNF(clauses, var_descs, meta)