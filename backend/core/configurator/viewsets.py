from rest_framework.views import APIView
from rest_framework.response import Response

from .libdddmp import parse_from_ddueruem
from .serializers import ConfigurationRequestSerializer, DecisionPropagationSerializer


class ConfiguratorList(APIView):
    def get(self, request):
        paras = [{"config": [1,2,3,4,5], "selected_roots": [1,2]}]
        serializer = ConfigurationRequestSerializer(paras, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ConfigurationRequestSerializer(data=request.data)
        if serializer.is_valid():
            config = request.data['config']
            selected_roots = request.data['selected_roots']
            available_roots = request.data['available_roots']

            bdd = parse_from_ddueruem("toybox.bdd")

            count, free_vars, available_vars, simpl_vars, dimpl_vars = bdd.decision_propagation_multiversion_features(config, selected_roots, available_roots)
            available_roots, deselected_roots = bdd.decision_propagation_multiversion_versions(config, selected_roots, available_roots)

            paras = {"config": config, "selected_roots": selected_roots, "count": count,
                     "free_vars": free_vars, "available_vars": available_vars,
                     "implicit_selected_vars": simpl_vars, "implicit_deselected_vars": dimpl_vars,
                     "available_roots": available_roots, "deselected_roots": deselected_roots}

            serializer = DecisionPropagationSerializer(paras)

            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
