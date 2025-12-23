import { IBotClient } from '../types.js';
import { Helper } from '../utils/helper.js';
import { logger } from '../utils/logger.js';

export const AutoSell = {
    name: "AutoSell",
    enabled: (client: IBotClient) => client.config.autoSell,
    cooldown: () => Helper.random(600000, 900000), // 10-15 mins
    run: async (client: IBotClient) => {
        if (client.paused || client.captchaDetected) return;
        const channel = await client.channels.fetch(client.config.channelId[0]);
        if (channel && channel.isText()) {
            const rarities = client.config.autoSellRarity || ['common', 'uncommon'];
            for (const rarity of rarities) {
                await channel.send(`owo sell ${rarity}`);
                logger.info(`Inventory: Sold ${rarity}`);
                await Helper.sleep(3000);
            }
        }
    }
};

export const AutoSacrifice = {
    name: "AutoSacrifice",
    enabled: (client: IBotClient) => client.config.autoSacrifice,
    cooldown: () => Helper.random(600000, 900000), // 10-15 mins
    run: async (client: IBotClient) => {
        if (client.paused || client.captchaDetected) return;
        const channel = await client.channels.fetch(client.config.channelId[0]);
        if (channel && channel.isText()) {
            const rarities = client.config.autoSacrificeRarity || ['common', 'uncommon'];
            for (const rarity of rarities) {
                await channel.send(`owo sacrifice ${rarity}`);
                logger.info(`Inventory: Sacrificed ${rarity}`);
                await Helper.sleep(3000);
            }
        }
    }
};
