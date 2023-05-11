from rest_framework.views import APIView
from rest_framework.response import Response
import os
import re

from .libdddmp import parse_from_ddueruem
from .serializers import ConfigurationRequestSerializer, DecisionPropagationSerializer, ExplanationsSerializer


class DecisionPropagation(APIView):
    bdds = {}

    def get(self, request):
        paras = [{"config": [1,2,3,4,5], "selected_roots": [1,2]}]
        serializer = ConfigurationRequestSerializer(paras, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ConfigurationRequestSerializer(data=request.data)
        if serializer.is_valid():
            name = request.data['name']
            config = request.data['config']
            selected_roots = request.data['selected_roots']
            available_roots = request.data['available_roots']
            if len(available_roots) == 0:
                available_roots = None

            if name in DecisionPropagation.bdds:
                bdd = DecisionPropagation.bdds[name]
            else:
                bdd = parse_from_ddueruem("data/" + name + "/" + name + ".bdd")
                bdd.nodes_per_root = [set([var for _, var, high, low in bdd.get_nodes(root) if high != 0]) for root in bdd.roots]
                DecisionPropagation.bdds[name] = bdd

            count, free_vars, available_vars, simpl_vars, dimpl_vars = bdd.decision_propagation_multiversion_features(config, selected_roots, available_roots)
            available_roots, deselected_roots = bdd.decision_propagation_multiversion_versions(config, selected_roots, available_roots)

            results = {"config": config, "selected_roots": selected_roots, "count": count,
                     "free_vars": free_vars, "available_vars": available_vars,
                     "implicit_selected_vars": simpl_vars, "implicit_deselected_vars": dimpl_vars,
                     "available_roots": available_roots, "deselected_roots": deselected_roots}

            serializer = DecisionPropagationSerializer(results)

            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class FeatureModels(APIView):
    def get(self, request, name, version_name):
        feature_model_path = "data/" + name + "/feature-models/" + version_name + ".xml"

        if not os.path.isfile(feature_model_path):
            return Response(status=404)

        with open(feature_model_path) as file:
            return Response(file.read(), status=200)


class Mappings(APIView):
    def get(self, request, name):
        root_mapping_file_path = "data/" + name + "/" + name + ".bdd-mapping"
        feature_mapping_dir = "data/" + name + "/dimacs"

        if not os.path.isfile(root_mapping_file_path):
            return Response(status=404)

        root_mapping = []
        with open(root_mapping_file_path) as root_mapping_file:
            for i, line in enumerate(root_mapping_file):
                if m := re.match(r"(?P<version_name>\S*)-SNG.dimacs-(?P<root_index>\d+)-(?P<number_of_roots>\d+):(?P<root_id>\d+)", line):
                    root_mapping.append({"version-name": m['version_name'], "root-id": int(m['root_id'])})

        feature_mapping = []
        with open(feature_mapping_dir + "/" + os.listdir(feature_mapping_dir)[0]) as feature_mapping_file:
            for line in feature_mapping_file:
                if m := re.match(r"c\s(?P<var_id>\d+)\s(?P<var_name>.+)", line):
                    feature_mapping.append({"var-name": m["var_name"], "var-id": int(m["var_id"])})


        result = {"root-mapping": root_mapping, "feature-mapping": feature_mapping}
        return Response(result, status=200)


class Explanations(APIView):
    def post(self, request, name):
        serializer = ExplanationsSerializer(data=request.data)
        if serializer.is_valid():
            var = request.data['var']
            config = request.data['config']
            selected_roots = request.data['selected_roots']

            if name in DecisionPropagation.bdds:
                bdd = DecisionPropagation.bdds[name]
            else:
                bdd = parse_from_ddueruem("data/" + name + "/" + name + ".bdd")
                DecisionPropagation.bdds[name] = bdd

            explanations = bdd.explanations_feature(var, config, selected_roots)

            return Response(explanations, status=200)
        return Response(serializer.errors, status=400)



