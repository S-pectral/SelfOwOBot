import { IBotClient } from '../types.js';
import { Message } from 'discord.js-selfbot-v13';
import { Command } from './types.js';
import { Helper } from '../utils/helper.js';

export const Uptime: Command = {
    name: "uptime",
    description: "Show bot uptime",
    execute: async (client: IBotClient, message: Message, args: string[]) => {
        const uptime = Helper.formatTime(client.uptime || 0);
        await message.channel.send(`⏱️ | Uptime: **${uptime}**`);
    }
};
