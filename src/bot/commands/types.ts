import { IBotClient } from '../types.js';
import { Message } from 'discord.js-selfbot-v13';

export interface Command {
    name: string;
    description: string;
    usage?: string;
    aliases?: string[];
    adminOnly?: boolean;
    execute: (client: IBotClient, message: Message, args: string[]) => Promise<void>;
}
