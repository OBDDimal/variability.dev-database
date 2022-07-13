import * as d3 from 'd3';
import * as CONSTANTS from '@/classes/constants';
import * as updateSvg from "@/services/FeatureModel/updateSvg.service.js";

export function onChangeColoring(allD3Nodes, coloringIndex) {
      switch (coloringIndex) {
        case 0:
          colorNodes(allD3Nodes, countNodes);
          break;
        case 1:
          colorNodes(allD3Nodes, countDirectChildren);
          break;
        case 2:
          colorNodes(allD3Nodes, countTotalChildren);
          break;
        default:
          resetColorNodes(allD3Nodes);
          break;
      }
    }

function resetColorNodes(allD3Nodes) {
      for (const d3Node of allD3Nodes) {
        d3Node.data.color = d3Node.data.isAbstract ? CONSTANTS.NODE_ABSTRACT_COLOR : CONSTANTS.NODE_COLOR;
      }
      updateSvg.updateSvg();
    }

function colorNodes(allD3Nodes, coloringFunction) {
      const [count, max] = coloringFunction(allD3Nodes); // Must return {"nodeName": integer}
      const colors = d3.scaleLinear().domain(d3.ticks(1, max, CONSTANTS.COLORING_MAP.length)).range(CONSTANTS.COLORING_MAP);

      for (const d3Node of allD3Nodes) {
        if (count[d3Node.data.name] !== undefined && !d3Node.data.isAbstract) {
          d3Node.data.color = colors(count[d3Node.data.name]);
        }
      }

      updateSvg.updateSvg();
    }

    /**
     * Counts all nodes
     * @returns [{"nodeName": integer}, maxAmount]
     */
function countNodes(allD3Nodes) {
      let count = {};
      let max = 0;
      console.log('test', allD3Nodes);
      for (const d3Node of allD3Nodes) {
        if (count[d3Node.data.name]) {
          count[d3Node.data.name] += 1;
          max = max < count[d3Node.data.name] ? count[d3Node.data.name] : max;
        } else {
          count[d3Node.data.name] = 1;
          max = max < count[d3Node.data.name] ? count[d3Node.data.name] : max;
        }
      }

      return [count, max];
    }

function countDirectChildren(allD3Nodes) {
      let count = {};
      let max = 0;

      for (const d3Node of allD3Nodes) {
        count[d3Node.data.name] = d3Node.data.childrenCount();
        max = max < count[d3Node.data.name] ? count[d3Node.data.name] : max;
      }

      return [count, max];
    }

function countTotalChildren(allD3Nodes) {
      let count = {};
      let max = 0;

      for (const d3Node of allD3Nodes) {
        count[d3Node.data.name] = d3Node.data.totalSubnodesCount();
        max = max < count[d3Node.data.name] ? count[d3Node.data.name] : max;
      }

      return [count, max];
    }