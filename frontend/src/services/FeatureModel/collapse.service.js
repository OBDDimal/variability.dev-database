import * as update from '@/services/FeatureModel/update.service.js';

// Collapses all children of the specified node with shortcut ALT + left-click.
export function collapseShortcut(d3Data, event, d3Node) {
    if (event.getModifierState('Alt')) {
        d3Node.data.toggleCollapse();
        updateCollapsing(d3Data);
        update.updateSvg(d3Data);
    }
}

export function updateCollapsing(d3Data) {
    d3Data.allNodes.forEach((d3Node) => {
        if (!d3Node.data.isLeaf()) {
            if (d3Node.data.isCollapsed && !d3Node.collapsedChildren) {
                d3Node.collapsedChildren = d3Node.children;
                d3Node.children = null;
            } else if (!d3Node.data.isCollapsed && !d3Node.children) {
                d3Node.children = d3Node.collapsedChildren;
                d3Node.collapsedChildren = null;
            }
        }
    });
}