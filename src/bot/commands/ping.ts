import { IBotClient } from '../types.js';
import { Message } from 'discord.js-selfbot-v13';
import { Command } from './types.js';

export const Ping: Command = {
    name: "ping",
    description: "Check bot latency",
    execute: async (client: IBotClient, message: Message, args: string[]) => {
        const latency = Date.now() - message.createdTimestamp;
        const wsLatency = client.ws.ping;

        await message.channel.send(`🏓 | **Pong!** Latency: \`${latency}ms\` | API: \`${wsLatency}ms\``);
    }
};
