import { IBotClient } from '../types.js';
import { Message } from 'discord.js-selfbot-v13';
import { Command } from './types.js';
import { logger } from '../utils/logger.js';

export const Resume: Command = {
    name: "resume",
    description: "Resume the bot",
    aliases: ["start", "unpause"],
    execute: async (client: IBotClient, message: Message, args: string[]) => {
        if (!client.paused) {
            await message.channel.send("⚠️ Bot is running.");
            return;
        }

        client.paused = false;
        client.captchaDetected = false; // Reset captcha flag just in case
        logger.success("Bot resumed via command.");
        await message.channel.send("▶️ | Bot resumed.");
    }
};
