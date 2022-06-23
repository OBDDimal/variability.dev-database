import Constraint from "@/classes/constraint";
import { FeatureNode, GroupType, PseudoNode } from "@/classes/featureNode";

const littleModel = `
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<featureModel>
    <properties>
        <graphics key="legendautolayout" value="true"/>
        <graphics key="showshortnames" value="false"/>
        <graphics key="layout" value="horizontal"/>
        <graphics key="showcollapsedconstraints" value="true"/>
        <graphics key="legendhidden" value="false"/>
        <graphics key="layoutalgorithm" value="1"/>
    </properties>
    <struct>
        <and abstract="true" mandatory="true" name="NPC">
            <alt mandatory="true" name="Mood">
                <feature name="Friendly"/>
                <feature name="Enemy"/>
            </alt>
            <or mandatory="true" name="Type">
                <feature name="Farmer"/>
                <feature name="Villager"/>
                <feature name="Hauling"/>
                <feature name="Warrior"/>
            </or>
            <and abstract="true" name="HarvestSkills">
                <feature mandatory="true" name="Reaping"/>
                <feature mandatory="true" name="Hauling"/>
                <feature mandatory="true" name="Threshing"/>
            </and>
        </and>
    </struct>
    <constraints>
        <rule>
            <imp>
                <conj>
                    <disj>
                        <var>Farmer</var>
                        <var>Villager</var>
                    </disj>
                    <not>
                        <var>Warrior</var>
                    </not>
                </conj>
                <var>Friendly</var>
            </imp>
        </rule>
        <rule>
            <imp>
                <var>Farmer</var>
                <var>HarvestSkills</var>
            </imp>
        </rule>
    </constraints>
</featureModel>`;

const currentModel = littleModel; // Choose between littleModel and hugeModel.
let featureMap: { [key: string]: FeatureNode } = {};

function xmlToJson():
  | { rootNode: FeatureNode; constraints: Constraint[] }
  | { rootNode: undefined; constraints: undefined } {
  const start = performance.now();

  // To remove the <?xml...?> line
  let m = currentModel.split("\n").splice(1).join("\n");

  const parser = new DOMParser();
  const xmlDocument = parser.parseFromString(m, "text/xml");

  const struct = xmlDocument.querySelector("struct") as Element;
  const constraints = xmlDocument.querySelector("constraints") as Element;

  if (struct && constraints) {
    const featuresToReturn = getChildrenOfFeature(struct);
    const constraintsToReturn = getConstraints(constraints);
    console.log("Parsertime", performance.now() - start);
    return {
      rootNode: featuresToReturn[0],
      constraints: constraintsToReturn,
    };
  } else {
    return {
      rootNode: undefined,
      constraints: undefined,
    };
  }
}

function getChildrenOfFeature(struct: Element, parent?: FeatureNode) {
  let toReturn = [];

  for (const child of struct.children) {
    // To remove #text nodes, as they don't have a tagName
    if (child.tagName) {
      let toAppend = new FeatureNode(
        child.getAttribute("name") ?? "Unknown name",
        child.tagName as GroupType,
        child.getAttribute("mandatory") === "true",
        child.getAttribute("abstract") === "true",
        parent
      );
      toAppend.children = getChildrenOfFeature(child as Element, toAppend);

      featureMap[toAppend.name] = toAppend;
      toReturn.push(toAppend);
    }
  }

  return toReturn;
}

function getConstraints(constraints: Element) {
  let toReturn = [];

  for (const rule of constraints.children) {
    // To remove #text nodes, as they don't have a tagName
    if (rule.tagName) {
      const constraint = new Constraint(
        [...rule.children].filter((e) => e.tagName)[0],
        featureMap
      );
      toReturn.push(constraint);
    }
  }
  return toReturn;
}

export const { rootNode: featureModelRawData, constraints: constraints } =
  xmlToJson();

export const rootNode: FeatureNode = featureModelRawData as FeatureNode;
