# ------------------From XML or JSON to G6 Tree format ------------------
from xml_parser import xml_to_json


def _parse_g6_item(item):
    """
    FROM
    {
        "type": "alt",
        "abstract": True,
        "mandatory": True,
        "name": "someName", # can be used as id and is case-sensitive
        "children": [{type: "and", abstract ....}, {type: "or", abstract ...}, ...]
    }
    TO
    {
        "id": <content of previous name attribute>,
        "fm-attributes" : {"type": "alt", "abstract": True, ...},
        "children": [{id: "...", "fm-attributes": {...}, children: [...]}, "fm-attributes": {...}, id: "...", ...}, ...]
    }
    """
    new_item = {'id': item['name']}
    children = []
    fm_attributes = {'type': item['type']}
    if item.get('abstract') is not None:
        fm_attributes.update({'abstract': item['abstract']})
    if item.get('mandatory') is not None:
        fm_attributes.update({'mandatory': item['mandatory']})
    new_item.update({'fm-attributes': fm_attributes})
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
