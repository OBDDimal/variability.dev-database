# ------------------From XML or JSON to Graphology format ------------------
from transpiler.xml_parser import xml_to_json


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
    # WIP: This will only work if the items already have x and y attributes
    # only works with graphology_model_big_dim or graphology_model_small_dim
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
