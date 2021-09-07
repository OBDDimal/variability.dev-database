from ctypes import CDLL, Structure, POINTER, c_uint, c_double, c_ulong, byref, c_int

from io import StringIO

import os
import re

import subprocess

from . import Adapter_Generic
import config

import utils.Logging as Logging
from utils.IO import STDOUT_Recorder

name        = "CUDD 3.0.0"
stub        = "cudd"
url         = "https://davidkebo.com/source/cudd_versions/cudd-3.0.0.tar.gz"
archive     = f"{config.CACHE_DIR}/cudd-3.0.0.tar.gz"
archive_md5 = "4fdafe4924b81648b908881c81fe6c30"
sources_dir  = f"{config.CACHE_DIR}/cudd-3.0.0"
shared_lib  = "libcudd.so"

configure_settings = "CFLAGS=-fPIC -std=c99"

hint_install = "./setup.py cudd"

dvo_options = {
    "off":1,
    "lib-default": 5,
    #
    "random":2,
    "random-pivot":3,
    #
    "sift": 4,
    "sift-conv": 5,
    #
    "sift-sym": 6,
    "sift-sym-conv": 7,
    #
    "win2": 8,
    "win3": 9,
    "win4": 10,
    #
    "win2-conv": 11,
    "win3-conv": 12,
    "win4-conv": 13,
    #
    "sift-group": 14,
    "sift-group-conf": 15,
    #
    "annealing": 16,
    "genetic": 17,
    #
    "linear": 18,
    "linear-conv": 19,
    #
    "sift-lazy": 20,
    "exact": 21
}

has_zero_based_indizes = True
requires_variable_advertisement = True

def configure():
    subprocess.run(['./configure', configure_settings], cwd = sources_dir, stdout=subprocess.PIPE).stdout.decode('utf-8')

def declare(f, argtypes, restype = None):
    x = f
    x.argtypes = argtypes

    if restype:
        x.restype = restype

    return x

def format2file(filename, meta = {}, order = []):        
    with open(filename, "r") as file:
        content = file.read()

    lines = re.split("[\n\r]",content)

    m = re.match(r"^:\s+(?P<n_nodes>\d+)\s+nodes\s+\d+\s+leaves\s+(?P<ssat>[^\s]+)\s+minterms\s*$", lines[0])

    n_nodes = int(m["n_nodes"])
    root = re.split(r"\s+", lines[1])[2]

    root_ce = 0
    if root[0] == '!':
        root_ce = 1
        root = int(root[1:], 16)
    else:
        root = int(root, 16)

    content = []
    meta["n_nodes"] = n_nodes
    meta["root"] = f"{root_ce}:{root}"
    meta["order"] = ",".join([str(x) for x in order])

    for k, v in meta.items():
        content.append(f"{k}:{v}")

    content = sorted(content)

    content.append("----")

    for line in lines[1:]:
        if not line.startswith("ID"):
            continue

        fields = re.split(r"\s+", line)

        if fields[2][0] == "!":
            node_id = int(fields[2][1:], 16)
        else:
            node_id = int(fields[2], 16)

        var_index = int(fields[5])

        high = fields[8]
        high_ce = 0
        if high[0] == '!':
            high_ce = 1
            node_high = int(high[1:], 16)
        else:
            node_high = int(high[0:], 16)

        low = fields[11]
        low_ce = 0
        if low[0] == '!':
            low_ce = 1
            node_low = int(low[1:], 16)
        else:
            node_low = int(low[0:], 16)

        content.append(f"{node_id} {var_index} {low_ce}:{node_low} {high_ce}:{node_high}")

    with open(filename, "w") as file:
        file.write(f"{os.linesep}".join(content))
        file.write(os.linesep)

#---- CDLL Companion Classes --------------------------------------------------#

class DdNode(Structure):
    _fields_ = [
        ('index', c_uint),
        ('keys', c_uint)
    ]

class DdSubtable(Structure):
    _fields_ = [
        ('slots', c_uint),
        ('keys', c_uint)
    ]

class DdManager(Structure):
    _fields_ = [
        ('subtables', POINTER(DdSubtable)),
        ('keys', c_uint),
        ('dead', c_uint),
        ('cachecollisions', c_double),
        ('cacheinserts', c_double),
        ('cachedeletions', c_double)
    ]

#---- Initialization, Setup, Destruction---------------------------------------#

class Manager(Adapter_Generic.Adapter_Generic):

    def init(self):
        self.cudd = self.load_lib(shared_lib, hint_install)
        self._init = declare(self.cudd.Cudd_Init, [c_uint, c_uint, c_uint, c_uint, c_ulong], POINTER(DdManager))
        self.mgr = self._init(0, 0, 256, 262144, 0)

        return self

    def exit(self):
        if not hasattr(self, "_exit"):
            self._exit = declare(self.cudd.Cudd_Quit, [POINTER(DdManager)])

        self._exit(self.mgr)
        self.say_bye()

    def set_no_variables(self, no_variables):

        if not hasattr(self, "_newvar"):
            self._newvar = declare(self.cudd.Cudd_bddNewVar, [POINTER(DdManager), c_uint])

        for x in range(0, no_variables):
            self._newvar(self.mgr, x)

#---- Constants ---------------------------------------------------------------#

    def zero_(self):
        
        if not hasattr(self, "_zero"):
            self._zero = declare(self.cudd.Cudd_ReadLogicZero, [POINTER(DdManager)], POINTER(DdNode))

        out = self._zero(self.mgr);
        self.addref_(out)

        return out

    def one_(self):

        if not hasattr(self, "_one"):
            self._one = declare(self.cudd.Cudd_ReadOne, [POINTER(DdManager)], POINTER(DdNode))

        out = self._one(self.mgr);
        self.addref_(out)

        return out


#---- Variables ---------------------------------------------------------------#

    def ithvar_(self, varid):

        if not hasattr(self, "_ithvar"):
            self._ithvar = declare(self.cudd.Cudd_bddIthVar, [POINTER(DdManager), c_int], POINTER(DdNode))

        out = self._ithvar(self.mgr, varid)
        self.addref_(out)

        return out

    def nithvar_(self, varid):
        return self.not_(self.ithvar_(varid))

#---- Unary Operators ---------------------------------------------------------#

    def not_(self, obj):
        out = byref(obj.contents, 1)
        self.addref_(out)

        return out

#---- Binary Operators --------------------------------------------------------#

    def and_(self, lhs, rhs, free_factors = True):

        if not hasattr(self, "_and"):
            self._and = declare(self.cudd.Cudd_bddAnd, [POINTER(DdManager), POINTER(DdNode), POINTER(DdNode)], POINTER(DdNode))

        out = self._and(self.mgr, lhs, rhs)
        self.addref_(out)

        if free_factors:
            self.delref_(lhs)
            self.delref_(rhs)

        return out

    def or_(self, lhs, rhs, free_factors = True):

        if not hasattr(self, "_or"):
            self._or = declare(self.cudd.Cudd_bddOr, [POINTER(DdManager), POINTER(DdNode), POINTER(DdNode)], POINTER(DdNode))

        out = self._or(self.mgr, lhs, rhs)
        self.addref_(out)

        if free_factors:
            self.delref_(lhs)
            self.delref_(rhs)

        return out

    def xor_(self, lhs, rhs, free_factors = True):

        if not hasattr(self, "_xor"):
            self._xor = declare(self.cudd.Cudd_bddXor, [POINTER(DdManager), POINTER(DdNode), POINTER(DdNode)], POINTER(DdNode))

        out = self._xor(self.mgr, lhs, rhs)
        self.addref_(out)

        if free_factors:
            self.delref_(lhs)
            self.delref_(rhs)

        return out

#---- Utility -----------------------------------------------------------------#
    
    def addref_(self, obj):

        if not hasattr(self, "_addref"):
            self._addref = declare(self.cudd.Cudd_Ref, [POINTER(DdNode)])

        self._addref(obj)

    def delref_(self, obj):

        if not hasattr(self, "_delref"):
            self._delref = declare(self.cudd.Cudd_RecursiveDeref, [POINTER(DdManager), POINTER(DdNode)])

        self._delref(self.mgr, obj)

    def dump(self, bdd, filename, meta = {}, no_variables = 0):

        if not hasattr(self, "_dump"):
            self._dump = declare(self.cudd.Cudd_PrintDebug, [POINTER(DdManager), POINTER(DdNode), c_int, c_int])

        with STDOUT_Recorder(filename):
            self._dump(self.mgr, bdd, no_variables, 3)

        order = self.get_order(bdd)

        format2file(filename, meta = meta, order = order)

    def get_order(self, bdd):

        if not hasattr(self, "_read_perm"):
            self._read_perm = declare(self.cudd.Cudd_ReadPerm, [POINTER(DdManager), c_int])

        i = 0

        order = []

        while True:
            x = self._read_perm(self.mgr, i)
            if x < 0:
                break

            order.append((i, x))
            i += 1

        order = sorted(order, key = lambda x:x[1])

        return [x+1 for x,_ in order]


    def set_order(self, order):

        if not hasattr(self, "_setorder"):
            self._setorder = declare(self.cudd.Cudd_ShuffleHeap, [POINTER(DdManager), POINTER(c_uint)])

        order_min = min(order)

        if order_min > 0:
            order = [x - order_min for x in order]   

        arr = (c_uint * len(order))(*order)
        self._setorder(self.mgr, arr)

    def enable_dvo(self, dvo_id = "lib-default"):

        if not hasattr(self, "_enable_dynorder"):
            self._enable_dynorder = declare(self.cudd.Cudd_AutodynEnable, [POINTER(DdManager), c_int])

        self._enable_dynorder(self.mgr, dvo_id)

    def disable_dvo(self):

        if not hasattr(self, "_disable_dynorder"):
            self._disable_dynorder = declare(self.cudd.Cudd_AutodynDisable, [POINTER(DdManager)])

        self._disable_dynorder(self.mgr)
        self.say("DVO disabled")

    def get_name(self):
        return name