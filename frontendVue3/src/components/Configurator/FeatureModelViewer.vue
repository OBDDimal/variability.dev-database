<template>
    <div id="svg-container"></div>
</template>

<script>
import * as update from '@/services/Configurator/update.service.js'
import * as init from '@/services/FeatureModel/init.service.js'
import * as view from '@/services/FeatureModel/view.service.js'
import * as search from '@/services/FeatureModel/search.service.js'
import {Version} from "@/classes/Configurator/Version";
import {zoomFit} from "@/services/FeatureModel/view.service.js";

export default {
  name: 'FeatureModelViewer',

  props: {
    version: Version,
  },

  data: () => ({
    d3Data: {
      root: undefined,
      flexLayout: undefined,
      zoom: undefined,
      nodeIdCounter: 0,
      isShortenedName: false,
      contextMenu: {
        selectedD3Node: undefined,
        event: undefined,
      },
      container: {
        highlightedConstraintsContainer: undefined,
        linksContainer: undefined,
        segmentsContainer: undefined,
        featureNodesContainer: undefined,
      },
      spaceBetweenParentChild: 75,
      spaceBetweenSiblings: 20,
      coloringIndex: -1,
      direction: 'v', // h = horizontally, v = vertically
      maxHorizontallyLevelWidth: [],
    },
    search: {
      showSearch: false,
      searchText: undefined,
      selectedNode: undefined,
      foundNodeIndex: 0,
      foundNodeDistances: [],
    },
  }),

  mounted() {
    this.init();
  },

  watch: {
    version() {
      document.getElementById("svg-container").innerHTML = "";
      this.d3Data.flexLayout = undefined;
      this.d3Data.root = undefined;
      this.d3Data.nodeIdCounter = 0;
      this.init();
    }
  },

  methods: {
    init() {
      init.initialize(this.d3Data, this.version.root)
      this.resetView(4, 3);
    },
    resetView(levels, maxChildren) {
      view.reset(this.d3Data, levels, maxChildren)
      update.updateSvg(this.d3Data);
      zoomFit(this.d3Data);
    },
    coloring(coloringIndex) {
      this.d3Data.coloringIndex = coloringIndex
      update.updateSvg(this.d3Data)
    },
    onChangeFoundNodeIndex(index) {
      if (index < this.search.foundNodeDistances.length) {
        this.search.selectedNode =
            this.search.foundNodeDistances[index].node
        search.markNodeAsSearched(this.d3Data, this.search.selectedNode)
      }
    },
    onChangeSearchText(searchText) {
      this.search.foundNodeDistances = search.search(
          this.d3Data,
          searchText
      )
      search.resetSearch(this.d3Data)
      if (this.search.foundNodeDistances.length) {
        this.onChangeFoundNodeIndex(0)
      } else {
        update.updateSvg(this.d3Data)
      }
    },
    updateSvg() {
      update.updateSvg(this.d3Data)
    },
    fitToView() {
      view.zoomFit(this.d3Data)
    },
    toggleDirection() {
      this.d3Data.direction = this.d3Data.direction === 'v' ? 'h' : 'v'
      update.updateSvg(this.d3Data)
    },
    hideCurrentNode(d3Node) {
      this.closeContextMenu()
      d3Node.data.hide()
      update.updateSvg(this.d3Data)
      view.focusNode(this.d3Data, d3Node)
    },
    hideRightSiblings(d3Node) {
      this.closeContextMenu()
      d3Node.data.toggleHideRightSiblings()
      update.updateSvg(this.d3Data)
      view.focusNode(this.d3Data, d3Node)
    },
    hideLeftSiblings(d3Node) {
      this.closeContextMenu()
      d3Node.data.toggleHideLeftSiblings()
      update.updateSvg(this.d3Data)
      view.focusNode(this.d3Data, d3Node)
    },
    hideAllOtherNodes(d3Node) {
      this.closeContextMenu()
      d3Node.data.hideAllOtherNodes()
      update.updateSvg(this.d3Data)
      view.focusNode(this.d3Data, d3Node)
    },
    hideAllNodesOnThisLevel(d3Node) {
      this.closeContextMenu()
      d3Node.data.hideAllNodesOnThisLevel()
      update.updateSvg(this.d3Data)
      view.focusNode(this.d3Data, d3Node)
    },
    closeContextMenu() {
      this.d3Data.contextMenu.selectedD3Node = null
    },
    collapse(d3Node) {
      this.closeContextMenu()
      d3Node.data.toggleCollapse()
      update.updateSvg(this.d3Data)
    },
    changeShortName(isShortName) {
      this.d3Data.isShortenedName = isShortName
      update.updateSvg(this.d3Data)
    },
    changeSpaceBetweenParentChild(spacing) {
      this.d3Data.spaceBetweenParentChild = spacing
      update.updateSvg(this.d3Data)
    },
    changeSpaceBetweenSiblings(spacing) {
      this.d3Data.spaceBetweenSiblings = spacing
      update.updateSvg(this.d3Data)
    },
    highlightConstraints(d3Node) {
      d3Node.data.constraints.forEach((constraint) =>
          constraint.highlight()
      )
      update.updateSvg(this.d3Data)
      this.updateConstraints()
    },
    resetHighlightConstraints(d3Node) {
      d3Node.data.constraints.forEach((constraint) =>
          constraint.resetHighlight()
      )
      update.updateSvg(this.d3Data)
      this.updateConstraints()
    },
    updateConstraints() {
      this.$emit('update-constraints')
    },
  },

  computed: {
    allNodes() {
      if (this.d3Data.root) {
        return this.d3Data.root.data.descendants()
      } else {
        return []
      }
    },
  },

};
</script>

<style lang="scss">
#svg-container {
  width: 100%;
  height: 40vh;
}
.node {
  cursor: pointer;
  vertical-align: middle;
  .is-searched-feature {
    fill: lightcoral;
  }
  rect {
    transition: all 0.75s;
    stroke: #888;
    stroke-width: 1px;
  }
  text {
    /* fill: black; */
    font-family: monospace;
    text-anchor: middle;
    user-select: none;
  }
}
.and-group-circle {
  stroke: #888;
  stroke-width: 1.5px;
  opacity: 0;
}
.optional-and-group-circle {
  fill: white;
  opacity: 1;
}
.mandatory-and-group-circle {
  fill: rgb(136, 136, 136);
  opacity: 1;
}
.alt-group {
  fill: white;
  stroke: #888;
  stroke-width: 1.5px;
}
.or-group {
  fill: #888;
  stroke: #888;
  stroke-width: 1.5px;
}
.link {
  fill: none;
  stroke: #888;
  stroke-width: 1.5px;
}
.is-searched-link {
  fill: none;
  stroke: lightcoral;
  stroke-width: 1.5px;
}
.children-count > circle {
  fill: white;
  stroke: #888;
  stroke-width: 1.5px;
}
.pseudo-node {
  cursor: pointer;
  vertical-align: middle;
  > circle {
    fill: white;
    stroke: #888;
    stroke-width: 1.5px;
  }
}
.feature-model-constraints {
  position: absolute;
  background-color: white;
  bottom: 0;
  width: 100%;
  box-shadow: 0 10px 10px #888, 0px -10px 10px #888;
  padding: 2rem;
  min-height: 10%;
  max-height: 20%;
  overflow: scroll;
}
polygon {
  stroke: #888;
}
.children-count-text {
  fill: black !important;
}
.blackText {
  fill: black !important;
}
.whiteText {
  fill: white !important;
}
.v-input.expanding-search {
  transition: max-width 0.5s;
  float: right;
  .v-icon {
    cursor: pointer;
  }
  &.closed {
    max-width: 45px;
    & .v-input__slot {
      &::before {
        border: 0px;
      }
    }
  }
}
</style>
