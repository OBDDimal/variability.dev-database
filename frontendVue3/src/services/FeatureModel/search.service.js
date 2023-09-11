import levenshtein from 'js-levenshtein';
import * as view from "@/services/FeatureModel/view.service.js";
import * as update from '@/services/FeatureModel/update.service.js';
import { zoomFit } from '@/services/FeatureModel/view.service.js';

export function resetSearch(d3Data) {
    d3Data.root.data.each(node => {
        node.isSearched = false;
        node.collapse();
    });

    view.reset(d3Data);
    update.updateSvg(d3Data);
    zoomFit(d3Data);
}

export function markNodeAsSearched(d3Data, foundNode) {
    resetSearch(d3Data);

    foundNode.getAllNodesToRoot().forEach(node => node.isSearched = true);
    foundNode.uncollapse(true);

    update.updateSvg(d3Data);
    view.zoomFit(d3Data);
    view.focusNode(d3Data, foundNode.d3Node);
}

export function search(d3Data, searchText) {
    if (!searchText || searchText === '') {
        return [];
    }

    return d3Data.root.data
        .descendants()
        .map(node => {
            const currentNodeName = node.name.toLowerCase();
            if (currentNodeName !== searchText.toLowerCase() && currentNodeName.includes(searchText.toLowerCase())) {
                return {node: node, distance: 1};
            }

            return {node: node, distance: levenshtein(node.name.toLowerCase(), searchText.toLowerCase())};
        })
        .filter(d => d.distance <= 2)
        .sort((a, b) => a.distance - b.distance);
}
