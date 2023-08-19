import {Command} from "@/classes/Commands/Command";
import * as init from '@/services/FeatureModel/init.service.js';

export class SliceCommand extends Command {
    constructor(oldFM, newFM) {
        super();
        this.featureModelComponent = oldFM;
        this.d3Data = this.featureModelComponent.$refs.featureModelTree.d3Data;

        // Constraint command manager
        this.constraintCommandManager = this.featureModelComponent.constraintCommandManager;
        this.historyCommands = this.constraintCommandManager.historyCommands;
        this.futureCommands = this.constraintCommandManager.futureCommands;

        this.oldRoot = this.d3Data.root;

        this.oldData = this.featureModelComponent.data;
        this.newData = newFM;
    }

    execute() {
        this.featureModelComponent.data = this.newData;
        init.initData(this.d3Data, this.newData.rootNode);
    }


    undo() {
        this.featureModelComponent.data = this.oldData;
        this.d3Data.root = this.oldRoot;
    }

    createDTO() {
        return {
            commandType: 'slice-model',
        };
    }
}
