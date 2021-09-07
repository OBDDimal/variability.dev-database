from ctypes import CDLL
from os import path

import utils.Logging as Logging

class Adapter_Generic:

#---- Initialization, Setup, Destruction---------------------------------------#

    def init(self):
        raise NotImplementedError()

    def exit(self):
        raise NotImplementedError()

    def set_no_variables(self, no_variables):
        raise NotImplementedError()

#---- Constants ---------------------------------------------------------------#

    def zero_(self):
        raise NotImplementedError()

    def one_(self):
        raise NotImplementedError()

#---- Variables ---------------------------------------------------------------#

    def ithvar_(self, varid):
        raise NotImplementedError()

    def nithvar_(self, varid):
        raise NotImplementedError()

#---- Unary Operators ---------------------------------------------------------#

    def not_(self, obj):
        raise NotImplementedError()

#---- Binary Operators --------------------------------------------------------#

    def and_(self, lhs, rhs, free_factors = True):
        raise NotImplementedError()

    def or_(self, lhs, rhs, free_factors = True):
        raise NotImplementedError()

    def xor_(self, lhs, rhs, free_factors = True):
        raise NotImplementedError()

#---- Utility -----------------------------------------------------------------#
    
    def addref_(self, obj):
        raise NotImplementedError()

    def delref_(self, obj):
        raise NotImplementedError()

    def load_lib(self, shared_lib, hint_install):
        if not path.exists(shared_lib):
            Logging.error(Logging.highlight(shared_lib), "not found, please install first with", Logging.highlight(hint_install))
        else:
            return CDLL(f"./{shared_lib}")

    def dump(self, bdd, filename):
        raise NotImplementedError()
   
    def dump_dot(self, bdd, filename):
        raise NotImplementedError()
   
   
#---- Variable Ordering -------------------------------------------------------#

    def enable_dvo(self, dvo_id):        
        raise NotImplementedError()

    def disable_dvo(self, dvo_id):        
        raise NotImplementedError()

    def dvo_once(self, dvo_id = "lib-default"):
        raise NotImplementedError()   

    def set_order(self, order):
        raise NotImplementedError()     

    def get_order(self, obj):
        raise NotImplementedError()     

#---- UI ----------------------------------------------------------------------#


    def say(self, msg):
        Logging.info(f"{self.get_name()} > {msg}")

    def say_hi(self):
        self.say("Initialized")

    def say_bye(self):
        self.say("Shutdown")