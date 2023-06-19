import * as update_service from '@/services/FeatureModel/update.service.js';

// Collapses all children of the specified node with shortcut ALT + left-click.
export function collapseShortcut(d3Data, event, d3Node) {
    if (event.getModifierState('Alt')) {
        d3Node.data.toggleCollapse();
        update_service.updateSvg(d3Data);
    }
}
