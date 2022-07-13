import levenshtein from 'js-levenshtein';

let allD3Nodes = undefined;

export function onChangeSearch(d3Data, search) {
      allD3Nodes = d3Data.allNodes;
      allD3Nodes.forEach((d3Node) => {
        d3Node.data.isSearched = false;
      });

      if (search !== '') {
        const foundD3Node = findD3Node(search);
        const paths = foundD3Node.data.getAllNodesToRoot();

        paths.forEach((node) => (node.isSearched = true));
        allD3Nodes.forEach((d3Node) => d3Node.data.collapse());

        foundD3Node.data.uncollapse(true);
        this.updateCollapsing();
        this.updateSvg();
        this.focusNode(foundD3Node);
      } else {
        this.updateSvg();
      }
    }

function findD3Node(search) {
      const [, d3Node] = allD3Nodes.reduce(([previousDistance, previousD3Node], currentD3Node) => {
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