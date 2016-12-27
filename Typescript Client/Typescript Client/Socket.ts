﻿/// <reference path="./app.ts"/>

class Socket {
    private socket: WebSocket;
    private packetHandlers: { [packetType: string]: (packetData: string) => void } = {};

    constructor(url: string, callback: () => void) {
        this.socket = new WebSocket(url);
        this.socket.onmessage = this.onmessage.bind(this);
        this.socket.onopen = callback;
    }

    private onmessage(e: MessageEvent): void {
        var packetType = e.data.substr(0, 10).trim();
        var packetData = e.data.substr(10);

        if (this.packetHandlers[packetType] !== undefined) {
            this.packetHandlers[packetType](packetData);
        } else {
            // No handler exists for this packet type
           throw "Unknown packet recieved. Type is: " + packetType;
        }
    }

    public registerHandler(packetType: string, handler: (packetData: string) => void): void {
        this.packetHandlers[packetType] = handler;
    };

    public unregisterHandler = function (packetType: string): void {
        delete this.packetHandlers[packetType];
    };
}