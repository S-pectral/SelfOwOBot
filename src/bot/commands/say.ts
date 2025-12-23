import { IBotClient } from '../types.js';
import { Message, TextChannel } from 'discord.js-selfbot-v13';
import { Command } from './types.js';

export const Say: Command = {
    name: "say",
    description: "Send a message to a channel",
    usage: "say [channel_id] <message>",
    execute: async (client: IBotClient, message: Message, args: string[]) => {
        if (!args.length) return;

        let targetChannel = message.channel;
        let content = args.join(" ");

        // Check if first arg is channel ID
        const firstArg = args[0];
        if (firstArg.match(/^\d{17,19}$/)) {
            const channel = client.channels.cache.get(firstArg);
            if (channel && channel.isText()) {
                targetChannel = channel as TextChannel;
                content = args.slice(1).join(" ");
            }
        }

        if (!content) return;
        await targetChannel.send(content);
    }
};
