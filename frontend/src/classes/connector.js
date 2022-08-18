import {Peer} from "peerjs";

export default class Connector {
    constructor(collaborationManager) {
        this.connection = null;
        this.options = {
            host: "localhost", port: 9000, path: "/myapp", pingInterval: 5000, debug: 0,
        };
        this.receiver = collaborationManager;
    }

    create(key, receive, init) {
        const peer = new Peer(key, this.options);
        peer.on('open', key => {
            console.log('Created new collaboration-session with key', key);
            peer.on('connection', conn => {
                this.connection = conn;
                console.log('New client connected', conn.peer);
                conn.on('data', data => receive(data.type, data.action, data.data));
                init();
            });
        });
    }

    connect(key, receive) {
        let peer = new Peer(this.options);

        peer.on('open', id => {
            console.log('id', id);
            const conn = peer.connect(key);
            conn.on('open', () => {
                console.log('Successfully connected to collaboration-session with key: ', key);
                this.connection = conn;
                conn.on('data', data => {
                    console.log(data);
                    receive(data.type, data.action, data.data);
                });
            });
        });
    }

    send(data) {
        console.log(data, this);
        this.connection.send(data);
    }
}