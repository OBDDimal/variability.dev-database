import xml.etree.ElementTree as xmlTree
import json
from pathlib import Path
import os
import transpiler as t

path = f"{Path(__file__).resolve().parent}{os.path.sep}xmlExamples{os.path.sep}"
file_path = f"{path}modell_small_parsed.json"
file_as_json = t.json_to_graphology(json.load(open(file_path)))
t.write_to_file(json.dumps(file_as_json, indent=2), f"{path}graphology_model_small_dim.json")
file_path = f"{path}modell_big_parsed.json"
file_as_json = t.json_to_graphology(json.load(open(file_path)))
t.write_to_file(json.dumps(file_as_json, indent=2), f"{path}graphology_model_big_dim.json")
print(json.dumps(file_as_json, indent=2))
