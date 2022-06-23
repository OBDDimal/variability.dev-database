<template>
  <div class="svg-container" style="width: 100%; height: 95vh"></div>
</template>

<script>
import Vue from "vue";
import * as d3 from "d3";
import { flextree } from "d3-flextree";
import * as CONSTANTS from "../classes/constants";
import { FeatureNode, PseudoNode } from "../classes/featureNode";
import { featureModelRawData } from "../services/transpiler.service";
import { createGroupSegment, createLink } from "../classes/createSvgPaths";

export default Vue.extend({
  name: "FeatureModelTree",

  components: {},

  props: {},

  data: () => ({
    flexLayout: undefined,
    rootD3Node: undefined,
    allD3Nodes: undefined,
    zoom: undefined,
    highlightedConstraintsContainer: undefined,
    linksContainer: undefined,
    segmentsContainer: undefined,
    featureNodesContainer: undefined,
    isShortenedName: true,
  }),

  computed: {},

  created() {
    this.initialize();
  },

  methods: {
    initialize() {
      // Flexlayout belongs to a d3-plugin that calculates the width between all nodes dynamically.
      this.flexLayout = flextree()
        .nodeSize((d3Node) => [
          this.calcRectWidth(d3Node) +
            CONSTANTS.SPACE_BETWEEN_NODES_HORIZONTALLY,
          CONSTANTS.RECT_HEIGHT + CONSTANTS.SPACE_BETWEEN_NODES_VERTICALLY,
        ])
        .spacing((d3NodeA, d3NodeB) => d3NodeA.path(d3NodeB).length);

      // Create root-feature-node with d3 and the data of the feature-model.
      this.rootD3Node = d3.hierarchy(
        featureModelRawData,
        (d3Node) => d3Node.children
      );
      this.allD3Nodes = this.rootD3Node.descendants();
      this.allD3Nodes.forEach(
        (d3Node) => (d3Node.allChildren = d3Node.children)
      );

      this.zoom = d3
        .zoom()
        //.scaleExtent([0.1, 8])
        .on("zoom", (event) => svgContent.attr("transform", event.transform));

      console.log(d3.select(".svg-container"));

      // Create svg-container.
      const svg = d3
        .select(".svg-container")
        .append("svg")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr(
          "viewBox",
          -CONSTANTS.SVG_WIDTH / 2 +
            " " +
            -CONSTANTS.SVG_MARGIN.top +
            " " +
            CONSTANTS.SVG_WIDTH +
            " " +
            CONSTANTS.SVG_HEIGHT
        )
        .on("click", this.closeContextMenu) // Click listener for closing all context-menus.
        .call(this.zoom); // Zooming and penning.

      const svgContent = svg.append("g");

      this.highlightedConstraintsContainer = svgContent
        .append("g")
        .classed("highlighted-constraints-container", true);

      this.linksContainer = svgContent
        .append("g")
        .classed("link-container", true);

      this.segmentsContainer = svgContent
        .append("g")
        .classed("segments-container", true);

      this.featureNodesContainer = svgContent
        .append("g")
        .classed("feature-node-container", true);

      this.resetView();
      this.updateSvg();
    },

    updateFeatureNodes(visibleD3Nodes) {
      const featureNode = this.featureNodesContainer.selectAll("g.node").data(
        visibleD3Nodes.filter((d3Node) => d3Node.data instanceof FeatureNode),
        (d3Node) =>
          d3Node.id || (d3Node.id = ++CONSTANTS.CONSTANTS.nodeIdCounter)
      );

      // Enter new nodes
      const featureNodeEnter = featureNode
        .enter()
        .append("g")
        .classed("node", true)
        .on("contextmenu", (event, d3Node) => this.contextMenu(event, d3Node)) // Open contextmenu with right-click on d3Node.
        .on("click", (event, d3Node) => this.collapseShortcut(event, d3Node)); // Collapse d3Node with Ctrl + left-click on d3Node.

      const rectAndTextEnter = featureNodeEnter
        .append("g")
        .classed("rect-and-text", true);
      rectAndTextEnter.append("rect").attr("height", CONSTANTS.RECT_HEIGHT);
      rectAndTextEnter
        .append("text")
        .attr("dy", CONSTANTS.RECT_HEIGHT / 2 + 5.5)
        .attr("font-size", CONSTANTS.FEATURE_FONT_SIZE);

      featureNodeEnter
        .filter((d3Node) => !d3Node.data.isRoot && d3Node.parent.data.isAnd())
        .append("circle")
        .classed("and-group-circle", true)
        .attr("r", CONSTANTS.MANDATORY_CIRCLE_RADIUS);

      // Enter circle with number of direct and total children.
      const childrenCountEnter = featureNodeEnter
        .filter((d3Node) => !d3Node.data.isLeaf())
        .append("g")
        .classed("children-count", true);
      childrenCountEnter
        .append("polygon")
        .attr("fill", "white")
        .attr("points", () => this.calculateTriangle());
      childrenCountEnter
        .append("text")
        .classed("children-count-text", true)
        .attr("dy", 5)
        .attr("font-size", CONSTANTS.CHILREN_COUNT_FONT_SIZE)
        .text((d3Node) => d3Node.data.childrenCount());
      childrenCountEnter
        .append("text")
        .classed("children-count-text", true)
        .attr("dy", 15)
        .attr("font-size", CONSTANTS.CHILREN_COUNT_FONT_SIZE)
        .text((d3Node) => d3Node.data.totalSubnodesCount());

      const pseudoNode = this.featureNodesContainer
        .selectAll("g.pseudo-node")
        .data(
          visibleD3Nodes.filter((d3Node) => d3Node.data instanceof PseudoNode),
          (d3Node) => d3Node.id || (d3Node.id = ++CONSTANTS.nodeIdCounter)
        );
      const pseudoNodeEnter = pseudoNode
        .enter()
        .append("g")
        .classed("pseudo-node", true)
        .on("click", (_, d3Node) => {
          d3Node.data.unhideHiddenNodes();
          this.updateHiding(d3Node.parent);
          this.updateSvg();
        });
      pseudoNodeEnter.append("circle").attr("r", CONSTANTS.PSEUDO_NODE_SIZE);
      pseudoNodeEnter
        .append("text")
        .attr("font-size", 30)
        .attr("dy", 2)
        .attr("dx", -12)
        .text("...");

      // Update nodes
      const featureNodeUpdate = featureNodeEnter.merge(featureNode);
      featureNodeUpdate.attr(
        "transform",
        (d3Node) => "translate(" + d3Node.x + ", " + d3Node.y + ")"
      );
      featureNodeUpdate
        .select(".and-group-circle")
        .classed(
          "mandatory-and-group-circle",
          (d3Node) =>
            d3Node.parent &&
            d3Node.parent.data.isAnd() &&
            d3Node.data.isMandatory
        )
        .classed(
          "optional-and-group-circle",
          (d3Node) =>
            d3Node.parent &&
            d3Node.parent.data.isAnd() &&
            !d3Node.data.isMandatory
        );

      const rectAndTextUpdate = featureNodeUpdate.select(".rect-and-text");
      rectAndTextUpdate
        .select("rect")
        .classed("is-searched-feature", (d3Node) => d3Node.data.isSearched)
        .attr("fill", (d3Node) =>
          d3Node.data.isAbstract
            ? CONSTANTS.NODE_ABSTRACT_COLOR
            : d3Node.data.color
        )
        .attr("x", (d3Node) => -this.calcRectWidth(d3Node) / 2)
        .attr("width", (d3Node) => this.calcRectWidth(d3Node));
      rectAndTextUpdate
        .select("text")
        .attr("font-style", (d3Node) =>
          d3Node.data.isAbstract ? "italic" : "normal"
        )
        .text((d3Node) =>
          this.isShortenedName ? d3Node.data.displayName : d3Node.data.name
        );

      // Children count update
      featureNodeUpdate
        .select("g.children-count")
        .attr(
          "transform",
          (d3Node) =>
            "translate(" +
            this.calcRectWidth(d3Node) / 2 +
            ", " +
            CONSTANTS.RECT_HEIGHT +
            ")"
        );

      const pseudoNodeUpdate = pseudoNodeEnter.merge(pseudoNode);
      pseudoNodeUpdate.attr(
        "transform",
        (d3Node) =>
          "translate(" +
          d3Node.x +
          ", " +
          (d3Node.y + CONSTANTS.RECT_HEIGHT / 2) +
          ")"
      );

      // Remove old/invisible nodes.
      featureNode.exit().remove();
      pseudoNode.exit().remove();
    },

    updateHighlightedConstraints(visibleD3Nodes) {
      const highlightedConstraintNodes = this.highlightedConstraintsContainer
        .selectAll("g.highlighted-constraints")
        .data(
          visibleD3Nodes.filter(
            (d3Node) =>
              d3Node.data instanceof FeatureNode &&
              d3Node.data.constraintsHighlighted.length
          ),
          (d3Node) => d3Node.id || (d3Node.id = ++CONSTANTS.nodeIdCounter)
        );

      const highlightedConstraintNodesEnter = highlightedConstraintNodes
        .enter()
        .append("g")
        .classed("highlighted-constraints", true);

      const highlightedConstraintNodeRects = highlightedConstraintNodesEnter
        .merge(highlightedConstraintNodes)
        .selectAll("rect")
        .data(
          (d3Node) =>
            d3Node.data.constraintsHighlighted.map((c) => ({
              constraint: c,
              d3Node: d3Node,
            })),
          (json) => json.constraint.toString() + json.d3Node.id
        );

      // Enter highlighted constraint rects
      const highlightedConstraintNodeRectsEnter = highlightedConstraintNodeRects
        .enter()
        .append("rect")
        .attr("stroke", (json) => json.constraint.color)
        .attr("stroke-width", CONSTANTS.STROKE_WIDTH_CONSTANT)
        .attr("fill", "transparent");

      // Update highlighted constraint rects
      highlightedConstraintNodeRectsEnter
        .merge(highlightedConstraintNodeRects)
        .attr("x", (json) => -this.calcRectWidth(json.d3Node) / 2)
        .attr(
          "height",
          (_, i) =>
            CONSTANTS.RECT_HEIGHT +
            i * 2 * CONSTANTS.STROKE_WIDTH_CONSTANT +
            CONSTANTS.STROKE_WIDTH_CONSTANT
        )
        .attr(
          "width",
          (json, i) =>
            this.calcRectWidth(json.d3Node) +
            i * 2 * CONSTANTS.STROKE_WIDTH_CONSTANT +
            CONSTANTS.STROKE_WIDTH_CONSTANT
        )
        .attr(
          "transform",
          (json, i) =>
            "translate(" +
            (json.d3Node.x -
              i * CONSTANTS.STROKE_WIDTH_CONSTANT -
              CONSTANTS.STROKE_WIDTH_CONSTANT / 2) +
            ", " +
            (json.d3Node.y -
              i * CONSTANTS.STROKE_WIDTH_CONSTANT -
              CONSTANTS.STROKE_WIDTH_CONSTANT / 2) +
            ")"
        );

      // Remove constraints highlighted nodes
      highlightedConstraintNodes.exit().remove();
      highlightedConstraintNodeRects.exit().remove();
    },

    updateLinks(visibleD3Nodes) {
      const links = visibleD3Nodes
        .slice(1)
        .filter((d3Node) => d3Node.data instanceof FeatureNode);
      const link = this.linksContainer
        .selectAll("path.link")
        .data(links, (d3Node) => d3Node.id);

      const linkEnter = link.enter().insert("path", "g").classed("link", true);

      const linkUpdate = linkEnter.merge(link);
      linkUpdate
        .classed("is-searched-link", (d3Node) => d3Node.data.isSearched)
        .attr("d", (d3Node) => createLink(d3Node.parent, d3Node));

      link.exit().remove();
    },

    updateSegments(visibleD3Nodes) {
      const segment = this.segmentsContainer.selectAll("path.segment").data(
        visibleD3Nodes.filter(
          (d3Node) =>
            d3Node.data instanceof FeatureNode &&
            (d3Node.data.isAlt() || d3Node.data.isOr())
        ),
        (d3Node) => d3Node.id || (d3Node.id = ++CONSTANTS.nodeIdCounter)
      );

      const segmentEnter = segment
        .enter()
        .append("path")
        .classed("segment", true);

      // Segment update
      segmentEnter
        .merge(segment)
        .classed("alt-group", (d3Node) => d3Node.data.isAlt())
        .classed("or-group", (d3Node) => d3Node.data.isOr())
        .attr("d", (d3Node) =>
          createGroupSegment(d3Node, CONSTANTS.GROUP_SEGMENT_RADIUS)
        )
        .attr(
          "transform",
          (d3Node) => "translate(" + d3Node.x + ", " + d3Node.y + ")"
        );

      segment.exit().remove();
    },

    updateSvg() {
      const start = performance.now();

      // Flexlayout belongs to a d3-plugin that calculates the width between all nodes dynamically.
      const visibleD3Nodes = this.flexLayout(this.rootD3Node).descendants();

      this.updateHighlightedConstraints(visibleD3Nodes);
      this.updateSegments(visibleD3Nodes);
      this.updateFeatureNodes(visibleD3Nodes);
      this.updateLinks(visibleD3Nodes);

      console.log("Rendertime", performance.now() - start);
    },

    // Collapses all children of the specifed node with shortcut CTRL + left-click.
    collapseShortcut(event, d3Node) {
      if (event.getModifierState("Control")) {
        d3Node.data.toggleCollapse();
        this.updateCollapsing();
        this.updateSvg();
      }
    },

    // Calculates rect-witdh dependent on font-size dynamically.
    calcRectWidth(d3Node) {
      if (d3Node.data instanceof FeatureNode) {
        return (
          (this.isShortenedName // TODO: Ask Lukas whether to use prop or not
            ? d3Node.data.displayName.length
            : d3Node.data.name.length) *
            (CONSTANTS.FEATURE_FONT_SIZE *
              CONSTANTS.MONOSPACE_HEIGHT_WIDTH_FACTOR) +
          CONSTANTS.RECT_MARGIN.left +
          CONSTANTS.RECT_MARGIN.right
        );
      } else if (d3Node.data instanceof PseudoNode) {
        return CONSTANTS.PSEUDO_NODE_SIZE * 2;
      }
    },

    focusNode(d3Node) {
      d3.select("svg").call(this.zoom.translateTo, d3Node.x, d3Node.y);
    },

    updateCollapsing() {
      this.allD3Nodes.forEach((d3Node) => {
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
    },

    calculateTriangle() {
      const base = 35;

      const h = Math.sin(60) * base;

      const [ax, ay] = [-(base / 2), base / 2];
      const [bx, by] = [base / 2, base / 2];
      const [cx, cy] = [0, h];

      return [`${ax},${ay}`, `${bx},${by}`, `${cx},${cy}`];
    },

    resetView(uncollapsedLevels = 4, maxChildrenCount = 3) {
      // Collapses all nodes after depth 1.
      this.allD3Nodes.forEach((d3Node) => d3Node.data.collapse());

      let currentChildren = [this.rootD3Node.data];
      for (let i = 1; i <= uncollapsedLevels; i++) {
        currentChildren.forEach((child) => {
          if (child.children.length <= maxChildrenCount) {
            child.uncollapse(false);
          }
        });
        currentChildren = currentChildren
          .map((parent) =>
            parent.children.length <= maxChildrenCount ? parent.children : []
          )
          .flat();

        if (currentChildren.length === 0) {
          break;
        }
      }

      // TODO: Reset zoom and translation

      this.updateCollapsing();
      this.updateSvg();
    },

    zoomFit(padding = 0.75) {
      let bounds = document.querySelector("svg > g").getBBox();
      let fullWidth = document
          .querySelector("svg")
          .getBoundingClientRect().width,
        fullHeight = document
          .querySelector("svg")
          .getBoundingClientRect().height;
      let width = bounds.width,
        height = bounds.height;
      let midX = bounds.x + width / 2,
        midY = bounds.y + height / 2;
      if (width == 0 || height == 0) return; // nothing to fit
      let scale = padding / Math.max(width / fullWidth, height / fullHeight);

      d3.select("svg")
        .call(this.zoom.translateTo, midX, midY)
        .call(this.zoom.scaleTo, scale);
    },

    updateHiding(d3Parent) {
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
    },
  },
});
</script>

<style scoped></style>
