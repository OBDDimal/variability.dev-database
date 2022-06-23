const currentModel = hugeModel; // Choose between littleModel and hugeModel.
let featureMap = {};

function xmlToJson() {
  const start = performance.now();

  // To remove the <?xml...?> line
  let m = currentModel.split("\n").splice(1).join("\n");

  const parser = new DOMParser();
  const xmlDocument = parser.parseFromString(m, "text/xml");

  const struct = xmlDocument.querySelector("struct");
  const constraints = xmlDocument.querySelector("constraints");

  const featuresToReturn = getChildrenOfFeature(struct, null);
  const constraintsToReturn = getConstraints(constraints);
  console.log("Parsertime", performance.now() - start);
  return [featuresToReturn[0], constraintsToReturn];
}

function getChildrenOfFeature(struct, parent, isRoot) {
  let toReturn = [];

  for (child of struct.childNodes) {
    // To remove #text nodes, as they don't have a tagName
    if (child.tagName) {
      let toAppend = new FeatureNode(
        parent,
        child.getAttribute("name"),
        child.tagName,
        child.getAttribute("mandatory") === "true",
        child.getAttribute("abstract") === "true"
      );
      toAppend.children = getChildrenOfFeature(child, toAppend);

      featureMap[toAppend.name] = toAppend;
      toReturn.push(toAppend);
    }
  }

  return toReturn;
}

function getConstraints(constraints) {
  let toReturn = [];

  for (rule of constraints.childNodes) {
    // To remove #text nodes, as they don't have a tagName
    if (rule.tagName) {
      const constraint = new Constraint(
        [...rule.childNodes].filter((e) => e.tagName)[0],
        featureMap
      );
      toReturn.push(constraint);
    }
  }
  return toReturn;
}

const [featureModelRawData, constraints] = xmlToJson();
