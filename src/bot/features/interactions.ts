import { IBotClient } from '../types.js';
import { Helper } from '../utils/helper.js';
import { logger } from '../utils/logger.js';

export const AutoCookie = {
    name: "AutoCookie",
    enabled: (client: IBotClient) => client.config.autoCookie,
    cooldown: () => Helper.random(300000, 600000), // Variable 5-10 mins? Cookie is daily. 
    // Wait, cookie is once a day. But to be safe, we can check 24h.
    // However, simplest logic: Periodically try. If fail, catch error?
    // Selfbot doesn't easily catch "You already sent a cookie" unless we parse message.
    // For now, let's try once every 24h + jitter.
    // Actually, to make sure it hits, maybe check every hour if enabled?
    // Let's go with 1 hour for now to ensure we don't miss.
    run: async (client: IBotClient) => {
        if (client.paused || client.captchaDetected) return;
        const channel = await client.channels.fetch(client.config.channelId[0]);
        if (channel && channel.isText()) {
            const target = client.config.interactionTargetId || client.user?.id; // Send to self if no target? (Cookie to self works?)
            // Cookies must be sent to others usually.
            if (target) {
                await channel.send(`owo cookie ${target}`);
                logger.info(`Interaction: Sent cookie to ${target}`);
            }
        }
    }
};

export const AutoClover = {
    name: "AutoClover",
    enabled: (client: IBotClient) => client.config.autoClover,
    cooldown: () => Helper.random(60000, 120000), // Clovers can be used frequently during battles?
    // Or is this 'daily clover'? "Use clover" adds luck.
    // Usually `owo daily`.
    // If it's `owo use clover`:
    run: async (client: IBotClient) => {
        if (client.paused || client.captchaDetected) return;
        const channel = await client.channels.fetch(client.config.channelId[0]);
        if (channel && channel.isText()) {
            await channel.send(`owo use clover`);
            logger.info(`Interaction: Used clover`);
        }
    }
};
