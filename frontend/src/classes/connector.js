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
        peer.on('open', id => {
            console.log('Created new collaboration-session with key', id);
            peer.on('connection', conn => {
                this.connection = conn;
                console.log('New client connected', conn.peer);
                conn.on('data', data => this.collaborationManager.receive(data.type, data.action, data.data));
                conn.on('open', () => this.collaborationManager.sendInitData());
            });
        });
    }

    connect(key) {
        let peer = new Peer(this.options);

        peer.on('open', id => {
            console.log('id', id);
            const conn = peer.connect(key);
            conn.on('open', () => {
                console.log('Successfully connected to collaboration-session with key: ', key);
                this.connection = conn;
                conn.on('data', data => this.collaborationManager.receive(data.type, data.action, data.data));
            });
        });
    }

    send(data) {
        this.connection.send(data);
    }
}