import Connector from "@/classes/connector";
import * as commandFactory from "@/classes/Commands/CommandFactory";
import * as update from '@/services/FeatureModel/update.service.js';

export default class CollaborationManager {
    constructor(featureModelId, featureModelCommandManager, constraintCommandManager) {
        this.featureModelId = featureModelId;

        this.featureModelCommandManager = featureModelCommandManager;
        this.featureModelCommandManager.collaborationManager = this;
        this.featureModelCommandManager.type = 'featureModel';

        this.constraintCommandManager = constraintCommandManager;
        this.constraintCommandManager.collaborationManager = this;
        this.constraintCommandManager.type = 'constraint';

        this.connection = new Connector(this.featureModelId, this);
        this.connection.connect();

        this.rootNode = null;
    }

    receive(type, action, data) {
        let commandManager;
        if (type === 'constraint') {
            commandManager = this.constraintCommandManager;
        } else {
            commandManager = this.featureModelCommandManager;
        }

        if (action === 'execute') {
            const command = commandFactory.create(this.rootNode, data);
            commandManager.execute(command, false);
        } else if (action === 'undo') {
            commandManager.undo(false);
        } else if (action === 'redo') {
            commandManager.redo(false);
        }

        if (type === 'featureModel') {
            update.updateSvg(this.featureModelCommandManager.d3Data);
        }
    }

    send(type, action, data) {
        if (this.connection) {
            const toSend = {
                type: type,
                action: action,
                data: data,
            }

            this.connection.sendData(toSend);
        }
    }
}