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
    new_node = {'key': item['name']}
    attributes = {}
    for key in item:
        if key == 'name' or key == 'children':
            continue
    # sigmajs has problems with custom attributes
    # attributes.update({key: item[key]})
    new_node.update({'attributes': attributes})
    nodes.append(new_node)
    if item['children'] is None:
        raise ValueError("Node does have child array !")
    children = []
    for child in item['children']:
        nodes, edges = _parse_graphology_item(child, nodes, edges)
        # last element of nodes is first child of current node
        edges.append({
            'source': new_node['key'],
            'target': nodes[-1]['key'],
            # 'undirected': 'true'
        })
    return nodes, edges


def json_to_graphology(content):
    nodes, edges = _parse_graphology_item(content)
    return {
        'attributes': {'name': 'test graph'},
        'options': {
            'allowSelfLoops': 'true',
            'multi': 'false',
            'type': 'mixed'
        },
        'nodes': nodes,
        'edges': edges
    }


def xml_to_graphology(file_path):
    file_as_json = xml_to_json(file_path)
    json_as_graphology = json_to_graphology(file_as_json)
    print(json.dumps(json_as_graphology, indent=2))
    return json_as_graphology


# ---------------------------------MAIN----------------------------------------------

path = f"{Path(__file__).resolve().parent}{os.path.sep}xmlExamples{os.path.sep}"

# ----- to JSON
parsed_model = xml_to_json(path + 'BerkeleyDB.xml')
with open(f"{path}model.json", 'w') as fp:
    json.dump(parsed_model, fp, indent=2)
parsed_model = xml_to_json(path + 'Automotive02v04.xml')
with open(f"{path}model_big.json", 'w') as fp:
    json.dump(parsed_model, fp, indent=2)

# ----- to GRAPHOLOGY
parsed_model = xml_to_graphology(path + 'BerkeleyDB.xml')
with open(f"{path}graphology_model.json", 'w') as fp:
    json.dump(parsed_model, fp, indent=2)
parsed_model = xml_to_graphology(path + 'Automotive02v04.xml')
with open(f"{path}graphology_model_big.json", 'w') as fp:
    json.dump(parsed_model, fp, indent=2)

# ----- to G6
parsed_model = xml_to_g6(path + 'BerkeleyDB.xml')
with open(f"{path}g6_model.json", 'w') as fp:
    json.dump(parsed_model, fp, indent=2)
parsed_model = xml_to_g6(path + 'Automotive02v04.xml')
with open(f"{path}g6_model_big.json", 'w') as fp:
    json.dump(parsed_model, fp, indent=2)
