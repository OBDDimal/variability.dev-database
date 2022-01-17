# ---------------------------------Utils---------------------------------------------
def write_to_file(source, target_file):
    with open(target_file, 'w') as f:
        f.write(source)
