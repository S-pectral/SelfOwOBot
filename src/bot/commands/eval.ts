import { IBotClient } from '../types.js';
import { Message } from 'discord.js-selfbot-v13';
import { Command } from './types.js';

export const Eval: Command = {
    name: "eval",
    description: "Execute Javascript code",
    adminOnly: true,
    execute: async (client: IBotClient, message: Message, args: string[]) => {
        // Manager already checks for Admin/Self, but double safety is fine.
        // if (message.author.id !== client.config.adminId && message.author.id !== client.user?.id) return;

        const code = args.join(" ");
        if (!code) return;

        try {
            const evaled = eval(code);
            const cleaned = await clean(evaled);
            await message.channel.send(`\`\`\`js\n${cleaned}\n\`\`\``);
        } catch (err: any) {
            await message.channel.send(`\`ERROR\` \`\`\`xl\n${await clean(err)}\n\`\`\``);
        }
    }
};

async function clean(text: any) {
    if (typeof text === 'string')
        return text.replace(/`/g, '`' + String.fromCharCode(8203)).replace(/@/g, '@' + String.fromCharCode(8203));
    else
        return text;
}
