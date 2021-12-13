"""
!!!Warning!!!
The xml.etree.ElementTree module is not secure against maliciously constructed data!
If you need to parse untrusted or unauthenticated data,
see https://docs.python.org/3/library/xml.html#xml-vulnerabilities
"""
import xml.etree.ElementTree as et
import json

path = '/home/eric/Uni/SE-Projekt/ddueruem-web/backend/transpiler/xmlExamples/BerkeleyDB.xml'


# path = '/home/eric/Uni/SE-Projekt/ddueruem-web/backend/transpiler/xmlExamples/Automotive02v04.xml'


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


def dict_to_g6(dic):
    response = {}
    response.update(parse_g6_item(dic))
    return response


# -------------------------------------------------------------------------------

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
    print(f"struct: {element.tag}, size: {len(element)}")
    response = {}
    for child in list(element):
        element_as_dict = parse_element(child)
        print(f"{len(child)}\t{element_as_dict['name']}\t{element_as_dict['type']}")
        response.update(element_as_dict)
    return response


def parse_xml(file_path):
    response = {}
    tree = et.parse(file_path)
    root = tree.getroot()
    print(f"root: {root.tag}, size: {len(root)}")
    for child in root.iter():
        if child.tag == 'struct':
            response.update(parse_struct(child))

    return response


model_as_dict = parse_xml(path)
print('--------------------------------------------')
with open('model_data.json', 'w') as fp:
    json.dump(model_as_dict, fp, indent=2)
# print(json.dumps(as_json, indent=2))
model_as_g6_json = dict_to_g6(model_as_dict)
print(model_as_g6_json)
json.dumps(model_as_g6_json, indent=2)
with open('g6_data.json', 'w') as fp:
    json.dump(model_as_g6_json, fp, indent=2)
