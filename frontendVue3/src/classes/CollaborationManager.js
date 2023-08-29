import * as commandFactory from "@/classes/Commands/CommandFactory";
import * as update from '@/services/FeatureModel/update.service.js';
import beautify from "xml-beautifier";
import {xmlToJson} from "@/services/xmlTranspiler.service";
import {Peer} from "peerjs";
import {animals, colors, uniqueNamesGenerator} from 'unique-names-generator';
import { useAppStore } from '@/store/app';

export default class CollaborationManager {
    constructor(featureModelCommandManager, constraintCommandManager, featureModel) {
        this.featureModelCommandManager = featureModelCommandManager;
        this.featureModelCommandManager.collaborationManager = this;
        this.featureModelCommandManager.type = 'featureModel';

        this.constraintCommandManager = constraintCommandManager;
        this.constraintCommandManager.collaborationManager = this;
        this.constraintCommandManager.type = 'constraint';
        this.blockEditRequests = false;

        this.connections = [];
        this.options = {
            host: import.meta.env.VITE_APP_DOMAIN_WEBSOCKET,
            port: import.meta.env.VITE_APP_DOMAIN_WEBSOCKET_PORT,
            path: "/myapp",
            pingInterval: 5000,
            debug: 0,
        };

        this.collaborationKey = null;
        this.featureModel = featureModel;

        this.isHost = false;
        this.isClient = false;
        this.claimerId = null;
        this.peer = null;
        this.name = uniqueNamesGenerator({
            dictionaries: [colors, animals],
            style: 'capital',
            separator: " ",
        });

        this.noConfirm = false;

        // List of all clients inclusive host with { id, name }
        this.members = [];
        this.editorId = null;
        this.appStore = useAppStore();
    }

    createCollaboration() {
        this.collaborationKey = this.generateUUID();
        this.editorId = this.collaborationKey;

        this.peer = new Peer(this.collaborationKey, this.options);
        this.peer.on('open', () => {
            this.isHost = true;
            this.isClient = false;
            this.featureModel.editRights = true;
            this.featureModel.collaborationStatus = true;
            this.name = 'Host';
            this.editorId = this.peer._id;
            this.showSnackbarMessage(`Created collaboration session and copied invitation link.`);

            this.peer.on('connection', conn => {
                this.connections.push(conn);
                conn.on('data', data => this.receive(conn, data.type, data.action, data.data));
                conn.on('open', () => {
                    this.sendInitData(conn);
                    this.showSnackbarMessage('New client joined to collaboration session');
                });
                conn.on('close', () => {
                    this.showSnackbarMessage('Client disconnected', 'info');
                    conn.close();
                    this.connections = this.connections.filter(c => c !== conn);
                    this.featureModel.editRights = !this.connections.find(c => c.editRights);

                    this.members = this.members.filter(m => m.id !== conn.peer);
                    this.featureModel.collaborationReloadKey++;
                    if (this.editorId === conn.peer) {
                        this.sendMemberData(this.collaborationKey);
                    } else {
                        this.sendMemberData();
                    }
                });
            });

        });
        return this.collaborationKey;
    }

    joinCollaboration(key) {
        this.collaborationKey = key;

        this.peer = new Peer(this.options);
        this.peer.on('open', () => {
            const conn = this.peer.connect(key);
            conn.on('open', () => {
                this.isHost = false;
                this.isClient = true;
                this.featureModel.editRights = false;
                this.featureModel.collaborationStatus = true;

                this.showSnackbarMessage('Joined collaboration session');
                this.connections.push(conn);

                this.sendName();

                conn.on('data', data => this.receive(conn, data.type, data.action, data.data));
                conn.on('close', () => {
                    this.connections = this.connections.filter(c => c !== conn);
                    this.receiveClose();
                });
            });

        });
        this.peer.on('error', () => {
            this.showSnackbarMessage('Cannot connect to collaboration session', 'error');
        });
    }

    closeCollaboration() {
        this.members = [];
        this.connections.forEach(conn => conn.close());
        this.connections = [];
        this.collaborationKey = null;
        this.featureModel.editRights = true;
        this.claimerId = null;
        this.editorId = null;
        if (this.isHost) {
            this.peer.destroy();
        }
        this.isHost = false;
        this.isClient = false;
        this.peer = null;
        this.featureModel.collaborationStatus = false;
    }

    receive(sender, type, action, data) {
        if (type === 'initialize') {
            this.receiveInitialize(data);
        } else if (type === 'close') {
            this.receiveClose();
        } else if (type === 'claimEditRights') {
            this.receiveClaimEditRights(sender);
        } else if (type === 'name') {
            this.receiveName(action, data);
        } else if (type === 'members') {
            this.receiveMembers(data);
        } else {
            this.receiveCommand(sender, type, action, data);
        }
    }

    receiveName(id, name) {
        this.members = this.members.filter(m => m.id !== id);
        this.members.push({id: id, name: name});

        this.sendMemberData();
    }

    receiveMembers(data) {
        this.blockEditRequests = data.blockEditRequests;
        this.editorId = data.editorId;
        this.featureModel.editRights = this.peer._id === data.editorId;
        this.members = data.members.filter(m => m.id !== this.peer._id);
        this.featureModel.collaborationReloadKey++;
    }

    receiveInitialize(data) {
        const xml = beautify(data.xml);
        this.featureModel.xml = xml;
        xmlToJson(beautify(xml), this.featureModel.data);
        this.featureModelCommandManager.remoteCommands = {
            historyCommands: data.featureModelHistoryCommands,
            futureCommands: data.featureModelFutureCommands,
        };
        this.constraintCommandManager.remoteCommands = {
            historyCommands: data.constraintHistoryCommands,
            futureCommands: data.constraintFutureCommands,
        };
        this.constraintCommandManager.executeRemoteCommands(this.featureModel.data.rootNode, this.featureModel.data.constraints)
    }

    receiveClose() {
        if (this.isClient) {
            this.showSnackbarMessage('Host has closed collaboration session', 'info');
            this.noConfirm = true;
            this.featureModel.showContinueEditingDialog = true;
        }
    }

    receiveClaimEditRights(sender) {
        if (!this.featureModel.showClaimDialog && !this.blockEditRequests) {
            this.featureModel.showClaimDialog = true;
            this.claimerId = sender.peer;
        }
    }

    receiveCommand(sender, type, action, data) {
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
            const command = commandFactory.create(this.featureModel.data.rootNode, this.featureModel.data.constraints, type, data, this.featureModel);
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

    sendMemberData(newEditorId = undefined) {
        if (newEditorId) {
            this.editorId = newEditorId;
            this.featureModel.editRights = this.collaborationKey === this.editorId;
        }

        const members = [...this.members, {id: this.collaborationKey, name: this.name}];
        this.send('members', null, {
            members: members,
            editorId: this.editorId,
            blockEditRequests: this.blockEditRequests,
        });
        this.featureModel.collaborationReloadKey++;
    }

    send(type, action = null, data = null) {
        const toSend = {
            type: type,
            action: action,
            data: data,
        };
        this.connections.forEach(conn => conn.send(toSend));
    }

    sendName(name = undefined) {
        if (name) {
            this.name = name;
        }

        // Send own name
        this.send('name', this.peer._id, this.name);
    }

    sendExcluded(excluded, type, action, data) {
        const toSend = {
            type: type,
            action: action,
            data: data,
        };

        this.connections.filter(conn => conn.peer !== excluded.peer).forEach(conn => conn.send(toSend));
    }

    sendInitData(connection) {
        connection.send({
            type: "initialize",
            action: null,
            data: {
                xml: this.featureModel.xml,
                featureModelHistoryCommands: this.featureModelCommandManager.historyCommands.map(command => ({
                    type: 'featureModel',
                    action: null,
                    data: command.createDTO(),
                })),
                featureModelFutureCommands: this.featureModelCommandManager.futureCommands.map(command => ({
                    type: 'featureModel',
                    action: null,
                    data: command.createDTO(),
                })),
                constraintHistoryCommands: this.constraintCommandManager.historyCommands.map(command => ({
                    type: 'constraint',
                    action: null,
                    data: command.createDTO(),
                })),
                constraintFutureCommands: this.constraintCommandManager.futureCommands.map(command => ({
                    type: 'constraint',
                    action: null,
                    data: command.createDTO(),
                })),
            },
        });
    }

    sendClaimEditRightsRequest() {
        this.send('claimEditRights');
    }

    sendClaimEditRightsResponse(response) {
        this.featureModel.showClaimDialog = false;

        if (response) {
            this.sendMemberData(this.claimerId);
            this.showSnackbarMessage('You lost edit rights', 'info');
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

        return uuid + (Array.from(uuid).reduce((last, curr) => parseInt(last, 16) + parseInt(curr, 16)) % 16).toString(16);
    }

    showSnackbarMessage(message, variant = 'success') {
        this.appStore.updateSnackbar(
          message,
          variant,
          5000,
          true,
        );
    }

    getClaimerName() {
        return this.members.find(m => m.id === this.claimerId)?.name;
    }
}
