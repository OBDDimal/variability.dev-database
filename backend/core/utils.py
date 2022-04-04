# ---------------------------------Utils---------------------------------------------
import os


def write_to_file(source, target_file):
    """
    files created with this method can also be executed
    """
    with open(os.open(target_file, os.O_CREAT | os.O_WRONLY, 0o777), 'w') as f:
        f.write(source)
