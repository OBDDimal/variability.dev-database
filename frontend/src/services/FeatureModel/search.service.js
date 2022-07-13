import levenshtein from 'js-levenshtein';
import * as view from "@/services/FeatureModel/view.service.js";
import * as update from '@/services/FeatureModel/update.service.js';
import * as collapse from "@/services/FeatureModel/collapse.service.js";


export function onChangeSearch(d3Data, searchText) {
      d3Data.allNodes.forEach((d3Node) => {
        d3Node.data.isSearched = false;
      });

      if (searchText !== '') {
        const foundD3Node = findD3Node(d3Data, searchText);
        const paths = foundD3Node.data.getAllNodesToRoot();

        paths.forEach((node) => (node.isSearched = true));
        d3Data.allNodes.forEach((d3Node) => d3Node.data.collapse());

        foundD3Node.data.uncollapse(true);
        collapse.updateCollapsing(d3Data);
        update.updateSvg(d3Data);
        view.focusNode(d3Data, foundD3Node);
      } else {
        update.updateSvg(d3Data);
      }
    }

function findD3Node(d3Data, search) {
      const [, d3Node] = d3Data.allNodes.reduce(([previousDistance, previousD3Node], currentD3Node) => {
        const currentNodeName = currentD3Node.data.name.toLowerCase();
        if (currentNodeName !== search.toLowerCase() && currentNodeName.includes(search.toLowerCase())) {
          return [1, currentD3Node];
        }

        const currentDistance = levenshtein(currentD3Node.data.name.toLowerCase(), search.toLowerCase());

        if (previousDistance <= currentDistance) {
          return [previousDistance, previousD3Node];
        } else {
          return [currentDistance, currentD3Node];
        }
      });

      // TODO: If levenshtein distance is above a good value dont display anything?
      return d3Node;
    }