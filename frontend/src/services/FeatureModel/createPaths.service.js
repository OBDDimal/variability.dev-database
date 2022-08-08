import * as CONSTANTS from "@/classes/constants";

// Helper functions for drawing alternative-group and and-group paths
const MOVE = 'M', LINE = 'L', ARC = 'A', CLOSE = 'Z';

function polarToCartesian(point, radius, degrees) {
    const rad = degrees * Math.PI / 180.0;
    return {
        x: point.x + (radius * Math.cos(rad)),
        y: point.y + (radius * Math.sin(rad)),
    };
}

function cartesianToAngle(centerPoint, point) {
    return Math.atan2(point.y - centerPoint.y, point.x - centerPoint.x) * 180.0 / Math.PI;
}

function translateToPathD(...data) {
    return data.join(' ');
}

function createPathDOfSegment(centerPoint, radius, startAngle, endAngle) {
    const start = polarToCartesian(centerPoint, radius, startAngle);
    const end = polarToCartesian(centerPoint, radius, endAngle);

    const a = translateToPathD(MOVE, toPath(end), ARC, radius, radius, 0, 0, 1, toPath(start));
    const b = translateToPathD(LINE, toPath(centerPoint), CLOSE);

    return translateToPathD(a, b, CLOSE);
}

function toPath({x, y}) {
    return `${x},${y}`;
}

export function createGroupSegmentHorizontally(d3Node, radius) {
    const rectAnchor = {x: d3Node.x + d3Node.width, y: d3Node.y};
    return createGroupSegment(d3Node, radius, rectAnchor);
}

export function createGroupSegmentVertically(d3Node, radius) {
    const rectAnchor = {x: d3Node.x, y: d3Node.y + CONSTANTS.RECT_HEIGHT};
    return createGroupSegment(d3Node, radius, rectAnchor);
}

function createGroupSegment(d3Node, radius, rectAnchor) {
    if (d3Node.children && d3Node.children.length > 1) {

        const firstChild = d3Node.children[0].isPseudoElement ? d3Node.children[1] : d3Node.children[0];
        const lastChild = d3Node.children[d3Node.children.length - 1].isPseudoElement ? d3Node.children[d3Node.children.length - 2] : d3Node.children[d3Node.children.length - 1];

        let startAngle = cartesianToAngle(rectAnchor, firstChild);
        let endAngle = cartesianToAngle(rectAnchor, lastChild);
        if (startAngle < endAngle) {
            const tmp = startAngle;
            startAngle = endAngle;
            endAngle = tmp;
        }
        return createPathDOfSegment({x: 0, y: 0}, radius, startAngle, endAngle);
    }

    return null;
}

export function createLinkVertically(src, dest) {
    const src_y = src.y + CONSTANTS.RECT_HEIGHT;
    return `M ${src.x} ${src_y} L ${dest.x} ${dest.y}`;
}

export function createLinkHorizontally(src, dest) {
    return `M ${src.x + src.width} ${src.y} L ${dest.x} ${dest.y}`;
}

export function calculateTriangle() {
    const base = 35;

    const h = Math.sin(60) * base;

    const [ax, ay] = [-(base / 2), base / 2];
    const [bx, by] = [base / 2, base / 2];
    const [cx, cy] = [0, h];

    return [`${ax},${ay}`, `${bx},${by}`, `${cx},${cy}`];
}
