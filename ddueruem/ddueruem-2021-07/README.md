# ddueruem
A wrapper for the BDD libraries BuDDy and CUDD.

### Requirements
* Python 3.8+
* `make`
* `glibc`

### Usage:
#### Binary:
```bash
./setup all # install BuDDy and CUDD
./ddueruem -h
./ddueruem <file>.dimacs # build BDD for file 
```
#### From Source:
```bash
# create virtual environment (Python 3.x)
python -m venv .venv

# activate venv
source .venv/bin/activate

# install required packages
pip install -r requirements_min.txt

# show ddueruem help
./ddueruem.py -h

# install BuDDy & CUDD
./setup.py buddy cudd

# create BDD for example sandwich.dimacs
./ddueruem.py examples/sandwich.dimacs --lib buddy 
./ddueruem.py examples/sandwich.dimacs --lib cudd

# preorder with FORCE
./ddueruem.py examples/sandwich.dimacs --preorder force

# Ignore a previously cached variable order
./ddueruem.py examples/sandwich.dimacs --preorder force --ignore-cached-order

# Disable automatic reordering
./ddueruem.py examples/sandwich.dimacs --dynorder off

# Display available DVO in BuDDy
./ddueruem.py examples/sandwich.dimacs --dynorder help --lib buddy
```
### Reports
For every run of `ddueruem` a file is generated: `<input>-<lib>-dvo_<dvo>.bdd`, it contains
* Version of `ddueruem` used
* Name and Hash of the input file
* Name of the library, pre-ordering heuristic, and dynamic ordering heuristic
* Runtimes for parsing, pre-ordering, and compilation
* The variable order after pre-ordering and after compilation
* The BDD
 
In addition `<input>.order` files are created, containing
* Name and hash of the input file
* The order used for the last compilation attempt

### Defaults:
* **Default lib:** BuDDy
* **Preorder:** off
* **Dynorder:** off

### Troubleshooting
`bash: ./ddueruem.py: Permission denied` <br>
**Solution:** Execute `chmod u+x ddueruem.py` to make the file executable.
