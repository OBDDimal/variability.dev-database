import {Command} from "@/classes/Commands/Command";
import * as init from '@/services/FeatureModel/init.service.js';
import {FeatureNode} from "@/classes/FeatureNode";

export class NewEmptyModelCommand extends Command {
    constructor(featureModelComponent) {
        super();
        this.featureModelComponent = featureModelComponent;
        this.d3Data = this.featureModelComponent.$refs.featureModelTree.d3Data;

        // Constraint command manager
        this.constraintCommandManager = this.featureModelComponent.constraintCommandManager;
        this.historyCommands = this.constraintCommandManager.historyCommands;
        this.futureCommands = this.constraintCommandManager.futureCommands;

        this.oldRoot = this.d3Data.root;

        this.oldData = this.featureModelComponent.data;
        this.newData = {
            featureMap: [],
            constraints: [],
            properties: [],
            calculations: undefined,
            comments: [],
            featureOrder: undefined,
            rootNode: new FeatureNode(null, 'Root', 'and', true, false),
        };
    }

    execute() {
        // Constraint command manager
        this.constraintCommandManager.historyCommands = [];
        this.constraintCommandManager.futureCommands = [];

        this.featureModelComponent.data = this.newData;
        init.initData(this.d3Data, this.newData.rootNode);
    }


    undo() {
        // Constraint command manager
        this.constraintCommandManager.historyCommands = this.historyCommands;
        this.constraintCommandManager.futureCommands = this.futureCommands;

        this.featureModelComponent.data = this.oldData;
        this.d3Data.root = this.oldRoot;
    }

    createDTO() {
        return {
            commandType: 'new-empty-model',
        };
    }
}
