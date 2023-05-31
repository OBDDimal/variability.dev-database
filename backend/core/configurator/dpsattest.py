import time

from core.configurator.libdddmp import parse_from_ddueruem
import random
import multiprocessing


def generate_random_config_mixed(bdd, available_vars):
    available_roots = set(bdd.roots)
    selected_roots = []
    config = set()
    count = 0

    while count != 1:
        if len(available_roots) == 0:
            versions_or_features = 1
        elif len(available_vars) == 0:
            versions_or_features = 0
        else:
            versions_or_features = random.randrange(0, 2)

        if versions_or_features == 0:
            root = random.choice(list(available_roots))
            selected_roots.append(root)
        else:
            var = random.choice([-1, 1]) * random.choice(list(available_vars))
            config.add(var)

        available_roots, deselected_roots = bdd.decision_propagation_multiversion_versions(config, selected_roots,
                                                                                           available_roots)
        count, free_vars, available_vars, simpl_vars, dimpl_vars = bdd.decision_propagation_multiversion_features(
            config, selected_roots, available_roots)

    dimpl_roots = set(bdd.roots).difference(selected_roots)
    return count, free_vars, config, available_vars, simpl_vars, dimpl_vars, available_roots, selected_roots, dimpl_roots


def generate_random_config_versions(bdd, available_vars):
    available_roots = set(bdd.roots)
    selected_roots = []
    config = set()
    count = 0

    while count != 1:
        root = random.choice(list(available_roots))
        selected_roots.append(root)

        available_roots, deselected_roots = bdd.decision_propagation_multiversion_versions(config, selected_roots,
                                                                                           available_roots)
        count, free_vars, available_vars, simpl_vars, dimpl_vars = bdd.decision_propagation_multiversion_features(
            config, selected_roots, available_roots)

        if len(available_roots) == 0 or random.choice([True, False]):
            break

    while len(available_vars) != 0:
        var = random.choice([-1, 1]) * random.choice(list(available_vars))
        config.add(var)

        available_roots, deselected_roots = bdd.decision_propagation_multiversion_versions(config, selected_roots,
                                                                                           available_roots)
        count, free_vars, available_vars, simpl_vars, dimpl_vars = bdd.decision_propagation_multiversion_features(
            config, selected_roots, available_roots)

    dimpl_roots = set(bdd.roots).difference(selected_roots)
    return count, free_vars, config, available_vars, simpl_vars, dimpl_vars, available_roots, selected_roots, dimpl_roots


def generate_random_config_features(bdd, available_vars):
    available_roots = set(bdd.roots)
    explicitly_selected_roots = []
    config = set()
    count = 0

    actions = []
    while count != 1:
        var = random.choice([-1, 1]) * random.choice(list(available_vars))
        config.add(var)

        start_time = time.time()
        available_roots, deselected_roots = bdd.decision_propagation_multiversion_versions(config, explicitly_selected_roots, available_roots)
        count, free_vars, available_vars, implicitly_selected_vars, implicitly_deselected_vars = bdd.decision_propagation_multiversion_features(config, explicitly_selected_roots, available_roots)
        end_time = time.time()

        actions.append({'type': 'f', 'id': var, 'duration': round(end_time - start_time, 4)})

    explicitly_selected_roots = available_roots

    implicitly_deselected_roots = set(bdd.roots).difference(explicitly_selected_roots)
    return count, config, available_vars, implicitly_selected_vars, implicitly_deselected_vars, available_roots, explicitly_selected_roots, implicitly_deselected_roots, actions


def verify_by_bdd(bdd, roots, config):
    for root in roots:
        if not bdd.verify(config, root):
            print("Invalid: ", root)
            return False

    return True


def process_function(arguments):
    bdd = arguments[0]
    initial_available_vars = arguments[1]

    start_time = time.time()
    count, config, available_vars, implicitly_selected_vars, implicitly_deselected_vars, available_roots, explicitly_selected_roots, implicitly_deselected_roots, actions = generate_random_config_features(bdd, initial_available_vars)
    end_time = time.time()

    result = {
        'total_duration': round(end_time - start_time, 4),
        'average_duration_per_action': sum([action['duration'] for action in actions]) / len(actions) ,
        'actions': actions,
        'number_actions': len(actions),

        'config': list(config),
        'explicitly_selected_vars': [c for c in config if c > 0],
        'explicitly_deselected_vars': [-c for c in config if c < 0],
        'implicitly_selected_vars': list(implicitly_selected_vars),
        'implicitly_deselected_vars': list(implicitly_deselected_vars),

        'explicitly_selected_roots': list(explicitly_selected_roots),
        'implicitly_deselected_roots': list(implicitly_deselected_roots)
    }
    print(arguments[2])
    return result


if __name__ == '__main__':
    # bdd = parse_from_ddueruem("../../data/coffeemachine/coffeemachine.bdd")
    bdd = parse_from_ddueruem("../../data/uclibc/uclibc.bdd")
    _, _, init_available_vars, _, _ = bdd.decision_propagation_multiversion_features([], [])

    # output_path = "../../data/coffeemachine/configs/versions.configs"
    output_path = "../../data/uclibc/configs/mix.configs"

    calcs_per_run = 4
    run = 0
    while (True):
        pool = multiprocessing.Pool(8)
        arguments = [(bdd, init_available_vars, run * calcs_per_run + i) for i in range(0, calcs_per_run)]
        results = pool.map(process_function, arguments)

        pool.close()
        pool.join()

        with open(output_path, "a") as file:
            for result in results:
                file.write(";".join(str(item) for item in result))
                file.write("\n")

        run += 1
