import Connector from "@/classes/connector";

export default class CollaborationManager {
    constructor(featureModelId, featureModelCommandManager, constraintCommandManager) {
        this.featureModelId = featureModelId;

        this.featureModelCommandManager = featureModelCommandManager;
        this.featureModelCommandManager.collaborationManager = this;
        this.featureModelCommandManager.type = 'featureModel';

        this.constraintCommandManager = constraintCommandManager;
        this.constraintCommandManager.collaborationManager = this;
        this.constraintCommandManager.type = 'constraint';

        this.connection = new Connector(this.featureModelId);
        this.connection.connect();
    }

    receive(type, action, data) {
        console.log('received', type, action, data);
        let commandManager;
        if (type === 'constraint') {
            commandManager = this.constraintCommandManager;
        } else {
            commandManager = this.featureModelCommandManager;
        }

        if (action === 'execute') {
            const command = null;
            commandManager.execute(command);
        } else if (action === 'undo') {
            commandManager.undo();
        } else if (action === 'redo') {
            commandManager.redo();
        }
    }

    send(type, action) {
        if (this.connection) {
            console.log('send', type, action);
            const toSend = {
                type: type,
                action: action,
                data: null,
            }

            this.connection.sendData(toSend);
        }
    }
}