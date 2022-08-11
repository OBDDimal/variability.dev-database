import {Peer} from "peerjs";

export default class Connector {
    constructor(featureModelId) {
        this.connectionId = "ConnectionHost" + featureModelId;
        this.config = {
            iceServers: [
                {
                    urls: "stun:openrelay.metered.ca:80",
                },
                {
                    urls: "turn:openrelay.metered.ca:80",
                    username: "openrelayproject",
                    credential: "openrelayproject",
                },
                {
                    urls: "turn:openrelay.metered.ca:443",
                    username: "openrelayproject",
                    credential: "openrelayproject",
                },
                {
                    urls: "turn:openrelay.metered.ca:443?transport=tcp",
                    username: "openrelayproject",
                    credential: "openrelayproject",
                },
            ],
        }
        this.options = {host: "localhost", port: 9000, path: "/myapp", config: this.config, debug: 0};
        this.hostPeerInstance = new Peer(this.connectionId, this.options);

        this.isHost = true;
        this.hostPeerInstance.on('error', () => {
            this.isHost = false;
            this.connectorPeerInstance = new Peer("ConnectionReceiver" + featureModelId, this.options)

            this.connectorPeerInstance.on('open', id => {
                console.log('My peer ID is: ' + id);
            });
            this.connectorPeerInstance.on('connection', function (conn) {
                console.log("CONNECTED:" + conn)
            });

            this.connectToPeer();
        });

        this.hostPeerInstance.on('open', id => {
            console.log('My peer ID is: ' + id);
        });

        this.hostPeerInstance.on('connection', conn => {
            this.connectionInstance = conn;// Receive messages
            console.log(this.connectionInstance)
            this.connectionInstance.on('data', function (data) {
                console.log('Received', data);
            });
        });
    }

    connectToPeer() {
        this.connectionInstance = this.connectorPeerInstance.connect(this.connectionId);
        this.connectionInstance.on('open', () => {
            // Receive messages
            this.connectionInstance.on('data', function (data) {
                console.log('Received', data);
            });
        });
    }

    sendData() {
        console.log(this)
        this.connectionInstance.send({
            strings: 'hi!',
            numbers: 150,
            arrays: [1, 2, 3],
            evenBinary: new Blob([1, 2, 3]),
            andMore: {bool: true}
        });
    }

}