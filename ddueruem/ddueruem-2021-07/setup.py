#!/usr/bin/env python3
#------------------------------------------------------------------------------#

import argparse             

#------------------------------------------------------------------------------#

import config
from ddueruem import init
import utils.Logging as Logging
from utils.IO import bulk_format
import adapters.Adapters as Adapters

#------------------------------------------------------------------------------#

def cli():      
    parser = argparse.ArgumentParser()
    
    # IO Toggles
    parser.add_argument("--silent", help = bulk_format("cli--silent"), dest = "silent", action = "store_true", default = False)
    parser.add_argument("--clean", help = bulk_format("cli_setup--clean"), dest = "clean", action = "store_true", default = False)

    # Install Options
    parser.add_argument("libs", nargs = "+", choices = config.INSTALL_CHOICES, type = str.lower, help = bulk_format("cli_setup--install"), default = [])

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

    init(root_script = __file__, silent = args.silent)

    if args.clean:
        Logging.log(Logging.highlight("--clean"), "was supplied. Existing downloads, sources, and build results will be ignored.")

    libs = args.libs
    if "all" in libs:
        libs =  config.INSTALLABLE_LIBRARIES

    for lib in libs:
        _, lib = Adapters.get_lib(lib)  
        Adapters.install(lib, args.clean)
        Logging.vspace()

#------------------------------------------------------------------------------#

if __name__ == "__main__":
    cli()