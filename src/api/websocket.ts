import { WebSocketServer, WebSocket } from 'ws';
import { BotClient } from '../bot/client.js';
import { logger } from '../bot/utils/logger.js';
import { GlobalConfig } from '../config/config.js';

interface WebSocketMessage {
    action: string;
    type?: string;
    [key: string]: any;
}

export class WSServer {
    private wss: WebSocketServer;
    private clients: BotClient[];
    private wsClients: WebSocket[] = [];

    public getClients() {
        return this.clients;
    }

    constructor(clients: BotClient[]) {
        this.clients = clients;
        this.wss = new WebSocketServer({ noServer: true });

        this.wss.on('connection', (ws) => {
            this.wsClients.push(ws);
            this.sendInitialData(ws);

            ws.on('message', (message) => {
                try {
                    this.handleMessage(ws, JSON.parse(message.toString()));
                } catch (e) {
                    logger.error("Failed to parse WebSocket message");
                }
            });

            ws.on('close', () => {
                this.wsClients = this.wsClients.filter(client => client !== ws);
            });
        });

        // Broadcast stats every second
        setInterval(() => this.broadcastLoop(), 1000);
    }

    private broadcastLoop() {
        if (this.wsClients.length === 0) return;

        this.clients.forEach((client, index) => {
            if (client.isReadyFlag) {
                const type = index === 0 ? "Main" : "Extra";
                this.broadcast({
                    action: 'update',
                    type: 'botstatus', // Reusing this type as it triggers update in ws.js
                    status: client.paused ? 'Paused' : 'Running', // This might overwrite manual status if not careful, but ok for now
                    global: {
                        type: type,
                        paused: client.paused,
                        captchadetected: client.captchaDetected,
                        total: client.total,
                        gamble: { slot: 0, coinflip: 0, cowoncywon: 0 },
                        quest: { title: "No active quest", reward: "", progress: "" }
                    }
                });
            }
        });
    }

    public handleUpgrade(request: any, socket: any, head: any) {
        this.wss.handleUpgrade(request, socket, head, (ws) => {
            this.wss.emit('connection', ws, request);
        });
    }

    private sendInitialData(ws: WebSocket) {
        // Send uptime
        ws.send(JSON.stringify({
            action: 'connectinfo',
            type: 'uptime',
            uptime: process.uptime()
        }));

        // Send client data
        this.clients.forEach((client, index) => {
            const type = index === 0 ? "Main" : "Extra";

            if (client.isReadyFlag && client.user) {
                ws.send(JSON.stringify({
                    action: 'connectinfo',
                    type: 'alldata',
                    global: {
                        type: type, // Critical: Missing in previous version
                        paused: client.paused,
                        captchadetected: client.captchaDetected,
                        total: { // specific stats needed by frontend
                            hunt: 0, battle: 0, pray: 0, curse: 0, huntbot: 0,
                            vote: 0, giveaway: 0, captcha: 0, solvedcaptcha: 0
                        },
                        gamble: {
                            slot: 0, coinflip: 0, cowoncywon: 0
                        },
                        quest: {
                            title: "No active quest found",
                            reward: "",
                            progress: ""
                        }
                    },
                    client: {
                        username: client.user.username,
                        globalName: client.user.username, // using username as fallback
                        id: client.user.id,
                        discriminator: client.user.discriminator,
                        // ... other user props if needed
                    }
                }));
            }
        });
    }

    private handleMessage(ws: WebSocket, data: WebSocketMessage) {
        const mainClient = this.clients[0];

        switch (data.action) {
            case 'start':
                if (mainClient) {
                    mainClient.paused = false;
                    this.broadcastStatus(mainClient, 'Running');
                }
                break;
            case 'pause':
                if (mainClient) {
                    mainClient.paused = true;
                    this.broadcastStatus(mainClient, 'Paused');
                }
                break;
            case 'resume':
                if (mainClient) {
                    mainClient.paused = false;
                    this.broadcastStatus(mainClient, 'Running');
                }
                break;
        }
    }

    public broadcastStatus(client: BotClient, status: string) {
        const type = client === this.clients[0] ? "Main" : "Extra";
        this.broadcast({
            action: 'update',
            type: 'botstatus',
            status: status,
            global: { type: type, paused: client.paused, captchadetected: client.captchaDetected }
        });
    }

    private broadcast(data: any) {
        this.wsClients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    }
}
