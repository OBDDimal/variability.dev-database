import * as d3 from "d3";
import * as update from '@/services/FeatureModel/update.service.js';
import * as collapse from '@/services/FeatureModel/collapse.service.js';
import * as hide from '@/services/FeatureModel/hide.service.js';

export function addNode(d3Data, newNode) {
    if (d3Data.d3ParentOfAddNode.data.isLeaf()) {
        d3Data.d3ParentOfAddNode.allChildren = [];
    }

    d3Data.d3ParentOfAddNode.data.collapse();
    collapse.updateCollapsing(d3Data);

    d3Data.d3ParentOfAddNode.data.unhideChildren();
    hide.updateHiding(d3Data.d3ParentOfAddNode);

    newNode.parent.children.push(newNode);

    const d3NewNode = d3.hierarchy(newNode);
    d3NewNode.parent = d3Data.d3ParentOfAddNode;
    d3Data.d3ParentOfAddNode.allChildren.push(d3NewNode);
    d3Data.d3ParentOfAddNode.children = d3Data.d3ParentOfAddNode.allChildren;

    d3Data.d3ParentOfAddNode = undefined;
    update.updateSvg(d3Data);
}