import {Peer} from "peerjs";

export default class Connector {
    constructor(collaborationManager) {
        this.connection = null;
        this.options = {
            host: "localhost", port: 9000, path: "/myapp", pingInterval: 5000, debug: 0,
        };
        this.collaborationManager = collaborationManager;
    }

    create(key) {
        const peer = new Peer(key, this.options);
        peer.on('open', () => {
            this.collaborationManager.showSnackbarMessage('Created collaboration session on ' + key + '\nLink copied');

            peer.on('connection', conn => {
                this.connection = conn;
                conn.on('data', data => this.collaborationManager.receive(data.type, data.action, data.data));
                conn.on('open', () => {
                    this.collaborationManager.sendInitData();
                    this.collaborationManager.showSnackbarMessage('New client joined to collaboration session');
                });
                conn.on('close', () => this.collaborationManager.showSnackbarMessage('Client disconnected'));
            });

        });
    }

    connect(key) {
        let peer = new Peer(this.options);

        peer.on('open', () => {
            const conn = peer.connect(key);
            conn.on('open', () => {
                this.collaborationManager.showSnackbarMessage('Joined collaboration session');
                this.connection = conn;
                conn.on('data', data => this.collaborationManager.receive(data.type, data.action, data.data));
            });
        });
    }

    send(data) {
        this.connection.send(data);
    }
}