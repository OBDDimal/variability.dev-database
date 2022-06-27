export const SVG_MARGIN = { top: 20, right: 90, bottom: 20, left: 90 };
export const SVG_WIDTH = window.innerWidth - SVG_MARGIN.left - SVG_MARGIN.right;
export const SVG_HEIGHT =
  window.innerHeight -
  SVG_MARGIN.top -
  SVG_MARGIN.bottom -
  window.innerHeight / 10; // To compensate for the footer

export const RECT_MARGIN = { right: 8, left: 8 };
export const RECT_HEIGHT = 35;

export const MONOSPACE_HEIGHT_WIDTH_FACTOR = 0.6;
export const MANDATORY_CIRCLE_RADIUS = 6;
export const GROUP_SEGMENT_RADIUS = 40; // Radius of the segment that represents the 'alt' and 'and' groups.
export const CHILDREN_COUNT_LETTERS_TO_RADIUS = 11.5 * MONOSPACE_HEIGHT_WIDTH_FACTOR;

export const FEATURE_FONT_SIZE = 16;
export const CHILREN_COUNT_FONT_SIZE = 7;

export const SPACE_BETWEEN_NODES_HORIZONTALLY = 20;

export let nodeIdCounter = 0;

export const PSEUDO_NODE_SIZE = 20;

export let CONSTRAINT_HIGHLIGHT_COLORS = [
  "aqua",
  "blueviolet",
  "chartreuse",
  "crimson",
  "darkorange",
  "forestgreen",
  "red",
  "yellow",
  "indigo",
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
export const NODE_ABSTRACT_COLOR = "#ebebff";

export const DISPLAY_NAME_LENGTH = 8;
export const operators = {
    imp: "⇒",
    conj: "∧",
    disj: "∨",
    eq: "⇔",
    not: "¬",
}