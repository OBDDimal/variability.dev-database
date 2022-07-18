import * as d3 from "d3";
import * as update from '@/services/FeatureModel/update.service.js';
import * as collapse from '@/services/FeatureModel/collapse.service.js';
import * as hide from '@/services/FeatureModel/hide.service.js';

export function addAsChild(d3Data, newNode) {
    // Update member allChildren.
    if (d3Data.d3ParentOfAddNode.data.isLeaf()) {
        d3Data.d3ParentOfAddNode.allChildren = [];
    }

    // Uncollapse all children of current parent.
    d3Data.d3ParentOfAddNode.data.uncollapse();
    collapse.update(d3Data);

    add(d3Data, newNode);
}

export function addAsSibling(d3Data, newNode) {
    add(d3Data, newNode);
}

function add(d3Data, newNode) {
    // Unhide all children of parent.
    d3Data.d3ParentOfAddNode.data.unhideChildren();
    hide.update(d3Data.d3ParentOfAddNode);

    newNode.parent.children.push(newNode);

    // Create new d3-node and add it to all list (allChildren, children).
    const d3NewNode = d3.hierarchy(newNode);
    d3NewNode.parent = d3Data.d3ParentOfAddNode;
    d3Data.d3ParentOfAddNode.allChildren.push(d3NewNode);
    d3Data.d3ParentOfAddNode.children = d3Data.d3ParentOfAddNode.allChildren;

    // Add to allNodes
    d3Data.allNodes.push(d3NewNode);

    // Reset and update svg.
    d3Data.d3ParentOfAddNode = undefined;
    update.updateSvg(d3Data);
}