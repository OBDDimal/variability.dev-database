export const SVG_MARGIN = {top: 20, right: 90, bottom: 20, left: 90};

export const RECT_MARGIN = {right: 8, left: 8};
export const RECT_HEIGHT = 35;

export const TRIANGLE_HORIZONTAL_ROTATION=270;
export const TRIANGLE_BORDER_OFFSET=11;
export const MONOSPACE_HEIGHT_WIDTH_FACTOR = 0.6;
export const MANDATORY_CIRCLE_RADIUS = 6;
export const GROUP_SEGMENT_RADIUS = 25; // Radius of the segment that represents the 'alt' and 'and' groups.
export const FEATURE_FONT_SIZE = 16;
export const CHILDREN_COUNT_FONT_SIZE = 7;

export const PSEUDO_NODE_SIZE = 20;

export const GHOST_NODE_RADIUS_MOUSE = 15;
export const GHOST_NODE_RADIUS_TOUCH = 30;

export const QUICK_EDIT_RADIUS = 5;

export let CONSTRAINT_HIGHLIGHT_COLORS = [
    '#B762D9',
    '#FFB17A',
    '#AEE7C2',
    '#E2FBC5',
    '#F3C969',
    '#37FF8B',
    '#51D6FF',
    '#A0AECF',
    '#F4743B',
    '#F45B69',
];

export const COLORING_MAP = [
    "#4e78b5",
    "#6694c1",
    "#80b1cc",
    "#9dced6",
    "#c0eade",
    "#ffffe0",
    "#eb6574",
    "#d5405e",
    "#b81b4a",
    "#93003a",
];

export const STROKE_WIDTH_CONSTANT = 4;

export const NODE_COLOR = "rgb(204, 204, 255)";
export const NODE_EDITED_COLOR = "rgb(197,196,120)";
export const NODE_ABSTRACT_COLOR = "#ebebff";

export const NODE_DEAD_COLOR = "rgb(255, 46, 46)";

export const NODE_FALSEOP_COLOR = "rgb(255, 153, 51)";

export const NODE_CORE_COLOR = "rgb(51, 51, 255)";

export const DISPLAY_NAME_LENGTH = 8;
export const DISPLAY_NAME_RAW= 5;
export const POINTS = '...';
export const operators = {
    imp: "⇒",
    conj: "∧",
    disj: "∨",
    eq: "⇔",
    not: "¬",
};

export const EXAMPLE_FEATURE_MODEL_XML = `
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<featureModel>
    <properties/>
        <struct>
            <and name="Root" mandatory="true">
                <feature mandatory="true" name="Feature A"/>
                <feature mandatory="false" name="Feature B"/>
            </and>
        </struct>
    <constraints/>
    <comments/>
</featureModel>
`;
