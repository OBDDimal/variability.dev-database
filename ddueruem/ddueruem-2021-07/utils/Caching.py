import os
from os import path

import re

from utils.IO import basename
import config

def get_artifact_cache(input_file_name, lib_stub, dvo_stub):
    return f"{config.REPORT_DIR}/{basename(input_file_name)}-{lib_stub}-dvo_{dvo_stub}.bdd"

def artifact_cache_exists(input_file, flag_lib, flag_dvo):
    filename = get_artifact_cache(input_file, flag_lib, flag_dvo)
    return path.exists(filename)

def get_order_cache(input_file, svo_stub):
    return f"{config.REPORT_DIR}/{basename(input_file)}-{svo_stub}.order"

def order_cache_exists(input_file, svo_stub):
    filename = get_order_cache(input_file, svo_stub)
    return path.exists(filename)

def read_order_cache(input_file, svo_stub):
    filename = get_order_cache(input_file, svo_stub)

    with open(filename) as file:
        lines = file.readlines()

    for line in lines:
        if line.startswith("order"):
            order = re.split(r":", line)
            order = re.split(r",", order[1])
            order = [int(x) for x in order]
            break

    return order