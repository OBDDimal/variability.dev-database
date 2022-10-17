import binascii
import os

def generate_random_string(n):
    return binascii.hexlify(os.urandom(n)).decode('ascii')
