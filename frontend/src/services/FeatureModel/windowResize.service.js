import * as view from '@/services/FeatureModel/view.service.js';
import * as d3 from 'd3';

export function update(d3Data) {
    d3.select('#svg-container')
        .style('height', window.innerHeight - 100);

    d3.select('#svg-container > svg')
        .attr(
            'viewBox',
            `0 0 ${window.innerWidth} ${window.innerHeight - 64}`,
        );

    view.zoomFit(d3Data);
}
