import * as commandFactory from "@/classes/Commands/CommandFactory";
import * as update from '@/services/FeatureModel/update.service.js';
import beautify from "xml-beautifier";
import {xmlToJson} from "@/services/xmlTranspiler.service";
import {Peer} from "peerjs";

export default class CollaborationManager {
    constructor(featureModelCommandManager, constraintCommandManager, featureModel) {
        this.featureModelCommandManager = featureModelCommandManager;
        this.featureModelCommandManager.collaborationManager = this;
        this.featureModelCommandManager.type = 'featureModel';

        this.constraintCommandManager = constraintCommandManager;
        this.constraintCommandManager.collaborationManager = this;
        this.constraintCommandManager.type = 'constraint';

        this.connections = [];
        this.options = {host: "localhost", port: 9000, path: "/myapp", pingInterval: 5000, debug: 0};

        this.collaborationKey = null;
        this.featureModel = featureModel;
    }

    createCollaboration() {
        this.collaborationKey = this.generateUUID();

        const peer = new Peer(this.collaborationKey, this.options);
        peer.on('open', () => {
            this.showSnackbarMessage(`Created collaboration session on ${this.collaborationKey}\nLink copied`);

            peer.on('connection', conn => {
                this.connections.push(conn);
                conn.on('data', data => this.receive(conn, data.type, data.action, data.data));
                conn.on('open', () => {
                    this.sendInitData(conn);
                    this.showSnackbarMessage('New client joined to collaboration session');
                });
                conn.on('close', () => {
                    this.showSnackbarMessage('Client disconnected', 'info');
                    this.connections = this.connections.filter(c => c !== conn);
                });
            });

        });
        return this.collaborationKey;
    }

    joinCollaboration(key) {
        this.collaborationKey = key;

        let peer = new Peer(this.options);
        peer.on('open', () => {
            const conn = peer.connect(key);
            conn.on('open', () => {
                this.showSnackbarMessage('Joined collaboration session');
                this.connections.push(conn);
                conn.on('data', data => this.receive(conn, data.type, data.action, data.data));
                conn.on('close', () => {
                    this.showSnackbarMessage('Lost connection to collaboration session', 'error');
                    this.connections = this.connections.filter(c => c !== conn);
                    this.featureModel.$router.push('/');
                });
            });
        });
    }

    receive(sender, type, action, data) {
        if (type === 'initialize') {
            this.initData(data);
        } else if (type === 'close') {
            this.showSnackbarMessage('Host has closed collaboration session', 'info');
            this.featureModel.$router.push('/');
        } else {
            this.sendExcluded(sender, type, action, data);
            let commandManager;
            if (type === 'constraint') {
                commandManager = this.constraintCommandManager;
            } else if (type === 'featureModel') {
                commandManager = this.featureModelCommandManager;
            } else {
                console.error('Unknown command');
                return;
            }

            if (action === 'execute') {
                const command = commandFactory.create(this.featureModel.data.rootNode, this.featureModel.data.constraints, type, data);
                commandManager.execute(command, false);
            } else if (action === 'undo') {
                commandManager.undo(false);
            } else if (action === 'redo') {
                commandManager.redo(false);
            } else {
                console.error('Unknown command');
                return;
            }

            if (type === 'featureModel') {
                update.updateSvg(this.featureModelCommandManager.d3Data);
            }
        }
    }

    send(type, action, data) {
        const toSend = {
            type: type,
            action: action,
            data: data,
        };

        this.connections.forEach(conn => conn.send(toSend));
    }

    sendExcluded(excluded, type, action, data) {
        const toSend = {
            type: type,
            action: action,
            data: data,
        };

        this.connections.filter(conn => conn !== excluded).forEach(conn => conn.send(toSend));
    }

    sendInitData(connection) {
        connection.send({
            type: "initialize",
            action: null,
            data: {
                xml: this.featureModel.xml,
                featureModelHistoryCommands: this.featureModelCommandManager.historyCommands.map(command => ({type: 'featureModel', action: null, data: command.createDTO()})),
                featureModelFutureCommands: this.featureModelCommandManager.futureCommands.map(command => ({type: 'featureModel', action: null, data: command.createDTO()})),
                constraintHistoryCommands: this.constraintCommandManager.historyCommands.map(command => ({type: 'constraint', action: null, data: command.createDTO()})),
                constraintFutureCommands: this.constraintCommandManager.futureCommands.map(command => ({type: 'constraint', action: null, data: command.createDTO()})),
            },
        });
    }

    initData(data) {
        xmlToJson(beautify(data.xml), this.featureModel.data);
        this.featureModelCommandManager.remoteCommands = {
            historyCommands: data.featureModelHistoryCommands,
            futureCommands: data.featureModelFutureCommands,
        };
        this.constraintCommandManager.remoteCommands = {
            historyCommands: data.constraintHistoryCommands,
            futureCommands: data.constraintFutureCommands,
        };
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

        return uuid + (Array.from(uuid).reduce((last, curr) => parseInt(last, 16) + parseInt(curr, 16)) % 16).toString(16);
    }

    showSnackbarMessage(message, variant='success') {
        this.featureModel.$store.commit("updateSnackbar", {
            message: message,
            variant: variant,
            timeout: 5000,
            show: true,
        });
    }
}