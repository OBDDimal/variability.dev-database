from ctypes import CDLL

import os
from os import path

import re

import subprocess

from utils.IO import  download, untar, verify_hash, format
import utils.Logging as Logging

from . import BUDDY
from . import CUDD
from . import BDD


def get_lib(stub):

    stub = stub.lower()

    if stub == "buddy":
        return (BDD, BUDDY)
    elif stub == "cudd":
        return (BDD, CUDD)
    else:
        raise NotImplementedError(f"Library with stub \"{stub}\" is not hooked in.")


def install(lib, clean = False):

    if clean:
        Logging.info(f"Clean installing", Logging.highlight(lib.name))
    else:
        Logging.info(f"Installing", Logging.highlight(lib.name))
        
    if path.exists(lib.shared_lib):
        if clean:
            Logging.info(f"Ignoring existing shared library", Logging.highlight(lib.shared_lib))
        else: 
            Logging.info(Logging.highlight(lib.shared_lib), "already exists, skipping install")
            return 

    if clean or not path.exists(lib.archive):    
        Logging.log("Downloading...")
        download(lib.url, lib.archive)

    if clean or not path.exists(lib.sources_dir):        
        valid, reason = verify_hash(lib.archive, lib.archive_md5)

        if not valid:
            Logging.log_error(reason)

        Logging.info(f"Unpacking", Logging.highlight(lib.archive))
        untar(lib.archive)

    if clean or not path.exists(lib.shared_lib):            
        Logging.log("Configuring...")
        lib.configure()

        Logging.log("Building...")
        subprocess.run(['make', lib.stub, '-j4'], stdout=subprocess.PIPE).stdout.decode('utf-8')
    
    if path.exists(lib.shared_lib):
        Logging.info(f'{lib.name} build: {format("SUCCESS", color = "green", attrs = ["bold"])}')
    else:
        Logging.warning(f'{lib.name} build: {format("FAIL", color = "red", attrs = ["bold"])}')
