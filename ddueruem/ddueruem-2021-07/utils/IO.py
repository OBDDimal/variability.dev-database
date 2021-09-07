from ctypes import CDLL, c_void_p
from datetime import datetime, timedelta
import hashlib

import i18n

import os
from os import path

import re
import requests

import tarfile
from termcolor import colored

import tempfile

import sys

import config

# initialize i18n
i18n.load_path.append("lang")
i18n.set('filename_format', '{locale}.{format}')

### Download
def untar(filepath):
    with tarfile.open(filepath) as archive:
        archive.extractall(path = config.CACHE_DIR)   

def download(url, target):
    req = requests.get(url)

    with open(target, "wb") as file:
        file.write(req.content)

### Hashing

def hash_hex(filepath):    
    with open(filepath, "rb") as f:
        hash_is = hashlib.md5()
        while chunk := f.read(8192):
            hash_is.update(chunk)

    return hash_is.hexdigest()


def verify_hash(filepath, hash_should):

    hash_is = hash_hex(filepath)

    if hash_is == hash_should:
        return (True, "")
    else:
        return (False, f"Hash of {filepath} ({hash_is}) does not match expected hash ({hash_should})")

def prepend_input_file_signature(filename_to_hash, filename_to_store):
    with open(filename_to_store, "r") as file:
        contents = file.read()

    with open(filename_to_store, "w") as file:
        file.write(f"{filename_to_hash}:{hash(filename_to_hash)}{os.linesep}")
        file.write(contents)

### Formatting

def bulk_format(*msgs, color = None, attrs = None, return_type = str, str_sep = " "):    
    out = []

    for msg in msgs:
        msg = str(msg)
        msg = i18n.t(msg)
        if m := re.match(r"\$\$(?P<inner>[^$]+)\$\$", msg):
            msg = m["inner"]
            msg = format(msg, color, attrs)

        out.append(msg)

    if return_type == list:
        return out
    elif return_type == str:
        return str_sep.join(out)    
    else:
        raise TypeError("out must be list or str")

def format(msg, color = None, bg = None, attrs = None):
    if color:
        if bg and attrs:
            msg = colored(msg, color, bg, attrs=attrs)
        elif bg:
            msg = colored(msg, color, bg)
        elif attrs:
            msg = colored(msg, color, attrs=attrs)
        else:
            msg = colored(msg, color)

    return msg

def format_runtime(runtime):
    return f"{runtime.total_seconds():.3f} s"

###

def collect_meta(*args):

    out = {
        "ddueruem-version": config.DDUERUEM_VERSION
    }

    for x in args:
        out.update(x.get_meta())

    return out

# Move out of here
def basename(file):    
    fullpath = path.abspath(file)
    basename = re.split(r"\.", re.split(r"/", fullpath)[-1])[0]

    return basename

def timestamp(sep = "", splitsep = ":"):
    return datetime.now().strftime(f"%Y{sep}%m{sep}%d{splitsep}%H{sep}%M{sep}%S")

class STDOUT_Recorder():

    def __init__(self, filename):
        with open(filename, "w"):
            pass

        self._oldstdout_fno = os.dup(sys.stdout.fileno())
        self.sink = os.open(filename, os.O_WRONLY)

    def __enter__(self):
        sys.stdout.flush()
        self._newstdout = os.dup(1)
        os.dup2(self.sink, 1)
        os.close(self.sink)
        sys.stdout = os.fdopen(self._newstdout, 'w')
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        sys.stdout = sys.__stdout__
        sys.stdout.flush()
        os.dup2(self._oldstdout_fno, 1)