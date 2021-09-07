from copy import copy
import re
#------------------------------------------------------------------------------#

u8neg = u"\u00AC"
u8and = u"\u2227"
u8or = u"\u2228"

class Expression:
    
    def __init__(self, clauses, var2desc = {}, meta = {}):
        self.meta = meta
        self.clauses = clauses
        self.var2desc = var2desc

    def toAST(self):
        pass

    def toCNF(self):
        pass

    def toDNF(self):
        pass

    def get_meta(self):
        return self.meta

    def get_no_variables(self):
        return len(self.var2desc)

class CNF(Expression):

    def __str__(self):
        out = []

        for clause in self.clauses:
            h = []
            for x in clause:
                if x < 0:
                    h.append(f"{u8neg}{abs(x)}")
                else:
                    h.append(str(x))

            h = f" {u8or} ".join(h)
            out.append(f"({h})")

        return (f" {u8and} ".join(out)).strip()

    def verbose(self):        
        out = str(self)

        for k,v in self.var2desc.items():
            out = re.sub(str(k), v, out)

        return out

    def get_stub(self):
        return "cnf"

class DNF(Expression):
    pass

class AST(Expression):
    
    def get_stub(self):
        return "ast"

def support(ast):

    supp = set()

    try:
        _, childs = ast
        for x in childs:
            supp.update(support(x))
    except TypeError:
        supp.update([abs(ast)])

    return supp


class FM(Expression):
    """Contains expressions representing the feature diagram and the cross-tree constraints"""

    def get_stub(self):
        return "fm"

    def __init__(self, expr_fd, expr_ctcs = [], var2desc = {}, meta = {}):
        self.expr_fd = expr_fd
        self.expr_ctcs = expr_ctcs
        self.var2desc = var2desc
        self.meta = meta

    def computer_erc(self):
        supp = set()

        for ast in self.expr_ctcs:
            supp.update(support(ast))

        return len(supp) / len(self.var2desc)



