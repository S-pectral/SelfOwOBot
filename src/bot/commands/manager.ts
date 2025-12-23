import { IBotClient } from '../types.js';
import { Message } from 'discord.js-selfbot-v13';
import { Command } from './types.js';
import { logger } from '../utils/logger.js';

export class CommandManager {
    private client: IBotClient;
    private commands: Map<string, Command> = new Map();
    private aliases: Map<string, string> = new Map();

    constructor(client: IBotClient) {
        this.client = client;
    }

    public register(command: Command) {
        this.commands.set(command.name, command);
        if (command.aliases) {
            command.aliases.forEach(alias => this.aliases.set(alias, command.name));
        }
    }

    public async handle(message: Message) {
        // Only handle self-messages or from admins if needed (usually self-bots only respond to self)
        // But some commands like 'say' might be useful if triggered by admin? 
        // Strict consistency: Only respond to self or configured Admin.
        if (message.author.id !== this.client.user?.id && message.author.id !== this.client.config.adminId) return;

        const prefix = this.client.config.prefix || ".";
        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift()?.toLowerCase();
        if (!commandName) return;

        const resolvedName = this.aliases.get(commandName) || commandName;
        const command = this.commands.get(resolvedName);

        if (!command) return;

        // Message Deletion (optional, cleaner)
        message.delete().catch(() => { });

        // Admin check (if strictly implemented later) except self is always admin of self

        try {
            await command.execute(this.client, message, args);
        } catch (error: any) {
            logger.error(`Error executing command ${commandName}: ${error.message}`);
        }
    }
}
