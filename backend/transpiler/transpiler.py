"""
!!!Warning!!!
The xml.etree.ElementTree module is not secure against maliciously constructed data!
If you need to parse untrusted or unauthenticated data,
see https://docs.python.org/3/library/xml.html#xml-vulnerabilities
"""
import xml.etree.ElementTree as xmlTree
import json
from pathlib import Path
import os


# ------------------From JSON to G6 Tree ------------------
def parse_g6_item(item):
    """
    FROM
    {
        "type": "alt",
        "abstract": True,
        "mandatory": True,
        "name": "someName", # can be used as id and is case-sensitive
        "children": [{type: "and", alt ....}, {type: "or", alt ....}]
    }
    TO
    {
        "id": <content of previous name attribute>
        "children": [{id: "...", children: [...]}, {id: "...", children: [...]}]
    }
    """
    new_item = {'id': item['name']}
    children = []
    for child in item['children']:
        children.append(parse_g6_item(child))
    new_item.update({'children': children})
    return new_item


def json_to_g6(dic):
    response = {}
    response.update(parse_g6_item(dic))
    return response


# -------------------------------------------------------------------------------

# ------------------From XML to JSON ------------------
def parse_element(element):
    """
     element = {
        "type": "alt",
        "abstract": True,
        "mandatory": True,
        "name": "someName", # can be used as id and is case-sensitive
        "children": []

    """
    as_dict = {"type": element.tag}
    as_dict.update(element.attrib)
    children = []
    # print(f"elem: {children}\t{as_dict['name']}\t{as_dict['type']}")
    for child in list(element):
        children.append(parse_element(child))
    as_dict.update({"children": children})
    return as_dict


def parse_struct(element):
    # print(f"struct: {element.tag}, size: {len(element)}")
    response = {}
    for child in list(element):
        element_as_dict = parse_element(child)
        # print(f"{len(child)}\t{element_as_dict['name']}\t{element_as_dict['type']}")
        response.update(element_as_dict)
    return response


def xml_to_json(file_path):
    response = {}
    tree = xmlTree.parse(file_path)
    root = tree.getroot()
    # print(f"root: {root.tag}, size: {len(root)}")
    for child in root.iter():
        if child.tag == 'struct':
            response.update(parse_struct(child))
    return response


def xml_to_g6(file_path):
    file_as_json = xml_to_json(file_path)
    json_as_g6 = json_to_g6(file_as_json)
    return json_as_g6


# -------------------------------------------------------------------------------

path = f"{Path(__file__).resolve().parent}{os.path.sep}xmlExamples{os.path.sep}"
model_as_json = xml_to_json(path + 'BerkeleyDB.xml')
# print(json.dumps(model_as_json, indent=2))
with open(f"{path}model_data.json", 'w') as fp:
    json.dump(model_as_json, fp, indent=2)
model_as_g6 = json_to_g6(model_as_json)
with open(f"{path}g6_data.json", 'w') as fp:
    json.dump(model_as_g6, fp, indent=2)

model_as_json = xml_to_json(path + 'Automotive02v04.xml')
with open(f"{path}model_data_big.json", 'w') as fp:
    json.dump(model_as_json, fp, indent=2)
model_as_g6 = json_to_g6(model_as_json)
with open(f"{path}g6_data_big.json", 'w') as fp:
    json.dump(model_as_g6, fp, indent=2)
