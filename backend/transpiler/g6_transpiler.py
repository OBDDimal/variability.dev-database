# ------------------From XML or JSON to G6 Tree format ------------------
from .xml_parser import xml_to_json


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
    new_item.update({'fm_attributes': fm_attributes})
    for child in item['children']:
        children.append(_parse_g6_item(child))
    new_item.update({'children': children})
    return new_item


def json_to_g6(content):
    response = {}
    response.update(_parse_g6_item(content))
    return response


def xml_to_g6(file, is_file_path=True):
    """
    If is_file_path is set to True (also per default), the file parameter will be interpreted as
    String containing the XML content, otherwise it will be interpreted as path to a file.
    """
    file_as_json = xml_to_json(file, is_file_path)
    json_as_g6 = json_to_g6(file_as_json) if bool(file_as_json) else {}
    return json_as_g6
