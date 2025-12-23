import { IBotClient } from '../types.js';
import { Helper } from '../utils/helper.js';
import { logger } from '../utils/logger.js';

const QUOTES = [
    "owo", "uwu", "meow", "nyan", "hello", "hi", "bot", "leveling", "xp", "grind",
    "discord", "gamble", "coinflip", "slots", "daily", "hunt", "battle", "pray"
];

export const AutoLevel = {
    name: "AutoLevel",
    enabled: (client: IBotClient) => client.config.autoLevel || client.config.autoQuote,
    cooldown: () => Helper.random(20000, 40000), // Slow pace to avoid spam flags
    run: async (client: IBotClient) => {
        if (client.paused || client.captchaDetected) return;
        const channel = await client.channels.fetch(client.config.channelId[0]);
        if (channel && channel.isText()) {
            const text = client.config.autoQuote ? "owo quote" : QUOTES[Math.floor(Math.random() * QUOTES.length)];
            await channel.send(text);
            logger.info(`AutoLevel: Sent "${text}"`);
        }
    }
};
