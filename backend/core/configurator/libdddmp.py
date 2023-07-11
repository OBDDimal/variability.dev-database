#!/usr/bin/env python3

import re
import time
from copy import copy
from os import linesep, path

import glob


def parse_from_dddmp(filename):
    with open(filename) as file:
        raw = file.readlines()

    # Parse Nodes
    nodes = []
    varid2aid = dict()
    has_complemented_edges = False

    for line in raw:
        if m := re.match(r"(?P<nid>\d+)\s+(?P<varid>[T\d]+)\s+(?P<aid>[T\d]+)\s+(?P<high>\d+)\s+(?P<low>[-]?\d+)",
                         line):

            high = int(m["high"])
            low = int(m["low"])

            if not has_complemented_edges and (high < 0 or low < 0):
                has_complemented_edges = True

            nodes.append((int(m["nid"]), m["varid"], high, low))

            if m["varid"] != "T":
                varid2aid[int(m["varid"]) + 1] = int(m["aid"])

        elif m := re.match(r"\.ids (?P<ids>(\d+\s)+\d+)", line):
            ids = m["ids"]
        elif m := re.match(r"\.permids (?P<ids>(\d+\s)+\d+)", line):
            permids = m["ids"]
        elif m := re.match(r"\.rootids ((?P<roots>([-]?\d+\s*)+))", line):
            roots = re.split(r"\s", m["roots"])
            roots = [int(x) for x in roots if x]

    nodes = [(nid, 0 if varid == "T" else int(varid) + 1, high, low) for nid, varid, high, low in nodes]
    nodes.insert(0, (0, 0, 0, 0))
    # Parse Order

    ids = [int(x) for x in re.split(r"\s+", ids)]
    permids = [int(x) for x in re.split(r"\s+", permids)]

    order = [0] * (max(permids) + 1)

    for i in range(len(permids)):
        order[permids[i]] = ids[i] + 1

    order = [x for x in order if x != 0]

    if any([x < 0 for x in roots]) or has_complemented_edges:
        return BDD_CE(order, roots, nodes, varid2aid)
    else:
        return BDD(order, roots, nodes)


def gen_single_from_multi_dddmp(filepath):
    with open(filepath) as file:
        lines = file.readlines()

    i_nodes = -1
    i_roots = -1

    for i, line in enumerate(lines):

        if line.startswith(".rootids"):
            i_roots = i
            break

    if m := re.match(r"[.]rootids\s+(?P<roots>([-]?\d+\s*)+)[\s\n\r]+", lines[i_roots]):
        roots = re.split(r"\s+", m["roots"])
        roots = [int(root) for root in roots]

    files = []

    for i, root in enumerate(roots):
        lines[i_roots - 1] = f".nroots 1{linesep}"
        lines[i_roots] = f".rootids {root}{linesep}"

        content = "".join(lines)

        pathname, extension = path.splitext(filepath)
        filename_out = f"{pathname}-root{i + 1}.dddmp"

        with open(filename_out, "w+") as file:
            file.write(content)

        files.append(filename_out)

    return files


def gen_multi_from_single_ddueruem(files, filename):
    orders = set()
    nodes = set()
    roots = []

    for file in files:
        bdd = parse_from_ddueruem(file, normalize=False)

        roots.extend(bdd.roots)
        orders.add(",".join([str(x) for x in bdd.order]))

        for node in bdd.nodes[2:]:
            nodes.add(node)

    if len(orders) > 1:
        print("Error: Multiple orderings")
        exit(2)

    content = [
        f'n_nodes:{len(nodes)}',
        f'order:{list(orders)[0]}',
        f'roots:{" ".join([str(x) for x in roots])}',
        "----"
    ]

    nodes = list(nodes)
    nodes = sorted(nodes, key=lambda x: x[0])

    for node in nodes:
        line = f'{" ".join([str(x) for x in node])}'
        content.append(line)

    content.append("")

    content = linesep.join(content)

    with open(filename, "w+") as file:
        file.write(content)

    bdd = parse_from_ddueruem(filename)
    bdd.export(filename)


def parse_from_ddueruem(filename, normalize=True):
    with open(filename) as file:
        raw = file.readlines()

    # Parse Nodes
    nodes = []
    nodes_start = -1
    has_complemented_edges = False

    for i, line in enumerate(raw):
        if m := re.match(r"order:(?P<order>(\d+,)+\d*)", line):
            order = re.split(",", m["order"])
            order = [int(x) for x in order]
        elif m := re.match(r"roots:(?P<roots>(\d+\s+)*\d+)", line):
            roots = re.split(r"\s+", m["roots"])
            roots = [int(x) for x in roots]
        elif m := re.match(r"----", line):
            nodes_start = i + 1
            break

    has_complemented_edges = any([root < 0 for root in roots])

    for line in raw[nodes_start:]:
        m = re.match(r"(?P<nid>\d+)\s+(?P<varid>\d+)\s+(?P<high>\d+)\s+(?P<low>[-]?\d+)", line)

        if not has_complemented_edges and int(m["low"]) < 0:
            has_complemented_edges = True

        nodes.append((int(m["nid"]),
                      int(m["varid"]),
                      int(m["high"]),
                      int(m["low"])
                      )
                     )

    if normalize:
        old2new = dict()
        old2new[0] = 0
        old2new[1] = 1

        for i, node in enumerate(nodes):
            node_id, _, _, _ = node

            old2new[node_id] = i + 2

        roots = [(-1 if root < 0 else 1) * old2new[abs(root)] for root in roots]

        for i, node in enumerate(nodes):
            node_id, node_var, high_id, low_id = node
            nodes[i] = old2new[node_id], node_var, old2new[high_id], (-1 if low_id < 0 else 1) * old2new[abs(low_id)]

    nodes.insert(0, (0, 0, 0, 0))
    nodes.insert(1, (1, 0, 0, 0))

    if has_complemented_edges:
        return BDD_CE(order, roots, nodes)
    else:
        return BDD(order, roots, nodes)


class BDD_CE:

    def __init__(self, order, roots, nodes):
        self.order = order

        self.roots = roots
        self.nodes = nodes

        counts = [None] * len(nodes)
        counts[0] = (1, 0)
        counts[1] = (0, 1)
        self.counts_ce = counts

    def count(self, root=None):

        nodes = self.nodes

        order = self.order
        counts = self.counts_ce

        if not root:
            root = self.roots[0]

        stack = [abs(root)]

        while stack:
            node_id = stack.pop()

            node_id, node_var, high_id, low_id_sgn = nodes[node_id]

            # print(node_id)

            if node_var == 0:
                continue

            high_id, high_var, _, _ = nodes[high_id]
            low_id, low_var, _, _ = nodes[abs(low_id_sgn)]

            low_complemented = low_id_sgn < 0

            if counts[low_id] is None or counts[high_id] is None:

                stack.append(node_id)

                if counts[low_id] is None:
                    stack.append(low_id)

                if counts[high_id] is None:
                    stack.append(high_id)

                continue

            low_count_inv, low_count = counts[low_id]
            high_count_inv, high_count = counts[high_id]

            if high_var == 0:
                dist_high = len(order) - order.index(node_var) - 1
            else:
                dist_high = (order.index(high_var) - order.index(node_var)) - 1

            if low_var == 0:
                dist_low = len(order) - order.index(node_var) - 1
            else:
                dist_low = (order.index(low_var) - order.index(node_var)) - 1

            count = high_count * 2 ** dist_high
            count_inv = high_count_inv * 2 ** dist_high

            count += (low_count_inv if low_complemented else low_count) * 2 ** dist_low
            count_inv += (low_count if low_complemented else low_count_inv) * 2 ** dist_low

            counts[node_id] = (count_inv, count)

        return counts[root][1] if root > 0 else counts[abs(root)][0]

    def count_nodes(self):

        nodes = self.nodes
        nnodes = dict()

        for root in self.roots:
            stack = [abs(root)]

            cnodes = set()

            while stack:
                node_id = stack.pop()

                node_id, node_var, high_id, low_id_sgn = nodes[node_id]

                if node_var == 0:
                    continue

                high_id, high_var, _, _ = nodes[high_id]
                low_id, low_var, _, _ = nodes[abs(low_id_sgn)]

                if low_id not in cnodes:
                    cnodes.add(low_id)
                    stack.append(low_id)

                if high_id not in cnodes:
                    cnodes.add(high_id)
                    stack.append(high_id)

            nnodes[root] = cnodes

        return nnodes

    def verify(self, config, root=None):

        if root is None:
            root = self.roots[0]

        config = set([x for x in config if x > 0])

        nodes = self.nodes

        inv = root < 0
        id_root = abs(root)

        id_node, node_var, id_high, id_low = nodes[id_root]

        while node_var != 0:
            if node_var in config:
                id_node = id_high
            else:
                if id_low < 0:
                    inv = not inv

                id_node = abs(id_low)

            id_node, node_var, id_high, id_low = nodes[id_node]

        print(inv, id_node)

        return (inv and id_node == 0) or (not inv and id_node == 1)

    def feature_distribution_in_sample(self, sample, root=None):
        comms = [0] * (len(self.order) + 1)
        dist = [0] * (len(self.order) + 1)

        for config in sample:
            if not self.verify(config, root):
                continue

            # config = self.to_full_config(config)

            for x in config:
                if x > 0:
                    comms[x] += 1

        for i, x in enumerate(comms):
            dist[i] = x / len(sample)

        return comms, dist

    def to_full_config(self, config):

        full_config = [0] * (len(self.order))

        for x in config:
            full_config[abs(x) - 1] = x

        for i, x in enumerate(full_config):
            if x == 0:
                full_config[i] = -(i + 1)

        return full_config

    def gen_all_solutions(self, root=None):

        if root is None:
            root = self.roots[0]

        nodes = self.nodes

        stack = [(abs(root), root < 0, [])]

        while stack:
            id_node, inv, config = stack.pop()
            id_node, node_var, id_high, id_low = nodes[id_node]

            if node_var == 0:
                if (id_node == 0 and inv) or (id_node == 1 and not inv):

                    config = sorted(config, key=lambda x: abs(x))

                    missing = []

                    for i in range(1, abs(config[0])):
                        missing.append(i)

                    for i in range(1, len(config)):
                        for j in range(abs(config[i - 1]) + 1, abs(config[i])):
                            missing.append(j)

                    for i in range(abs(config[-1]) + 1, len(self.order) + 1):
                        missing.append(i)

                    completions = []
                    for z in missing:

                        if not completions:
                            completions.append([z])
                            completions.append([-z])
                        else:
                            completions_new = []
                            for cs in completions:
                                xs = copy(cs)
                                ys = copy(cs)
                                xs.append(z)
                                ys.append(-z)
                                completions_new.append(xs)
                                completions_new.append(ys)

                            completions = completions_new

                    if completions:
                        for cs in completions:
                            config_new = copy(config)
                            config_new.extend(cs)
                            config_new = sorted(config_new, key=lambda x: abs(x))

                            yield config_new
                    else:
                        yield config

                continue

            config_high = copy(config)
            config_high.append(node_var)
            stack.append((id_high, inv, config_high))

            config_low = copy(config)
            config_low.append(-node_var)
            stack.append((abs(id_low), inv != (id_low < 0), config_low))

    def minimal_configuration(self, root=None):

        nodes = self.nodes

        min_dists = [-1] * len(self.nodes)

        if root is None:
            root = self.roots[0]

        _, root_var, _, _ = nodes[abs(root)]

        stack = dict()

        for var in self.order:
            stack[var] = []

        stack[root_var] = [(abs(root), root < 0, [])]

        shortest = None

        for var in self.order:

            while stack[var]:
                node_id, inv, path = stack[var].pop()
                node_id, node_var, high_id, low_id_sgn = nodes[node_id]

            if node_var == 0:
                if not inv:
                    if shortest is None or len(shortest) > len(path):
                        shortest = path
                        print(path)
                continue

            if min_dists[node_id] == -1:
                min_dists[node_id] = len(path)
            elif len(path) >= min_dists[node_id]:
                continue

            hpath = copy(path)
            hpath.append(node_var)

            lpath = copy(path)
            lpath.append(node_var)

            stack.append((high_id, inv, hpath))
            stack.append((abs(low_id_sgn), inv != (low_id_sgn < 0), lpath))

        return shortest

    def get_nodes(self, root):

        nodes = self.nodes

        stack = [abs(root)]

        ids = set()
        nodes_this = []

        while stack:
            node_id = stack.pop()

            if node_id in ids:
                continue

            ids.add(node_id)

            node_id, node_var, id_high, id_low = nodes[node_id]

            nodes_this.append(nodes[node_id])

            stack.append(id_high)
            stack.append(id_low)

        return nodes_this


class BDD(BDD_CE):
    def __init__(self, order, roots, nodes):
        super().__init__(order, roots, nodes)

        counts = [None] * len(nodes)
        counts[0] = 0
        counts[1] = 1
        self.counts = counts

    def verify(self, config, root=None):

        if not root:
            root = self.roots[0]

        nodes = self.nodes

        config = set(config)

        node_id, node_var, high_id, low_id = nodes[root]
        alternatives = []

        while node_var != 0:
            if node_var in config:
                node_id = high_id
            elif -node_var in config:
                node_id = low_id
            else:
                alternatives.append(high_id)
                node_id = low_id

            while node_id == 0 and alternatives:
                node_id = alternatives.pop()

            node_id, node_var, high_id, low_id = nodes[node_id]

        return node_id == 1

    def count(self, root=None):
        return self.count_config([], root)

    def count_config(self, config=[], root=None):
        if not root:
            root = self.roots[0]

        nodes = self.nodes

        order = self.order

        if len(config) == 0:
            counts = self.counts
        else:
            counts = [None] * len(nodes)
            counts[0] = 0
            counts[1] = 1

        stack = [root]

        while stack:
            node_id = stack.pop()
            node_id, node_var, high_id, low_id = nodes[node_id]

            if counts[low_id] is None or counts[high_id] is None:
                stack.append(node_id)

                if counts[low_id] is None:
                    stack.append(low_id)

                if counts[high_id] is None:
                    stack.append(high_id)

                continue

            high_id, high_var, _, _ = nodes[high_id]
            low_id, low_var, _, _ = nodes[low_id]

            low_count = counts[low_id]
            high_count = counts[high_id]

            if low_var == 0:
                dist_low = len(order) - order.index(node_var) - 1

                for x in order[order.index(node_var) + 1:]:
                    if x in config or -x in config:
                        dist_low -= 1

            else:
                dist_low = (order.index(low_var) - order.index(node_var)) - 1

                for x in order[order.index(node_var) + 1:order.index(low_var)]:
                    if x in config or -x in config:
                        dist_low -= 1

            if high_var == 0:
                dist_high = len(order) - order.index(node_var) - 1

                for x in order[order.index(node_var) + 1:]:
                    if x in config or -x in config:
                        dist_high -= 1

            else:
                dist_high = (order.index(high_var) - order.index(node_var)) - 1

                for x in order[order.index(node_var) + 1: order.index(high_var)]:
                    if x in config or -x in config:
                        dist_high -= 1

            if node_var in config:
                counts[node_id] = high_count * 2 ** dist_high
            elif -node_var in config:
                counts[node_id] = low_count * 2 ** dist_low
            else:
                counts[node_id] = high_count * 2 ** dist_high + low_count * 2 ** dist_low

        return counts[root]

    def commonality(self, root=None):

        if not root:
            root = self.roots[0]

        nodes = self.nodes

        aggr = [0] * len(nodes)
        aggr[root] = self.count()

        edge2count = dict()

        comms = [0] * (len(self.order) + 1)

        counts = self.counts
        order = self.order
        var2nodes = dict()

        for i in range(0, max(order) + 1):
            var2nodes[i] = []

        for node in nodes:
            _, node_var, _, _ = node

            var2nodes[node_var].append(node)

        for var in order:
            for node in var2nodes[var]:
                node_id, node_var, high_id, low_id = node

                high_id, high_var, _, _ = nodes[high_id]
                low_id, low_var, _, _ = nodes[low_id]

                low_count = counts[low_id]
                high_count = counts[high_id]

                if low_var == 0:
                    dist_low = len(order) - order.index(node_var) - 1

                    for i in range(order.index(node_var) + 1, len(order)):
                        comms[order[i]] += ((low_count * 2 ** (dist_low - 1)) * aggr[node_id] // counts[node_id])
                else:
                    dist_low = (order.index(low_var) - order.index(node_var)) - 1

                    for i in range(order.index(node_var) + 1, order.index(low_var)):
                        comms[order[i]] += ((low_count * 2 ** (dist_low - 1)) * aggr[node_id] // counts[node_id])

                if high_var == 0:
                    dist_high = len(order) - order.index(node_var) - 1

                    for i in range(order.index(node_var) + 1, len(order)):
                        comms[order[i]] += ((high_count * 2 ** (dist_high - 1)) * aggr[node_id] // counts[node_id])
                else:
                    dist_high = (order.index(high_var) - order.index(node_var)) - 1

                    for i in range(order.index(node_var) + 1, order.index(high_var)):
                        comms[order[i]] += ((high_count * 2 ** (dist_high - 1)) * aggr[node_id] // counts[node_id])

                edge2count[(node_id, high_id)] = ((high_count * 2 ** dist_high) * aggr[node_id] // counts[node_id])
                edge2count[(node_id, low_id)] = ((low_count * 2 ** dist_low) * aggr[node_id] // counts[node_id])

                aggr[high_id] += ((high_count * 2 ** dist_high) * aggr[node_id] // counts[node_id])
                aggr[low_id] += ((low_count * 2 ** dist_low) * aggr[node_id] // counts[node_id])

        for var in order:
            for node in var2nodes[var]:
                node_id, node_var, high_id, low_id = node

                comms[var] += edge2count[(node_id, high_id)]

        return comms

    def decision_propagation(self, pc, root=None):

        count = self.count_config(pc, root)

        if count == 0:
            return count, None, None, None, None, None

        if not root:
            root = self.roots[0]

        nodes = self.nodes
        order = self.order

        stacks = [[] for _ in order]
        stacks.append([])

        root_id, root_var, _, _ = nodes[root]

        stacks[root_var].append((root_id, []))

        for var_id in order:
            stack = stacks[var_id]

            while stack:
                node_id, cc = stack.pop()
                node_id, node_var, high_id, low_id = nodes[node_id]

                high_id, high_var, _, _ = nodes[high_id]
                low_id, low_var, _, _ = nodes[low_id]

                if node_var in pc:
                    if high_id != 0:
                        stacks[high_var].append((high_id, cc))
                elif -node_var in pc:
                    if low_id != 0:
                        stacks[low_var].append((low_id, cc))
                else:
                    if high_id != 0:
                        cc_high = copy(cc)
                        cc_high.append(node_var)
                        stacks[high_var].append((high_id, cc_high))

                    if low_id != 0:
                        cc_low = copy(cc)
                        cc_low.append(-node_var)
                        stacks[low_var].append((low_id, cc_low))

        # set of variables impl. selected at least once
        selected = set()

        # set of variables impl. deselected at least once
        deselected = set()

        # set of variables free at least once
        free_st = set()

        for _, cc in stacks[0]:
            cc = sorted(cc, key=abs)

            for i in range(len(cc)):

                x = cc[i]

                if x < 0:
                    deselected.add(abs(x))
                else:
                    selected.add(abs(x))

                if i > 0:
                    for y in range(abs(cc[i - 1]) + 1, abs(x)):
                        free_st.add(y)

            for y in range(1, abs(cc[0])):
                free_st.add(y)

            for y in range(abs(cc[-1]) + 1, len(order)):
                free_st.add(y)

        # set of variables expl. + impl. selected at least once
        selected_pc = copy(selected)

        # set of variables expl. + impl. deselected at least once
        deselected_pc = copy(deselected)

        for x in pc:
            if x < 0:
                deselected_pc.add(abs(x))
            else:
                selected_pc.add(abs(x))

        # set of free variables
        free = set()

        for x in order:
            if x not in selected_pc and x not in deselected_pc:
                free.add(x)

        selected_impl = selected.difference(deselected).difference(free_st)
        deselected_impl = deselected.difference(selected).difference(free_st)

        selected_expl = selected_pc.difference(deselected_pc).difference(selected).difference(free_st)
        deselected_expl = deselected_pc.difference(selected_pc).difference(deselected).difference(free_st)

        return count, free, selected_impl, deselected_impl, selected_expl, deselected_expl

    def export(self, filename):

        nodes = self.nodes

        content = [
            f'n_nodes:{len(nodes)}',
            f'order:{",".join([str(x) for x in self.order])}',
            f'roots:{" ".join([str(x) for x in self.roots])}',
            "----"
        ]

        for node in nodes[2:]:
            line = f'{" ".join([str(x) for x in node])}'
            content.append(line)

        content = linesep.join(content)

        with open(filename, "w+") as file:
            file.write(content)

    def decision_propagation_multiversion_features(self, config, selected_roots, available_roots = None):
        if len(selected_roots) == 0:
            return self.single_decision_propagation_for_multiple_versions(config, available_roots if available_roots is not None else self.roots)
        elif len(selected_roots) == 1:
            return self.single_decision_propagation_for_multiple_versions(config, selected_roots)

        selected = set()
        deselected = set()
        selected_and_deselected = set()

        alternatives = []
        decisions = []
        var_indices = self.create_var_indices()

        c_root = tuple([root for root in selected_roots])

        # Determine whether the min_var is the first variable in self.order
        _, _, root_var = self.determine_high_low_min_var(c_root, config, var_indices)
        initial_count = 1
        for o in self.order:
            if root_var == o:
                break
            if o not in config and -o not in config:
                initial_count *= 2
                selected_and_deselected.add(o)

        c_node = c_root
        ones = tuple([1 for _ in selected_roots])  # Terminal node 1
        cache = {ones: (True, initial_count, 0)}
        while True:
            high, low, min_var = self.determine_high_low_min_var(c_node, config, var_indices)

            # 1. There is no further decision possible
            # 2. The current node has been visited before
            cache_entry = cache.get(c_node)
            if (not low and not high) or cache_entry is not None:
                successfully_visited, count_high, count_low = cache_entry if cache_entry is not None else (False, 0, 0)
                # 1. The current node is the terminal node 1
                # 2. The current node was involved in a decision path to a valid solution
                if c_node == ones or successfully_visited:
                    # Walk through all made decisions and mark the nodes as successfully visited
                    order_index = var_indices[min_var] - 1 if successfully_visited else len(self.order) - 1
                    count = count_high + count_low
                    for from_node, to_node, var, edge in reversed(decisions):
                        while var_indices[var] != order_index:
                            order_var = self.order[order_index]
                            selected_and_deselected.add(order_var)
                            order_index -= 1
                            if order_var not in config and -order_var not in config:
                                count *= 2

                        _, c_h, c_l = cache.get(from_node)
                        if edge == 1:
                            cache[from_node] = (True, count, c_l)
                            count = count + c_l
                            selected.add(var)
                        else:
                            cache[from_node] = (True, c_h, count)
                            count = count + c_h
                            deselected.add(var)
                        order_index -= 1

                # If there are alternatives chose one and update decision paths. Otherwise, finish this loop.
                if alternatives:
                    from_node, to_node, var, length = alternatives.pop()
                    decisions = decisions[:length]
                    decisions.append((from_node, to_node, var, 1))
                    c_node = to_node
                else:
                    break

            # A low decision of all combined nodes is possible
            elif low:
                cache[c_node] = (False, 0, 0)

                # A high decision of all combined nodes is possible
                # Add this possible decision to the alternatives
                if high:
                    alternatives.append((c_node, self.node_high(c_node, min_var), min_var, len(decisions)))

                to_node = self.node_low(c_node, min_var)
                decisions.append((c_node, to_node, min_var, -1))
                c_node = to_node

            # A high decision but no low decision of all combined nodes is possible
            elif high:
                cache[c_node] = (False, 0, 0)
                to_node = self.node_high(c_node, min_var)
                decisions.append((c_node, to_node, min_var, 1))
                c_node = to_node

        deselected_config = [-x for x in config if x < 0]
        selected_config = [x for x in config if x > 0]

        selected_impl = selected.difference(deselected).difference(selected_and_deselected).difference(selected_config)
        deselected_impl = deselected.difference(selected).difference(selected_and_deselected).difference(
            deselected_config)
        available = set(self.order).difference(selected_impl).difference(deselected_impl).difference(
            deselected_config).difference(selected_config)

        _, c_h, c_l = cache.get(c_root)
        count = c_h + c_l

        return count, available, selected_impl, deselected_impl

    def determine_high_low_min_var(self, c_node, config, var_indices):
        # Get the minimum var of all current nodes
        min_var_index = min([var_indices[self.nodes[id][1]] for id in c_node])
        if min_var_index < len(self.order):
            min_var = self.order[min_var_index]
        else:
            min_var = 0
        # Determine if high and low decisions of current min_var are possible
        high = -min_var not in config
        low = min_var not in config
        for id in c_node:
            _, v, h, l = self.nodes[id]
            if v == min_var:
                high = high and h != 0
                low = low and l != 0
        return high, low, min_var

    def decision_propagation_multiversion_versions(self, config, selected_roots, available_roots=None):
        if available_roots is None:
            roots_to_check = set(self.roots)
        else:
            roots_to_check = set(available_roots)
        roots_to_check = roots_to_check.difference(set(selected_roots))

        deselected_roots = set()
        available_roots = set()
        for root in roots_to_check:
            if self.verify_multiversion(config, [root] + selected_roots):
                available_roots.add(root)
            else:
                deselected_roots.add(root)

        return available_roots, deselected_roots

    def single_decision_propagation_for_multiple_versions(self, config, roots):
        selected = set()
        deselected = set()
        selected_and_deselected = set()

        var_indices = self.create_var_indices()

        # Create one stack for each variable in the self.order array
        # Additionally for the last row add one stack (e.g. 0 and 1 nodes in BDD)
        stacks = [set() for _ in self.order]
        stacks.append(set())

        # Add the current root nodes to its stack position
        for root in roots:
            _, root_var, _, _ = self.nodes[root]
            stacks[root_var].add(root)

        # Walk forward through the BDD based on the current config and add the next nodes to its stack positions
        for var in self.order:
            stack = stacks[var]

            # For each entry in one var-stack get the next nodes and add them to the next stacks
            for node_id in stack:
                node_id, var, high_id, low_id = self.nodes[node_id]
                high_id, high_var, _, _ = self.nodes[high_id]
                low_id, low_var, _, _ = self.nodes[low_id]

                if -var not in config:
                    if high_id != 0:
                        stacks[high_var].add(high_id)

                if var not in config:
                    if low_id != 0:
                        stacks[low_var].add(low_id)

        # Walk through the previous built stacks from leafs to the roots (in reversed order) to
        # filter out not valid paths and count the possible satisfiable configurations
        cache = {1:1}
        for var in reversed(self.order):
            stack = stacks[var]

            for node_id in stack:
                node_id, var, high_id, low_id = self.nodes[node_id]
                high_id, high_var, _, _ = self.nodes[high_id]
                low_id, low_var, _, _ = self.nodes[low_id]
                var_index = var_indices[var]

                count = 0
                target_var_index = None
                if -var not in config:
                    count_high = cache.get(high_id)
                    if high_id != 0 and count_high is not None:
                        selected.add(var)

                        target_var_index = var_indices[high_var]

                        dist = target_var_index - var_index - 1
                        for x in self.order[var_index + 1: var_indices[high_var]]:
                            if x in config or -x in config:
                                dist -= 1
                        count_high *= 2 ** dist
                        count = count_high

                if var not in config:
                    count_low = cache.get(low_id)
                    if low_id != 0 and count_low is not None:
                        deselected.add(var)

                        target_var_index = max(var_indices[low_var], target_var_index if target_var_index is not None else 0)

                        dist = var_indices[low_var] - var_index - 1
                        for x in self.order[var_index + 1: var_indices[low_var]]:
                            if x in config or -x in config:
                                dist -= 1
                        count_low *= 2 ** dist
                        count += count_low

                if target_var_index is not None:
                    selected_and_deselected.update([self.order[index] for index in range(var_index + 1, target_var_index)])

                if count != 0:
                    cache[node_id] = count

        for root_id in roots:
            if cache.get(root_id) is not None:
                _, var, _, _ = self.nodes[root_id]
                for o in self.order:
                    if o == var:
                        break

                    if o not in config and -o not in config:
                        selected_and_deselected.add(o)
                        cache[root_id] *= 2



        deselected_config = [-x for x in config if x < 0]
        selected_config = [x for x in config if x > 0]

        selected_impl = selected.difference(deselected).difference(selected_and_deselected).difference(selected_config)
        deselected_impl = deselected.difference(selected).difference(selected_and_deselected).difference(deselected_config)
        available = selected_and_deselected.union(selected.intersection(deselected)).difference(selected_config).difference(deselected_config)

        counts = [cache[root] for root in roots if cache.get(root) is not None] + [0]
        count = max(counts)

        return count, available, selected_impl, deselected_impl

    # Checks if at least one configuration is possible when all versions from selected_roots are chosen simultaneously
    def verify_multiversion(self, config, selected_roots):
        cache = {}
        alternatives = []

        var_indices = self.create_var_indices()

        c_node = tuple([root for root in selected_roots])
        ones = tuple([1 for _ in selected_roots])  # Terminal node 1
        while c_node != ones:
            high, low, min_var = self.determine_high_low_min_var(c_node, config, var_indices)

            # If there is no further decision possible at this point or the combined node was already visited before
            if (not low and not high) or cache.get(c_node):
                if alternatives:
                    c_node = alternatives.pop()
                else:
                    return False

            # A low decision of all combined nodes is possible
            elif low:
                cache[c_node] = True

                # A high decision of all combined nodes is possible
                # Add this possible decision to the alternatives
                if high:
                    alternatives.append(self.node_high(c_node, min_var))

                c_node = self.node_low(c_node, min_var)

            # A high decision but no low decision of all combined nodes is possible
            elif high:
                cache[c_node] = True
                c_node = self.node_high(c_node, min_var)

        return True

    # Make a high decision from the current combined node.
    # Note the current variable. Only subnodes with the var-level 'var' move forward.
    # These nodes consist of a tuple of ids.
    def node_high(self, node, var):
        t = []
        for id in node:
            _, v, h, _ = self.nodes[id]
            if v == var:
                t.append(h)
            else:
                t.append(id)
        return tuple(t)

    # Make a low decision from the current combined node.
    # Note the current variable. Only subnodes with the var-level 'var' move forward.
    # These nodes consist of a tuple of ids.
    def node_low(self, node, var):
        t = []
        for id in node:
            _, v, _, l = self.nodes[id]
            if v == var:
                t.append(l)
            else:
                t.append(id)
        return tuple(t)

    # Create a list of indices that maps the var to its index in the self.order array
    # Necessary for calculating in the given variable order
    def create_var_indices(self):
        max_var = max(self.order)
        var_indices = [0 for _ in range(max_var + 1)]
        var_indices[0] = max_var
        for i, var in enumerate(self.order):
            var_indices[var] = i
        return var_indices


def parse_sample(filename):
    sample = []

    with open(filename) as file:
        configs = file.readlines()

    for config in configs:
        config = config.strip()
        config = [int(x) for x in re.split(r",\s+", config)]
        sample.append(config)

    return sample


def demo_dp():
    bdd = parse_from_ddueruem("../../examples/simple.bdd")

    print("#SAT:", bdd.count())
    print()

    config = []
    count, free, simpl, dimpl, sexpl, dexpl = bdd.decision_propagation(config)

    print("DP for config", config)
    print("Valid?:", bdd.verify(config))
    print("#SAT under config:".ljust(20), count)
    print("Free variables:".ljust(20), free)
    print("Impl. selected:".ljust(20), simpl)
    print("Impl. deselected:".ljust(20), dimpl)
    print("Expl. selected:".ljust(20), sexpl)
    print("Expl. deselected:".ljust(20), dexpl)
    print()

    config = [1]
    count, free, simpl, dimpl, sexpl, dexpl = bdd.decision_propagation(config)

    print("DP for config", config)
    print("Valid?:", bdd.verify(config))
    print("#SAT under config:".ljust(20), count)
    print("Free variables:".ljust(20), free)
    print("Impl. selected:".ljust(20), simpl)
    print("Impl. deselected:".ljust(20), dimpl)
    print("Expl. selected:".ljust(20), sexpl)
    print("Expl. deselected:".ljust(20), dexpl)
    print()


def demo_dp_multiversion_features():
    bdd = parse_from_ddueruem("../../examples/one.bdd")

    config = []
    selected_roots = [46, 29, 13]
    count, available, simpl, dimpl = bdd.decision_propagation_multiversion_features(config, selected_roots)









    bdd = parse_from_ddueruem("case-studies/toybox/toybox.bdd")
    # bdd = parse_from_ddueruem("case-studies/uclibc/uclibc.bdd")

    config = []
    selected_roots = [202]
    count, available, simpl1, dimpl1 = bdd.decision_propagation_multiversion_features(config, selected_roots)

    print("Config".ljust(20), config)
    print("Selected roots".ljust(20), selected_roots)
    print("#SAT under config:".ljust(20), count)
    print("Available".ljust(20), available)
    print("Impl. selected:".ljust(20), simpl1)
    print("Impl. deselected:".ljust(20), dimpl1)
    print()

    selected_roots = [889]
    count, available, simpl2, dimpl2 = bdd.decision_propagation_multiversion_features(config, selected_roots)

    print("Config".ljust(20), config)
    print("Selected roots".ljust(20), selected_roots)
    print("#SAT under config:".ljust(20), count)
    print("Available".ljust(20), available)
    print("Impl. selected:".ljust(20), simpl2)
    print("Impl. deselected:".ljust(20), dimpl2)
    print()

    selected_roots = [202, 889]
    count, available, simpl2, dimpl2 = bdd.decision_propagation_multiversion_features(config, selected_roots)

    print("Config".ljust(20), config)
    print("Selected roots".ljust(20), selected_roots)
    print("#SAT under config:".ljust(20), count)
    print("Available".ljust(20), available)
    print("Impl. selected:".ljust(20), simpl2)
    print("Impl. deselected:".ljust(20), dimpl2)
    print()


def demo_dp_multiversion_versions():
    bdd = parse_from_ddueruem("../../examples/one.bdd")
    # bdd = parse_from_ddueruem("case-studies/toybox/toybox.bdd")
    # bdd = parse_from_ddueruem("case-studies/uclibc/uclibc.bdd")

    config = []
    for root in set(bdd.roots):
        print("Root", root)

        selected_roots = [root]
        available_roots = bdd.roots

        while True:
            # Multiversion DP and time measurement
            start_time = time.time()
            available_roots, new_deselected = bdd.decision_propagation_multiversion_versions(config, selected_roots,
                                                                                             available_roots)
            end_time = time.time()
            elapsed_time = end_time - start_time

            print("\tTime".ljust(20), (elapsed_time * 1000).__round__(), "ms")
            print("\tSelected roots".ljust(20), selected_roots)
            print("\tAvail. roots".rjust(10).ljust(20), available_roots)
            print("\tNew deselected".rjust(10).ljust(20), new_deselected)
            print()

            # Select one root node from available roots
            if available_roots:
                selected_roots.append(available_roots.pop())
            else:
                break
        print()


def demo_print(selected_roots, config, count, available_roots, deselected_roots, available_vars, simpl_vars, dimpl_vars):
    print("Partial config".ljust(25), config)
    print("Roots selected".ljust(25), selected_roots)
    print("-----")
    print("Vars available".ljust(25), available_vars)
    print("Vars impl. selected:".ljust(25), len(simpl_vars), simpl_vars)
    print("Vars impl. deselected:".ljust(25), len(dimpl_vars), dimpl_vars)
    # print("-----")
    print("#SAT under config:".ljust(25), count)
    print("-----")
    print("Roots available".ljust(25), len(available_roots), available_roots)
    print("Roots deselected".ljust(25), len(deselected_roots), deselected_roots)
    print()


def demo_dp_multiversion_versions_and_features():
    bdd = parse_from_ddueruem("../../examples/one.bdd")
    #bdd = parse_from_ddueruem("case-studies/toybox/toybox.bdd")
    #bdd = parse_from_ddueruem("case-studies/uclibc/uclibc.bdd")

    #input("Press ENTER to start")

    config = set()
    selected_roots = []
    calc = True
    while True:
        if calc:
            time_a = time.time()
            count, available_vars, simpl_vars, dimpl_vars = bdd.decision_propagation_multiversion_features(config, selected_roots)
            time_b = time.time()
            print((time_b - time_a)*1000, "ms", "dp features")

            tmp_config = config.union(simpl_vars).union([-var for var in dimpl_vars])
            time_a = time.time()
            available_roots, deselected_roots = bdd.decision_propagation_multiversion_versions(tmp_config, selected_roots)
            time_b = time.time()
            print((time_b - time_a)*1000, "ms", "dp versions")

            demo_print(selected_roots, config, count, available_roots, deselected_roots, available_vars, simpl_vars, dimpl_vars)

        calc = True

        print("1) Select/Deselect feature")
        print("2) Remove feature")
        print("3) Select root")
        print("4) Deselect root")
        print("5) Explanations for feature")
        print("6) Explanations for version")
        print("7) Reset")
        print("8) Exit")
        print("Input:", end=" ")

        m = re.match(r"(?P<command>\d)\s*(?P<id>-?\d+)?", input())
        command = int(m["command"])
        if command == 8:
            exit()
        elif command == 7:
            selected_roots = []
            config = set()

        id = m["id"]
        if id:
            id = int(id)
            if command == 1:
                if -id in config:
                    config.remove(-id)
                config.add(id)
            elif command == 2:
                config.remove(id)
            elif command == 3:
                selected_roots.append(id)
            elif command == 4:
                selected_roots.remove(id)
            elif command == 5:
                calc = False
                t = bdd.explanations_feature(id, config, selected_roots)
                print(t)

        print()


def demo_explanations_features():
    #bdd = parse_from_ddueruem("../../examples/one.bdd")
    bdd = parse_from_ddueruem("../../data/uclibc/uclibc.bdd")

    start_time = time.time()
    count = bdd.verify_multiversion([1, 3, 8, 25, 284], [40726])
    #count = bdd.count_config([1, 3, 8, 25, 284], 40726)
    end_time = time.time()
    elapsed_time = end_time - start_time
    print(count)
    print("\tTime".ljust(20), (elapsed_time * 1000).__round__(), "ms")
    exit()


    #features, versions = bdd.explanations_feature(5, [1], [29])
    #features, versions = bdd.explanations_feature(-1, [], [13, 17])
    features, versions = bdd.explanations_feature(284, {}, [1138238])

    print(features, versions)
    exit()










    bdd = parse_from_ddueruem("case-studies/toybox/toybox.bdd")


    for root in bdd.roots:
        available_roots, _ = bdd.decision_propagation_multiversion_versions([], [root])

        for root2 in available_roots:
            selected_roots = [root, root2]

            _, _, available_features, se, de = bdd.decision_propagation_multiversion_features([], selected_roots)

            for config in available_features:
                config = [config]

                _, _, a, s, d = bdd.decision_propagation_multiversion_features(config, selected_roots)


                stack = [x for x in s] + [-x for x in d]
                for var in stack:
                    if var in se or -var in de:
                        continue

                    _, _, a, s, d = bdd.decision_propagation_multiversion_features([-var], selected_roots)
                    exp = [c for c in config if c in d or -c in s]
                    #if config != exp:
                    print(config, selected_roots, var, s, d, exp, config == exp)


    return


    config = [1]
    selected_roots = [13, 17]
    a, d = bdd.decision_propagation_multiversion_versions(config, [], selected_roots)
    print(a, d)

    config = [-2]
    selected_roots = [7, 24, 19]
    a, d = bdd.decision_propagation_multiversion_versions(config, [], selected_roots)
    print(a, d)


if __name__ == '__main__':
    demo_explanations_features()
    #demo_dp_multiversion_versions_and_features()
    #demo_dp_multiversion_features()
