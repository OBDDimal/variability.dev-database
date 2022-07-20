import * as update_service from '@/services/FeatureModel/update.service.js';
import * as view from '@/services/FeatureModel/view.service.js';

export function hideLeftSiblings(d3Data, d3Node) {
    if (d3Node.data.getLeftSibling().isHidden) {
        d3Node.data.unhideLeftSiblings();
    } else {
        d3Node.data.hideLeftSiblings();
    }

    update_service.updateSvg(d3Data);
    view.focusNode(d3Data, d3Node);
}

export function hideRightSiblings(d3Data, d3Node) {
    if (d3Node.data.getRightSibling().isHidden) {
        d3Node.data.unhideRightSiblings();
    } else {
        d3Node.data.hideRightSiblings();
    }

    update_service.updateSvg(d3Data);
    view.focusNode(d3Data, d3Node);
}

export function hideCurrentNode(d3Data, d3Node) {
    d3Node.data.hide();

    update_service.updateSvg(d3Data);
    view.focusNode(d3Data, d3Node);
}