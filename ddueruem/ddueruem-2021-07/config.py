DDUERUEM_VERSION = "v2021-07"

LIB_DEFAULT     = "buddy"
PARSER_DEFAULT  = "auto"
SVO_DEFAULT     = "off"
DVO_DEFAULT     = "off"

# Directories
CACHE_DIR   = "_cache"
LOG_DIR     = "_log"
REPORT_DIR  = "_reports"

# CLI choices
PREORDER_CHOICES    = ["off", "force", "force-triage", "dbo"]

PARSER_CHOICES      = ["dimacs"]

LOGLEVEL_CHOICES     = ["LL_OFF", "LL_ERROR", "LL_WARNING", "LL_INFO", "LL_ALL"]
LL_VOLATILE_DEFAULT = 3 # LL_INFO
LL_PERSISTENT_DEFAULT = 4 # LL_AL

LIBRARY_CHOICES         = ["buddy", "cudd"]
INSTALL_CHOICES         = ["all", "buddy", "cudd"]
INSTALLABLE_LIBRARIES   = ["buddy", "cudd"]