import express from 'express';
import http from 'http';
import path from 'path';
import bodyParser from 'body-parser';
import { GlobalConfig, saveConfig } from '../config/config.js'; // Ensure saveConfig is imported


import { WSServer } from './websocket.js';

export class WebServer {
    public app: express.Application;
    public server: http.Server;
    private config: GlobalConfig;
    private wsServer: WSServer;

    constructor(config: GlobalConfig, wsServer: WSServer) {
        this.config = config;
        this.wsServer = wsServer;
        this.app = express();
        this.server = http.createServer(this.app);

        this.setupMiddleware();
        this.setupRoutes();
        this.setupWebSocket();
    }

    private setupMiddleware() {
        this.app.use(bodyParser.json());
        // Serve static files from React build
        this.app.use(express.static(path.join(process.cwd(), 'frontend', 'dist')));
    }

    private setupRoutes() {


        this.app.get('/api/guilds', (req, res) => {
            const index = Number(req.query.index) || 0;
            const client = this.wsServer.getClients()[index];

            if (!client) {
                return res.json([]); // Return empty if client doesn't exist
            }

            if (!client.isReadyFlag) {
                return res.status(503).json({ message: 'Bot not ready' });
            }

            const guilds = client.guilds.cache.map(g => ({
                id: g.id,
                name: g.name,
                icon: g.iconURL(),
                channels: g.channels.cache
                    .filter(c => c.type === 'GUILD_TEXT' || c.type === 'GUILD_NEWS')
                    .map(c => ({ id: c.id, name: c.name, position: c.position }))
                    .sort((a, b) => a.position - b.position)
            })).sort((a, b) => a.name.localeCompare(b.name));

            res.json(guilds);
        });

        this.app.get('/api/get-config', (req, res) => {
            res.json(this.config);
        });

        this.app.get('/api/stats', (req, res) => {
            import('./stats.js').then(stats => {
                res.json(stats.getStats());
            });
        });

        this.app.post('/save-settings', (req, res) => {
            try {
                const { main, extra, settings } = req.body;

                if (main) {
                    Object.assign(this.config.main, main);
                }

                if (extra) {
                    Object.assign(this.config.extra, extra);
                }

                if (settings) {
                    Object.assign(this.config.settings, settings);
                }

                // Type conversions if necessary (e.g. legacy flat post handling removal)
                // Assuming frontend sends correct types now.

                saveConfig(this.config);
                res.json({ message: 'Settings saved successfully!', type: 'success' });
            } catch (error) {
                console.error("Save Error:", error);
                res.status(500).json({ message: 'Error saving settings.', type: 'error' });
            }
        });

        // Catch-all for SPA
        this.app.get('*', (req, res) => {
            if (req.path.startsWith('/api') || req.path.startsWith('/ws')) return;
            res.sendFile(path.join(process.cwd(), 'frontend', 'dist', 'index.html'));
        });
    }

    private setupWebSocket() {
        this.server.on('upgrade', (request, socket, head) => {
            if (request.url === '/' || request.url === '/ws') {
                this.wsServer.handleUpgrade(request, socket as any, head);
            } else {
                socket.destroy();
            }
        });
    }

    public start() {
        const port = this.config.settings.expressPort || 1243;
        this.server.listen(port, () => {
            console.log(`WebUI running at http://localhost:${port}`);
        });
    }
}
