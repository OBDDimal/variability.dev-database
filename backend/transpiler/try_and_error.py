import networkx as nx
import json

g = {}

with open('xmlExamples/graphology_model_small.json') as file:
    js_graph = json.load(file)
    g = nx.readwrite.node_link_graph(js_graph)
    print(g)

g = nx.kamada_kawai_layout(g)
print(g)
