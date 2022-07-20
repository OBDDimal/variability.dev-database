import {Command} from "@/classes/Commands/Command";
import * as d3 from "d3";

export class AddCommand extends Command {
    constructor(d3Data, dstParent, dstIndex, newFeatureNode) {
        super(d3Data);
        this.dstParent = dstParent;
        this.dstIndex = dstIndex;
        this.newFeatureNode = newFeatureNode;
    }

    execute() {
        if (this.d3Data.d3ParentOfAddNode.data.isLeaf()) {
            this.d3Data.d3ParentOfAddNode.allChildren = [];
        }

        this.d3Data.d3ParentOfAddNode.data.uncollapse();

        this.d3Data.d3ParentOfAddNode.data.unhideChildren();

        this.newFeatureNode.parent.children.push(this.newFeatureNode);

        const d3NewNode = d3.hierarchy(this.newFeatureNode);
        d3NewNode.parent = this.d3Data.d3ParentOfAddNode;
        this.d3Data.d3ParentOfAddNode.allChildren.push(d3NewNode);
        this.d3Data.d3ParentOfAddNode.children = this.d3Data.d3ParentOfAddNode.allChildren;

        // ADD to allNodes
        this.d3Data.allNodes.push(d3NewNode);

        this.d3Data.d3ParentOfAddNode = undefined;
    }

    undo() {

    }
}