import { IBotClient } from '../types.js';
import { Message } from 'discord.js-selfbot-v13';
import { Command } from './types.js';
import { Helper } from '../utils/helper.js';

export const Status: Command = {
    name: "status",
    description: "Show bot statistics",
    aliases: ["stats", "info"],
    execute: async (client: IBotClient, message: Message, args: string[]) => {
        const uptime = Helper.formatTime(client.uptime || 0);
        const t = client.total;

        const stats = [
            `**Uptime:** ${uptime}`,
            `**Hunts:** ${t.hunt}`,
            `**Battles:** ${t.battle}`,
            `**Captchas:** ${t.captcha} (Solved: ${t.solvedcaptcha})`,
            `**Status:** ${client.paused ? "⏸️ PAUSED" : "▶️ RUNNING"}`
        ].join("\n");

        await message.channel.send(`📊 | **Bot Statistics**\n${stats}`);
    }
};
