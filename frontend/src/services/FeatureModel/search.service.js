import levenshtein from 'js-levenshtein';
import * as view from "@/services/FeatureModel/view.service.js";
import * as update from '@/services/FeatureModel/update.service.js';


export function search(d3Data, searchText) {
    d3Data.root.data.each((node) => {
        node.isSearched = false;
        node.collapse();
    });

    if (searchText !== '') {
        const foundNode = findNode(d3Data, searchText);
        console.log(foundNode);
        foundNode.getAllNodesToRoot().forEach((node) => node.isSearched = true);
        foundNode.uncollapse(true);

        update.updateSvg(d3Data);
        view.zoomFit(d3Data);
        view.focusNode(d3Data, foundNode.d3Node);
    } else {
        update.updateSvg(d3Data);
    }
}

function findNode(d3Data, search) {
    const distances = d3Data.root.data
        .descendants()
        .map((node) => {
            const currentNodeName = node.name.toLowerCase();
            if (currentNodeName !== search.toLowerCase() && currentNodeName.includes(search.toLowerCase())) {
                return {node: node, distance: 1};
            }

            return {node: node, distance: levenshtein(node.name.toLowerCase(), search.toLowerCase())};
        })
        .sort((a, b) => a.distance - b.distance);

    return distances[0].node;
}