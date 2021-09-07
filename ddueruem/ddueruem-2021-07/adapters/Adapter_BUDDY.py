from ctypes import *

import os
import re
import subprocess

from . import Adapter_Generic
import config

import utils.Logging as Logging

name        = "BuDDy 2.4"
stub        = "buddy"
url         = "https://sourceforge.net/projects/buddy/files/buddy/BuDDy%202.4/buddy-2.4.tar.gz/download"
archive     = f"{config.CACHE_DIR}/buddy-2.4.tar.gz"
archive_md5 = "3b59cb073bcb3f26efdb851d617ef2ed"
sources_dir  = f"{config.CACHE_DIR}/buddy-2.4"
shared_lib  = "libbuddy.so"

configure_settings = "CFLAGS=-fPIC -std=c99"

hint_install = "./setup.py buddy"

has_zero_based_indizes = True
requires_variable_advertisement = True

dvo_options = {    
    "off": 0,
    "lib-default": 4,
    #
    "win2": 1,
    "win2-conv": 2,
    #
    "sift": 3,
    "sift-conv": 4,
    #
    "win3": 5,
    "win3-conv": 6,
    #
    "random": 7,
}

def configure():
    subprocess.run(['./configure', configure_settings], cwd = sources_dir, stdout=subprocess.PIPE).stdout.decode('utf-8')

def format2file(filename, meta = {}):        
    with open(filename, "r") as file:
        content = file.read()

    lines = re.split("[\n\r]",content)

    n_nodes, n_vars = re.split(r"\s+", lines[0].strip())
    var2order = [int(x) for x in re.split(r"\s+", lines[1].strip())]

    order = [0 for _ in range(0, len(var2order))]
    for i,x in enumerate(var2order):
        order[x] = i+1

    nodes = {}
    root = None

    for line in lines[2:]:
        m = re.match(r"(?P<id>\d+) (?P<var>\d+) (?P<low>\d+) (?P<high>\d+)", line)
        if m:
            nodes[int(m["id"])] = (int(m["var"]), int(m["low"]), int(m["high"]))
            root = int(m["id"])

    ids = sorted([x for x in nodes.keys()])

    content = []
    meta["n_nodes"] = n_nodes
    meta["root"] = f"0:{root}"
    meta["order"] = ",".join([str(x) for x in order])

    if meta:
        for k, v in meta.items():
            content.append(f"{k}:{v}")

    content = sorted(content)

    content.append("----")

    for i in ids:
        var, low, high = nodes[i]
        content.append(f"{i} {var} 0:{low} 0:{high}")

    with open(filename, "w") as file:
        file.write(f"{os.linesep}".join(content))
        file.write(os.linesep)

class Manager(Adapter_Generic.Adapter_Generic):

#---- Initialization, Setup, Destruction---------------------------------------#

    def init(self):
        buddy = self.load_lib(shared_lib, hint_install)

        buddy.bdd_init(1000000, 100000)
        buddy.bdd_setminfreenodes(33)
        buddy.bdd_setmaxincrease(c_int(100000))

        self.buddy = buddy

    def exit(self):
        self.buddy.bdd_done()
        self.say_bye()

    def set_no_variables(self, no_variables):
        self.buddy.bdd_setvarnum(no_variables)

#---- Constants ---------------------------------------------------------------#

    def zero_(self):
        return self.buddy.bdd_false() 

    def one_(self):
        return self.buddy.bdd_true()

#---- Variables ---------------------------------------------------------------#

    def ithvar_(self, varid):
        return self.buddy.bdd_ithvar(varid)

    def nithvar_(self, varid):
        return self.buddy.bdd_nithvar(varid)

#---- Unary Operators ---------------------------------------------------------#

    def not_(self, obj):
        return self.buddy.bdd_not(obj)

#---- Binary Operators --------------------------------------------------------#
    
    def and_(self, lhs, rhs, free_factors = True):
        out = self.buddy.bdd_addref(self.buddy.bdd_and(lhs, rhs))

        if free_factors:
            self.delref_(lhs)
            self.delref_(rhs)

        return out

    def or_(self, lhs, rhs, free_factors = True):
        out = self.buddy.bdd_addref(self.buddy.bdd_or(lhs, rhs))

        if free_factors:
            self.delref_(lhs)
            self.delref_(rhs)

        return out

    def xor_(self, lhs, rhs, free_factors = True):
        out = self.buddy.bdd_addref(self.buddy.bdd_xor(lhs, rhs))

        if free_factors:
            self.delref_(lhs)
            self.delref_(rhs)

        return out

#---- Variable Ordering -------------------------------------------------------#

    def enable_dvo(self, dvo_id = "lib-default"):
        self.dvo_id = dvo_id  
        self.buddy.bdd_autoreorder(dvo_id)

    def disable_dvo(self):    
        self.dvo_id = None
        self.buddy.bdd_autoreorder(dvo_options["off"])
        self.say("DVO disabled")

    def set_order(self, order):
        order_min = min(order)

        if order_min > 0:
            order = [x - order_min for x in order]   

        arr = (c_uint * len(order))(*order)

        self.buddy.bdd_setvarorder(arr)
        self.say(f"Set variable order to {order}")

    def dvo_once(self, dvo_id = None):

        if dvo_id:
            #FIXME: Verify that dvo_id is valid
            self.buddy.bdd_reorder(dvo_id)
        elif self.dvo_id:
            self.buddy.bdd_reorder(self.dvo_id)
        else:
            self.buddy.bdd_reorder(dvo_options["lib-default"])

#---- Utility -----------------------------------------------------------------#

    def addref_(self, obj):
        pass

    def delref_(self, obj):
        self.buddy.bdd_delref(obj)

    def dump(self, bdd, filename, meta = {}, **kwargs):
        self.buddy.bdd_fnsave(c_char_p(filename.encode("utf-8")), bdd)
        format2file(filename, meta = meta)

    def dump_dot(self, bdd):
        self.buddy.bdd_fnprintdot(c_char_p("/tmp/bdd.dot".encode("utf-8")), bdd)
        with open("/tmp/bdd.dot") as file:
            out = file.read()

        return out

    def get_name(self):
        return name

