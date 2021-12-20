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
