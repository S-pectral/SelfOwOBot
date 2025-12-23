import { IBotClient } from '../types.js';
import { Message } from 'discord.js-selfbot-v13';
import { Command } from './types.js';
import { Helper } from '../utils/helper.js';
import { logger } from '../utils/logger.js';

export const Pause: Command = {
    name: "pause",
    description: "Pause the bot for a duration",
    usage: "pause [duration] (e.g. 1h, 30m)",
    execute: async (client: IBotClient, message: Message, args: string[]) => {
        if (client.paused) {
            await message.channel.send("⚠️ Bot is already paused.");
            return;
        }

        let duration = null;
        if (args.length > 0) {
            duration = Helper.parseTime(args[0]);
        }

        client.paused = true;
        logger.warn("Bot paused via command.");

        if (duration) {
            await message.channel.send(`zk | Bot paused for **${Helper.formatTime(duration)}**.`);
            setTimeout(() => {
                if (client.paused) {
                    client.paused = false;
                    logger.info("Bot auto-resumed after pause duration.");
                    message.channel.send("▶️ | Bot auto-resumed.");
                }
            }, duration);
        } else {
            await message.channel.send("zk | Bot paused indefinitely. Use `resume` to start.");
        }
    }
};
