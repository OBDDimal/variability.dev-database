import {AddCommand} from "@/classes/Commands/FeatureModel/AddCommand";
import * as constraint_add from "@/classes/Commands/Constraints/AddCommand";
import * as constraint_delete from "@/classes/Commands/Constraints/DeleteCommand";
import * as constraint_edit from "@/classes/Commands/Constraints/EditCommand";
import {EditCommand} from "@/classes/Commands/FeatureModel/EditCommand";
import {SwapCommand} from "@/classes/Commands/FeatureModel/SwapCommand";
import {parse} from "@/services/booleanExpressionParser.service";
import {NewEmptyModelCommand} from "@/classes/Commands/FeatureModel/NewEmptyModelCommand";
import { RemoveCommand } from '@/classes/Commands/FeatureModel/RemoveCommand';
import { SliceCommand } from '@/classes/Commands/FeatureModel/SliceCommand';

export function create(rootNode, allConstraints, type, data, featureModelComponent) {
    if (type === 'featureModel') {
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
        } else if (data.commandType === 'new-empty-model') {
            return new NewEmptyModelCommand(featureModelComponent);
        } else if (data.commandType === 'remove') {
            const node = rootNode.descendants().find(node => node.name === data.nodeName);
            return new RemoveCommand(node, data.dstIndex);
        } else if (data.commandType === 'slice-model') {
            return new SliceCommand(featureModelComponent, data.newXML);
        }
    } else {
        if (data.commandType === 'add') {
            const newConstraintItem = parse(data.constraintItemInfix, rootNode.descendants());
            return new constraint_add.AddCommand(allConstraints, newConstraintItem);
        } else if (data.commandType === 'delete') {
            const constraint = allConstraints[data.index];
            return new constraint_delete.DeleteCommand(allConstraints, constraint);
        } else if (data.commandType === 'edit') {
            const constraint = allConstraints.find(con => con.toStringForEdit() === data.constraintItemInfix);
            const newConstraintItem = parse(data.newConstraintItemInfix, rootNode.descendants());
            return new constraint_edit.EditCommand(allConstraints, constraint, newConstraintItem);
        }
    }
}
