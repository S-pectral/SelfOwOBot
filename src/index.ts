import { loadConfig } from './config/config.js';
import { BotClient } from './bot/client.js';
import { WebServer } from './api/server.js';
import { WSServer } from './api/websocket.js';
import { logger } from './bot/utils/logger.js';

async function main() {
    try {
        logger.info('Starting SelfOwO Bot...');

        // Load Configuration
        const config = loadConfig();

        // Initialize Bots
        const clients: BotClient[] = [];
        const mainClient = new BotClient(config.main);
        clients.push(mainClient);

        if (config.extra && config.extra.token) {
            const extraClient = new BotClient(config.extra);
            clients.push(extraClient);
        }

        // Initialize API & WebSocket
        const wsServer = new WSServer(clients);
        const webServer = new WebServer(config, wsServer);

        // Start Services
        webServer.start();

        logger.info('Logging in bots...');
        await mainClient.start();
        if (clients[1]) await clients[1].start();

    } catch (error: any) {
        logger.error(`Critical Error: ${error.message}`);
        process.exit(1);
    }
}

main();
