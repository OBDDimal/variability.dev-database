"""
!!!Warning!!!
The xml.etree.ElementTree module is not secure against maliciously constructed data!
If you need to parse untrusted or unauthenticated data,
see https://docs.python.org/3/library/xml.html#xml-vulnerabilities
"""

import xml.etree.ElementTree as xmlTree


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


def xml_to_json(file, is_file_path=True):
    """
    If is_file_path is set to True (also per default), the file parameter will be interpreted as
    String containing the XML content, otherwise it will be interpreted as path to a file.
    """
    response = {}
    if is_file_path:
        root = xmlTree.parse(file).getroot()
    else:
        root = xmlTree.fromstring(file)

    # print(f"root: {root.tag}, size: {len(root)}")
    for child in root.iter():
        if child.tag == 'struct':
            response.update(_parse_struct(child))
    return response
