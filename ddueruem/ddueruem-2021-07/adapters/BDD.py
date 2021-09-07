from datetime import datetime

from utils.IO import basename, timestamp, format_runtime, bulk_format

import utils.Caching as Caching
import utils.Logging as Logging

# TODO: Move to interface

from config import DDUERUEM_VERSION

def get_meta(lib):
    return {
        "ddueruem-version": DDUERUEM_VERSION,
        "lib-name-stub":lib.stub,
        "lib-name":lib.name
    }

class BDD:
    def __init__(self, lib):
        self.bdd = None
        self.lib = lib

        self.mgr = self.lib.Manager()
        self.mgr.init()

        self.meta = get_meta(lib)

    def __enter__(self):
        return self

    def __exit__(self, *args):      
        self.mgr.exit()
        

    def get_type(self):
        return "BDD Library"

    def get_mgr(self):
        return self.mgr

    def say_hi(self):
        self.mgr.say_hi()


    def buildFrom(self, input, order = None):

        if input.get_stub() == "cnf":
            self.fromCNF(input, order)
        elif input.get_stub() == "fm":
            self.fromFM(input, order)
        else:
            raise NotImplementedError(f"\"{input.get_stub()}\"")

    def init(self, no_variables, meta = {}, order = None):
        lib = self.lib
        mgr = self.mgr

        self.no_variables = no_variables
        self.meta.update(meta)

        if lib.requires_variable_advertisement:
            mgr.set_no_variables(self.no_variables)

        self.varmod = 0
        if lib.has_zero_based_indizes:
            self.varmod = 1

        if order:
            mgr.set_order(order)

        mgr.dvo = "off"

    def set_dvo(self, dvo_stub):
        if self.mgr is None:
            Logging.warning("BDD manager not initialized, not setting DVO.")
            return

        dvo_options = self.lib.dvo_options

        self.mgr.dvo = dvo_stub

        if dvo_stub == "off":
            self.disable_dvo()
        else:
            if dvo_stub in dvo_options:
                self.mgr.enable_dvo(dvo_options[dvo_stub])
                Logging.info(f"Enabled DVO {dvo_stub}")
            else:
                Logging.warning(f"Library {self.lib.name} does not support DVO {dvo_stub}")
                self.list_available_dvo_options()
                self.disable_dvo()

    def disable_dvo(self):
        self.mgr.disable_dvo()

    def get_dvo(self):
        return self.mgr.dvo

    def list_available_dvo_options(self):
        ls = [x for x, _ in self.lib.dvo_options.items()]

        Logging.info(f"Available DVO options for {self.lib.name}:", bulk_format(Logging.highlight(", ".join(ls)), color = "blue"))

    def fromCNF(self, cnf, order = None):

        bdd = self.bdd
        lib = self.lib
        mgr = self.mgr

        if bdd is None:
            self.init(cnf.get_no_variables(), cnf.get_meta(), order)
            bdd = mgr.one_()

        time_start = datetime.now()

        info_indent = len(str(len(cnf.clauses)))

        for i, clause in enumerate(cnf.clauses):

            clause_bdd = mgr.zero_()

            for x in clause:

                y = abs(x) - self.varmod
                
                if x < 0:
                    clause_bdd = mgr.or_(clause_bdd, mgr.nithvar_(y))
                else:
                    clause_bdd = mgr.or_(clause_bdd, mgr.ithvar_(y))

            bdd = mgr.and_(bdd, clause_bdd)
            
            time_stop = datetime.now()            
            Logging.info(f"{i + 1:{info_indent}} / {len(cnf.clauses)} ({100*(i+1)/len(cnf.clauses):5.1f}%) {format_runtime(time_stop - time_start)}")

        self.meta["runtime-compilation"] = format_runtime(time_stop - time_start)
        self.bdd = bdd

    def dump(self, filename = None):

        if filename is None:
            filename = Caching.get_artifact_cache(self.meta['input-name'], self.lib.stub, self.mgr.dvo)

        Logging.info("Dumpfile:", Logging.highlight(filename))

        self.mgr.dump(self.bdd, filename, no_variables = self.no_variables, meta = self.meta)

        return filename

    def to_dot(self):
        return self.mgr.dump_dot(self.bdd)