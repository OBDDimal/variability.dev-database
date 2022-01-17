# Create your tests here.
import json
from pathlib import Path
import os
from g6_transpiler import xml_to_g6
from utils import write_to_file
from xml_parser import xml_to_json

# ---------------------------------MAIN----------------------------------------------

path = f"{Path(__file__).resolve().parent}{os.path.sep}xmlExamples{os.path.sep}"

# ----- to JSON
# write_to_file(json.dumps(xml_to_json(path + 'BerkeleyDB.xml'), indent=2), f"{path}model.json")
# write_to_file(json.dumps(xml_to_json(path + 'oldsmall.xml'), indent=2), f"{path}model_small.json")
# write_to_file(json.dumps(xml_to_json(path + 'Automotive02v04.xml'), indent=2), f"{path}model_big.json")
write_to_file(json.dumps(xml_to_json(path + 'npc.xml'), indent=2), f"{path}model_npc.json")

# ----- to G6
write_to_file(json.dumps(xml_to_g6(path + 'BerkeleyDB.xml'), indent=2), f"{path}g6_model.json")
write_to_file(json.dumps(xml_to_g6(path + 'oldsmall.xml'), indent=2), f"{path}g6_model_small.json")
write_to_file(json.dumps(xml_to_g6(path + 'Automotive02v04.xml'), indent=2), f"{path}g6_model_big.json")
write_to_file(json.dumps(xml_to_g6(path + 'npc.xml'), indent=2), f"{path}g6_model_npc.json")
