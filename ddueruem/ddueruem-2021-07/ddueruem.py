#!/usr/bin/env python3

#------------------------------------------------------------------------------#

import argparse             
from datetime import datetime

from termcolor import cprint

import os
from os import path

import re

from pprint import pprint

#------------------------------------------------------------------------------#

import config
import utils.Caching as Caching

# FIXME
from utils.IO import bulk_format, format_runtime

import utils.Logging as Logging

from adapters import Adapters

from parsers import DIMACS_Parser
from svo import SVOutils as SVO

#------------------------------------------------------------------------------#

def parsing(input_file, flag_parser = None):

    parser = select_parser(input_file, flag_parser)

    with parser() as parser:
        Logging.info("Parser:", Logging.highlight(parser.name()))

        time_start = datetime.now()
        expr = parser.parse(input_file)
        time_stop = datetime.now()
        expr.meta["runtime-parsing"] = format_runtime(time_stop - time_start)

    return expr

def ordering(expr, flag_preorder):

    order = SVO.compute_default_order(expr)

    if flag_preorder != "off":
        preorder = SVO.select_svo(flag_preorder)
        Logging.info("SVO:", Logging.highlight(preorder.name()))
        
        time_start = datetime.now()
        with preorder(flag_preorder) as svo:
            order = svo.run(expr, order)
            if svo.provides_clause_ordering():
                expr.clauses = svo.order_clauses(expr.clauses, order)

        time_stop = datetime.now()
        expr.meta["runtime-preodering"] = format_runtime(time_stop-time_start)

    cachefile = Caching.get_order_cache(expr.meta["input-name"], flag_preorder)
    content = []
    content.append(f"input-name:{expr.meta['input-name']}")
    content.append(f"input-hash:{expr.meta['input-hash']}")
    content.append(f"order:{','.join([str(x) for x in order])}")

    with open(cachefile, "w") as file:
        file.write(os.linesep.join(content))

    return order

def init(root_script = __file__, log_level = None, silent = False, no_log = False):

    # move to directory of the executed script
    os.chdir(os.path.dirname(os.path.realpath(root_script)))

    log_dir = config.LOG_DIR
    verify_create(log_dir)

    if not log_level:
        ll_vol = config.LL_VOLATILE_DEFAULT
        ll_per = config.LL_PERSISTENT_DEFAULT
    else:
        ll_vol = log_level
        ll_per = log_level

    if silent:
        ll_vol = 0 # LL_OFF
    
    if no_log:
        ll_per = 0 # LL_OFF

    Logging.init(ll_vol, ll_per)

    # verify existence of the folders cache & report
    cache_dir = config.CACHE_DIR
    report_dir = config.REPORT_DIR

    verify_create(report_dir)
    verify_create(cache_dir)

def verify_create(dir):
    """Creates the directory dir if it does not already exist."""

    if not path.exists(dir):
        try:
            os.mkdir(dir)
        except OSError as ose:
            Logging.error("error_create_directory_failed", Logging.highlight(dir))
        else:
            pass
            Logging.log("info_create_directory", Logging.highlight(path.abspath(dir)))
    else:
        pass
        Logging.log("info_use_directory", Logging.highlight(path.abspath(dir)))

### TODO: Move to parsers directory utility class
def select_parser(input_file, parser = None):

    if not parser or parser == "auto":
        if input_file.lower().endswith("dimacs"):
            return DIMACS_Parser
        else:
            Logging.error("Could not auto-detect input file format, please manually select the correct parser")
    elif parser == "dimacs":
        return DIMACS_Parser
    else:
        Logging.error("Unknown parser", Logging.highlight(parser))

def cli():    
    parser = argparse.ArgumentParser(description=bulk_format("cli_desc"))
    parser.add_argument("file", help = bulk_format("cli_file"))

    # Run Options
    parser.add_argument("--lib", help = bulk_format("cli--lib"), choices = config.LIBRARY_CHOICES, type = str.lower, default = config.LIB_DEFAULT)
    parser.add_argument("--parser", help = bulk_format("cli--parser"), choices = config.PARSER_CHOICES, type = str.lower, default = None)
    # parser.add_argument("--mode", help = bulk_format("cli--mode"), choices = config.MODE_CHOICES, type = str.lower, default = config.MODE_DEFAULT)

    # Variable Ordering
    parser.add_argument("--preorder", help = bulk_format("cli--preorder"), choices = config.PREORDER_CHOICES, type = str.lower, default = config.SVO_DEFAULT)
    parser.add_argument("--dynorder", help = bulk_format("cli--dynorder"), type = str.lower, default = config.DVO_DEFAULT)
    
    # IO Toggles
    parser.add_argument("--log-level", help = bulk_format("cli--log-level"), choices = config.LOGLEVEL_CHOICES, type = str, default = None)
    parser.add_argument("--silent", help = bulk_format("cli--silent"), dest = "silent", action = "store_true", default = False)
    parser.add_argument("--no-log", help = bulk_format("cli--no-log"), dest = "no_log", action = "store_true", default = False)

    # Caching Toggles    
    parser.add_argument("--ignore-cached-order", help = bulk_format("cli--ignore-cached-order"), dest = "use_cached_order", action = "store_false", default = True)

    parser.add_argument("--report-dir", help = bulk_format("cli--report-dir"))
    parser.add_argument("--log-dir", help = bulk_format("cli--log-dir"))
    parser.add_argument("--cache-dir", help = bulk_format("cli--cache-dir"))

    args = parser.parse_args()

    if args.report_dir:
        config.REPORT_DIR = args.report_dir

    if args.log_dir:
        config.LOG_DIR = args.log_dir

    if args.cache_dir:
        config.CACHE_DIR = args.cache_dir

    log_level = args.log_level

    if args.log_level:
        log_level = config.LOGLEVEL_CHOICES.index(args.log_level)

    init(log_level = log_level, silent = args.silent, no_log = args.no_log)

    Logging.info("ddueruem", config.DDUERUEM_VERSION)
    Logging.vspace()

    ### Library

    t,lib = Adapters.get_lib(args.lib)

    kc_engine = t(lib)
    kc_engine.say_hi()

    dvo = args.dynorder

    if dvo == "help":
        kc_engine.list_available_dvo_options()
        exit()
    else:
        kc_engine.set_dvo(dvo)

    Logging.vspace()

    input_file = args.file

    Logging.info("Input:", Logging.highlight(input_file))

    expr = parsing(input_file, args.parser)

    Logging.info("Parsing time:", Logging.highlight(expr.meta["runtime-parsing"]))

    if len(str(expr)) <= 8192:
        Logging.info("Expression:", Logging.highlight(expr))
    else:
        Logging.info("Expression:", Logging.highlight(f"{str(expr)[:8189]}..."))

    Logging.vspace()

    if args.use_cached_order and Caching.order_cache_exists(input_file, args.preorder):
        order = Caching.read_order_cache(input_file, args.preorder)
        Logging.info("Using cached variable order:", Logging.highlight(order))
    else:
        order = ordering(expr, args.preorder)

    Logging.vspace()

    with kc_engine as bdd:
        bdd.buildFrom(expr, order)
        Logging.info("Compilation time:", Logging.highlight(bdd.meta["runtime-compilation"]))

        filename_bdd = bdd.dump()

#------------------------------------------------------------------------------#

if __name__ == "__main__":
    cli()