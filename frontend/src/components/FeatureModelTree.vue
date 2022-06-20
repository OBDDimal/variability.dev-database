<template>
  <div id="svg-container" style="width: 100%; height: 95vh"></div>
</template>

<script allowJs="">
import Vue from "vue";
import * as constants from "@/classes/constants.ts";
import * as func from "@/classes/updates.js";
import d3 from "d3";
import flextree from "d3-flextree";
import hierarchy from "d3-hierarchy";

let flexLayout = null;
let rootD3Node = null;
let allD3Nodes = null;
let zoom = null;
let highlightedConstraintsContainer = null;
let linksContainer = null;
let segmentsContainer = null;
let featureNodesContainer = null;

export default Vue.extend({
  name: "FeatureModelTree",

  components: {},

  props: {},

  data: () => ({}),

  computed: {},

  methods: {
    initialize() {
      // Flexlayout belongs to a d3-plugin that calculates the width between all nodes dynamically.
      flexLayout = d3
        .flextree()
        .nodeSize((d3Node) => [
          calcRectWidth(d3Node) + constants.SPACE_BETWEEN_NODES_HORIZONTALLY,
          RECT_HEIGHT + constants.SPACE_BETWEEN_NODES_VERTICALLY,
        ])
        .spacing((d3NodeA, d3NodeB) => d3NodeA.path(d3NodeB).length);

      // Create root-feature-node with d3 and the data of the feature-model.
      rootD3Node = d3.hierarchy(
        featureModelRawData,
        (d3Node) => d3Node.children
      );
      allD3Nodes = rootD3Node.descendants();
      allD3Nodes.forEach((d3Node) => (d3Node.allChildren = d3Node.children));

      zoom = d3
        .zoom()
        //.scaleExtent([0.1, 8])
        .on("zoom", (event) => svgContent.attr("transform", event.transform));

      // Create svg-container.
      const svg = d3
        .select(".svg-container")
        .append("svg")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr(
          "viewBox",
          -constants.SVG_WIDTH / 2 +
            " " +
            -constants.SVG_MARGIN.top +
            " " +
            constants.SVG_WIDTH +
            " " +
            constants.SVG_HEIGHT
        )
        .on("click", closeContextMenu) // Click listener for closing all context-menus.
        .call(zoom); // Zooming and penning.

      const svgContent = svg.append("g");

      highlightedConstraintsContainer = svgContent
        .append("g")
        .classed("highlighted-constraints-container", true);

      linksContainer = svgContent.append("g").classed("link-container", true);

      segmentsContainer = svgContent
        .append("g")
        .classed("segments-container", true);

      featureNodesContainer = svgContent
        .append("g")
        .classed("feature-node-container", true);

      func.resetView();
      func.updateSvg();
    },
  },

  mounted() {
    this.initialize();
  },
});
</script>

<style scoped></style>
