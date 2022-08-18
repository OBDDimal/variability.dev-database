import Connector from "@/classes/connector";
import * as commandFactory from "@/classes/Commands/CommandFactory";
import * as update from '@/services/FeatureModel/update.service.js';
import beautify from "xml-beautifier";
import {jsonToXML, xmlToJson} from "@/services/xmlTranspiler.service";

export default class CollaborationManager {
    constructor(featureModelCommandManager, constraintCommandManager, featureModelData) {
        this.featureModelCommandManager = featureModelCommandManager;
        this.featureModelCommandManager.collaborationManager = this;
        this.featureModelCommandManager.type = 'featureModel';

        this.constraintCommandManager = constraintCommandManager;
        this.constraintCommandManager.collaborationManager = this;
        this.constraintCommandManager.type = 'constraint';

        this.connection = new Connector(this);

        this.rootNode = null;
        this.allConstraints = null;
        this.collaborationKey = null;
        this.featureModelData = featureModelData;
    }

    createCollaboration() {
        this.collaborationKey = this.generateUUID();

        this.connection.create(this.collaborationKey, this.receive, () => {
            this.connection.send({
                type: "initialize",
                action: null,
                data: jsonToXML(this.featureModelData),
            });
        });
        return this.collaborationKey;
    }

    joinCollaboration(key) {
        this.collaborationKey = key;
        this.connection.connect(this.collaborationKey, this.receive);
    }

    receive(type, action, data) {
        console.log('init');
        if (type === 'initialize') {
            console.log(data);
            const formattedJson = beautify(data);
            xmlToJson(formattedJson, this.featureModelData)
        } else {
            let commandManager;
            if (type === 'constraint') {
                commandManager = this.constraintCommandManager;
            } else {
                commandManager = this.featureModelCommandManager;
            }

            if (action === 'execute') {
                const command = commandFactory.create(this.rootNode, this.allConstraints, type, data);
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
    }

    send(type, action, data) {
        if (this.connection) {
            const toSend = {
                type: type,
                action: action,
                data: data,
            }

            this.connection.send(toSend);
        }
    }

    generateUUID() {
        let
            d = new Date().getTime(),
            d2 = (performance && performance.now && (performance.now() * 1000)) || 0;
        const uuid = 'xxxxxxxx'.replace(/[xy]/g, c => {
            let r = Math.random() * 16;
            if (d > 0) {
                r = (d + r) % 16 | 0;
                d = Math.floor(d / 16);
            } else {
                r = (d2 + r) % 16 | 0;
                d2 = Math.floor(d2 / 16);
            }
            return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });

        return uuid + (Array.from(uuid).reduce((last, curr) => parseInt(last, 16) + parseInt(curr, 16)) % 16).toString(16)
    }
}