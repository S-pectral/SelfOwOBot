import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { Socket } from 'net';
import { BotClient } from '../bot/client.js';

export class WSServer {
    private wss: WebSocketServer;
    private clients: BotClient[];

    constructor(clients: BotClient[]) {
        WSServer.instance = this;
        this.clients = clients;
        // Create WSS with noServer option to handle upgrades manually from express server
        this.wss = new WebSocketServer({ noServer: true });

        this.wss.on('connection', (ws: WebSocket) => {
            ws.send(JSON.stringify({ type: 'INIT', message: 'Connected to Log Stream' }));
        });
    }

    public handleUpgrade(request: IncomingMessage, socket: Socket, head: Buffer) {
        this.wss.handleUpgrade(request, socket, head, (ws) => {
            this.wss.emit('connection', ws, request);
        });
    }

    public getClients(): BotClient[] {
        return this.clients;
    }

    public broadcast(data: any) {
        this.wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    }
}

export let wsServerInstance: WSServer | null = null;

// Helper global for the logger to use, populated when WSServer is instantiated
// But wait, index.ts creates `new WSServer(clients)`.
// We need a way to set the global instance so `broadcastLog` can use it.

const originalProto = WSServer.prototype;
const originalConstructor = WSServer;

// We'll wrap the constructor or just set the global in the constructor:
// Better yet, let's just assign it in the constructor. (Not ideal for strict OOP but practical here)

export const broadcastLog = (log: any) => {
    // We need access to the instance.
    // Index.ts creates the instance.
    // We can rely on a static reference or singleton pattern.
    if (WSServer.instance) {
        WSServer.instance.broadcast({ type: 'LOG', data: log });
    }
};

// Add static instance
export namespace WSServer {
    export let instance: WSServer | null = null;
}

