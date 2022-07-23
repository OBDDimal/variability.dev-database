import * as update_service from '@/services/FeatureModel/update.service.js';
import * as view from '@/services/FeatureModel/view.service.js';
import {PseudoNode} from "@/classes/featureNode";
import * as d3 from "d3";

export function hideLeftSiblings(d3Data, d3Node) {
    if (d3Node.data.getLeftSibling().isHidden) {
        d3Node.data.unhideLeftSiblings();
    } else {
        d3Node.data.hideLeftSiblings();
    }

    update(d3Node.parent);
    update_service.updateSvg(d3Data);
    view.focusNode(d3Data, d3Node);
}

export function hideRightSiblings(d3Data, d3Node) {
    if (d3Node.data.getRightSibling().isHidden) {
        d3Node.data.unhideRightSiblings();
    } else {
        d3Node.data.hideRightSiblings();
    }

    update(d3Node.parent);
    update_service.updateSvg(d3Data);
    view.focusNode(d3Data, d3Node);
}

export function hideCurrentNode(d3Data, d3Node) {
    d3Node.data.hide();

    update(d3Node.parent);
    update_service.updateSvg(d3Data);
    view.focusNode(d3Data, d3Node);
}

export function hideAllOtherNodes(d3Data, d3Node) {
    // Get all nodes to root without root.
    d3Node.data.getAllNodesToRoot().slice(0, -1).forEach((node) => {
        node.hideRightSiblings();
        node.hideLeftSiblings();
        update(node.parent.d3Node);
    });

    update_service.updateSvg(d3Data);
    view.focusNode(d3Data, d3Node);
}

export function hideAllNodesOnThisLevel(d3Data, d3Node) {
   d3Node.data.hideRightSiblings();
   d3Node.data.hideLeftSiblings();

   update(d3Node.parent);
   update_service.updateSvg(d3Data);
   view.focusNode(d3Data, d3Node);
}

export function update(d3Parent) {
    d3Parent.children = [];

    let isPreviousNodeHidden = false;
    let currentPseudoNode;
    d3Parent.allChildren.forEach((d3Child) => {
        if (d3Child.data.isHidden && !isPreviousNodeHidden) {
            currentPseudoNode = new PseudoNode(d3Child);
            const d3PseudoNode = d3.hierarchy(currentPseudoNode);
            d3PseudoNode.parent = d3Parent;
            d3Parent.children.push(d3PseudoNode);
        } else if (d3Child.data.isHidden && isPreviousNodeHidden) {
            currentPseudoNode.hiddenD3Children.push(d3Child);
        } else {
            d3Parent.children.push(d3Child);
        }
        isPreviousNodeHidden = d3Child.data.isHidden;
    });
}