import {Peer} from "peerjs";

export default class Connector {
    constructor(id) {
        this.featureModelId = id;
        this.hostname = 'host';
        this.connection = null;
        this.options = {
            host: "localhost", port: 9000, path: "/myapp", pingInterval: 5000, debug: 0,
        };
    }

    connect() {
        // Try to connect as host
        const peer = new Peer(this.hostname, this.options);
        peer.on('open', id => {
            console.log('id', id);
            peer.on('connection', conn => {
                this.connection = conn;
                console.log('New client connected', conn.peer);
                conn.on('data', data => this.onReceive(data));
            });
        });

        // Connect as client
        peer.on('error', () => {
            let peer = new Peer(this.options);

            peer.on('open', id => {
                console.log('id', id);
                const conn = peer.connect(this.hostname);
                conn.on('open', () => {
                    this.connection = conn;
                    conn.on('data', data => this.onReceive(data));
                });
            });
        });
    }

    onReceive(data) {
        console.log(data);
    }

    sendData(data) {
        this.connection.send(data);
    }
}