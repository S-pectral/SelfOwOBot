import { IBotClient } from '../types.js';
import { Message } from 'discord.js-selfbot-v13';
import { Command } from './types.js';
import { logger } from '../utils/logger.js';

export const Stop: Command = {
    name: "stop",
    description: "Stop the bot process",
    aliases: ["shutdown", "kill"],
    execute: async (client: IBotClient, message: Message, args: string[]) => {
        await message.channel.send("🛑 | Shutting down...");
        logger.warn("Bot stopping via command...");
        client.loopHandler.stop();
        client.destroy();
        process.exit(0);
    }
};
