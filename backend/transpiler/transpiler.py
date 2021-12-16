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


# ------------------From XML to JSON ------------------
def _parse_xml_item(item):
    """
     element = {
        "type": "alt",
        "abstract": True,
        "mandatory": True,
        "name": "someName", # can be used as id and is case-sensitive
        "children": []

    """
    as_dict = {"type": item.tag}
    as_dict.update(item.attrib)
    children = []
    # print(f"elem: {children}\t{as_dict['name']}\t{as_dict['type']}")
    for child in list(item):
        children.append(_parse_xml_item(child))
    as_dict.update({"children": children})
    return as_dict


def _parse_struct(element):
    # print(f"struct: {element.tag}, size: {len(element)}")
    response = {}
    for child in list(element):
        element_as_dict = _parse_xml_item(child)
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
            response.update(_parse_struct(child))
    return response


# ------------------From XML or JSON to G6 Tree format ------------------
def _parse_g6_item(item):
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
        children.append(_parse_g6_item(child))
    new_item.update({'children': children})
    return new_item


def json_to_g6(content):
    response = {}
    response.update(_parse_g6_item(content))
    return response


def xml_to_g6(file_path):
    file_as_json = xml_to_json(file_path)
    json_as_g6 = json_to_g6(file_as_json)
    return json_as_g6


# ------------------From XML or JSON to Graphology format ------------------
def _parse_graphology_item(item, nodes=[], edges=[]):
    """
    details: https://graphology.github.io/serialization.html#format
    """
    if item['name'] is None:
        raise ValueError("Node does not have name attribute !")
    id = 'key'
    new_node = {id: item['name']}
    attributes = {}
    for key in item:
        if key == 'name' or key == 'children':
            continue
        # sigmajs has problems with custom attributes
        attributes.update({key: item[key]})
    # new_node.update({'attributes': attributes})
    new_node.update({'attributes': {'x': item['x'], 'y': item['y']}})
    nodes.append(new_node)
    if item['children'] is None:
        raise ValueError("Node does have child array !")
    children = []
    for child in item['children']:
        nodes, edges = _parse_graphology_item(child, nodes, edges)
        # last element of nodes is first child of current node
        edges.append({
            'source': new_node[id],
            'target': nodes[-1][id],
            # 'undirected': True
        })
    return nodes, edges


def json_to_graphology(content):
    nodes, edges = _parse_graphology_item(content, [], [])
    return {
        'directed': False,
        'multigraph': False,
        'graph': {},
        'nodes': nodes,
        'edges': edges
    }


def xml_to_graphology(file_path):
    file_as_json = xml_to_json(file_path)
    json_as_graphology = json_to_graphology(file_as_json)
    return json_as_graphology


# ---------------------------------Utils---------------------------------------------
def write_to_file(source, target_file):
    with open(target_file, 'w') as f:
        f.write(source)


# ---------------------------------MAIN----------------------------------------------
path = f"{Path(__file__).resolve().parent}{os.path.sep}xmlExamples{os.path.sep}"

# ----- to GRAPHOLOGY
# write_to_file(json.dumps(xml_to_graphology(path + 'BerkeleyDB.xml'), indent=2), f"{path}graphology_model.json")
# write_to_file(json.dumps(xml_to_graphology(path + 'oldsmall.xml'), indent=2), f"{path}graphology_model_small.json")
# write_to_file(json.dumps(xml_to_graphology(path + 'Automotive02v04.xml'), indent=2), f"{path}graphology_model_big.json")

# ----- to JSON
write_to_file(json.dumps(xml_to_json(path + 'BerkeleyDB.xml'), indent=2), f"{path}model.json")
write_to_file(json.dumps(xml_to_json(path + 'oldsmall.xml'), indent=2), f"{path}model_small.json")
write_to_file(json.dumps(xml_to_json(path + 'Automotive02v04.xml'), indent=2), f"{path}model_big.json")

# ----- to G6
# write_to_file(json.dumps(xml_to_g6(path + 'BerkeleyDB.xml'), indent=2), f"{path}g6_model.json")
# write_to_file(json.dumps(xml_to_g6(path + 'oldsmall.xml'), indent=2), f"{path}g6_model_small.json")
# write_to_file(json.dumps(xml_to_g6(path + 'Automotive02v04.xml'), indent=2), f"{path}g6_model_big.json")
