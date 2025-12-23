import { IBotClient } from '../types.js';
import { Helper } from '../utils/helper.js';
import { logger } from '../utils/logger.js';
import { Message } from 'discord.js-selfbot-v13';

const GEM_REGEX = {
    gem1: /^05[1-7]$/,
    gem2: /^(06[5-9]|07[0-1])$/,
    gem3: /^07[2-8]$/,
    star: /^(079|08[0-5])$/,
};

const GEM_TIERS: Record<string, number[]> = {
    common: [51, 65, 72, 79],
    uncommon: [52, 66, 73, 80],
    rare: [53, 67, 74, 81],
    epic: [54, 68, 75, 82],
    mythical: [55, 69, 76, 83],
    legendary: [56, 70, 77, 84],
    fabled: [57, 71, 78, 85],
};

async function useGems(client: IBotClient, channel: any, huntMsgContent: string) {
    if (!client.config.autoGem) return;

    const gem1Needed = !huntMsgContent.includes("gem1");
    const gem3Needed = !huntMsgContent.includes("gem3");
    const gem4Needed = !huntMsgContent.includes("gem4");
    const starNeeded = client.config.useSpecialGem && !huntMsgContent.includes("star");

    logger.debug(`AutoGem Check: Content="${huntMsgContent.substring(0, 50)}..."`);
    logger.debug(`Needs: Gem1=${gem1Needed}, Gem3=${gem3Needed}, Gem4=${gem4Needed}, Star=${starNeeded}`);

    if (!gem1Needed && !gem3Needed && !gem4Needed && !starNeeded) return;

    logger.info("AutoGem: Gems missing, checking inventory...");

    // Fetch Inventory
    await channel.send("owo inv");
    const invMsg = await new Promise<Message | null>(resolve => {
        const c = channel.createMessageCollector({
            filter: (m: Message) => m.author.id === "408785106942164992" && m.content.includes("Inventory"),
            time: 12000, max: 1
        });
        c.on('collect', (m: Message) => resolve(m));
        c.on('end', (col: any) => resolve(col.first() || null));
    });

    if (!invMsg) return;

    const inventory = invMsg.content.split("`");

    // Auto Lootbox
    if (client.config.autoLootbox && inventory.includes("050")) {
        await channel.send("owo lb all");
        await Helper.sleep(3000);
        return;
    }
    if (client.config.autoFabledLootbox && inventory.includes("049")) {
        await channel.send("owo lb fabled");
        await Helper.sleep(3000);
        return;
    }

    // Filter Gems
    const usableGemsSet = new Set(client.config.gemTier?.map((tier) => GEM_TIERS[tier]).flat());

    const filterGems = (regex: RegExp) => {
        return inventory.reduce((acc: number[], item: string) => {
            const num = Number(item);
            if (regex.test(item) && usableGemsSet.has(num)) acc.push(num);
            return acc;
        }, []);
    };

    const gem1 = filterGems(GEM_REGEX.gem1);
    const gem2 = filterGems(GEM_REGEX.gem2);
    const gem3 = filterGems(GEM_REGEX.gem3);
    const star = client.config.useSpecialGem ? filterGems(GEM_REGEX.star) : [];

    const gemsToUse: number[] = [];

    const pick = (arr: number[]) => client.config.autoGem > 0 ? Math.max(...arr) : Math.min(...arr);

    if (gem1Needed && gem1.length > 0) gemsToUse.push(pick(gem1));
    if (gem3Needed && gem2.length > 0) gemsToUse.push(pick(gem2));
    if (gem4Needed && gem3.length > 0) gemsToUse.push(pick(gem3));
    if (starNeeded && star.length > 0) gemsToUse.push(pick(star));

    if (gemsToUse.length > 0) {
        await channel.send(`owo use ${gemsToUse.join(" ")}`);
        logger.info(`AutoGem: Used gems ${gemsToUse.join(" ")}`);
    } else {
        logger.warn("AutoGem: Gems needed but none found in inventory.");
    }
}

export const AutoHunt = {
    name: "AutoHunt",
    enabled: (client: IBotClient) => client.config.autoHunt,
    cooldown: () => Helper.random(15000, 25000),
    run: async (client: IBotClient) => {
        if (client.paused || client.captchaDetected) return;
        const channel = await client.channels.fetch(client.config.channelId[0]);
        if (channel && channel.isText()) {
            await channel.send("owoh");

            try {
                const collector = channel.createMessageCollector({
                    filter: (m: Message) => m.author.id === "408785106942164992" && /hunt is empowered by|spent 5 .+ and caught a/.test(m.content),
                    time: 6000,
                    max: 1
                });

                collector.on('collect', async (m: Message) => {
                    client.total.hunt++;
                    logger.info("Sent: owoh");
                    await useGems(client, channel, m.content);
                });
            } catch (e) {
                logger.error(`AutoHunt Error: ${e}`);
            }
        }
    }
};

export const AutoBattle = {
    name: "AutoBattle",
    enabled: (client: IBotClient) => client.config.autoBattle,
    cooldown: () => Helper.random(15000, 25000),
    run: async (client: IBotClient) => {
        if (client.paused || client.captchaDetected) return;
        const channel = await client.channels.fetch(client.config.channelId[0]);
        if (channel && channel.isText()) {
            await channel.send("owob");
            client.total.battle++;
            logger.info("Sent: owob");
        }
    }
};

export const AutoPray = {
    name: "AutoPray",
    enabled: (client: IBotClient) => client.config.autoPray.length > 0,
    cooldown: () => Helper.random(300000, 310000),
    run: async (client: IBotClient) => {
        if (client.paused || client.captchaDetected) return;
        const channel = await client.channels.fetch(client.config.channelId[0]);
        if (channel && channel.isText()) {
            const cmd = client.config.autoPray[0] || "pray";
            await channel.send(`owo ${cmd}`);
            client.total.pray++;
            logger.info(`Sent: owo ${cmd}`);
        }
    }
};
