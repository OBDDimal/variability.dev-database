import {AddCommand} from "@/classes/Commands/FeatureModel/AddCommand";
import {EditCommand} from "@/classes/Commands/FeatureModel/EditCommand";
import {SwapCommand} from "@/classes/Commands/FeatureModel/SwapCommand";

export function create(rootNode, data) {
    if (data.commandType === 'add') {
        const dstParent = rootNode.descendants().find(node => node.name === data.dstParentName);
        return new AddCommand(dstParent, data.dstIndex, data.data);
    } else if (data.commandType === 'edit') {
        const node = rootNode.descendants().find(node => node.name === data.nodeName);
        return new EditCommand(node, data.newData);
    } else if (data.commandType === 'swap') {
        const node = rootNode.descendants().find(node => node.name === data.nodeName);
        const dstParent = rootNode.descendants().find(node => node.name === data.dstParentName);
        return new SwapCommand(node, dstParent, data.dstIndex);
    }
}