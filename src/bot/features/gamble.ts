import { IBotClient } from '../types.js';
import { Helper } from '../utils/helper.js';
import { logger } from '../utils/logger.js';
import { Message, TextChannel, DMChannel, NewsChannel } from 'discord.js-selfbot-v13';

const checkSafeBalance = async (client: IBotClient, channel: TextChannel | DMChannel | NewsChannel, cost: number): Promise<boolean> => {
    const minBalance = client.config.autoGamble.minGambleBalance;
    if (minBalance === undefined || minBalance <= 0) return true;

    try {
        await channel.send("owo cash");

        const filter = (m: Message) =>
            m.author.id === "408785106942164992" &&
            (m.content.toLowerCase().includes("cowoncy") || m.content.toLowerCase().includes("balance"));

        const collector = channel.createMessageCollector({ filter, time: 5000, max: 1 });

        const received = await new Promise<Message | null>(resolve => {
            collector.on('collect', m => resolve(m));
            collector.on('end', c => resolve(c.first() || null));
        });

        if (!received) return false;

        // Clean content: Remove markdown (**), commas, and verify logic
        // Example: "<:cowoncy:123> | **User**, you currently have **__20,206__** cowoncy!"
        // Cleaned (replace * , _): "<:cowoncy:123> | User you currently have 20206 cowoncy!"
        const cleanContent = received.content.replace(/[*|,|_]/g, '');

        // Strategy:
        // 1. Precise "have X cowoncy" match
        // 2. Fallback to just "X cowoncy"
        // 3. IGNORE numbers that are Snowflake IDs (> 16 digits)

        let validBalance = -1;

        // Regex 1: "have 20206 cowoncy"
        const matchHave = cleanContent.match(/have\s+(\d+)\s*cowoncy/i);
        if (matchHave) validBalance = parseInt(matchHave[1]);

        // Regex 2: "20206 cowoncy" (useful if "have" is missing)
        if (validBalance === -1) {
            const matchGeneric = cleanContent.match(/(\d+)\s*cowoncy/i);
            if (matchGeneric) validBalance = parseInt(matchGeneric[1]);
        }

        // Safety check: specific exclusion of ID-like numbers
        if (validBalance > 1000000000000000) {
            logger.warn(`[DEBUG] Parsed number ${validBalance} looks like an ID, ignoring.`);
            validBalance = -1;
        }

        if (validBalance !== -1) {
            const balance = validBalance;
            const check = (balance - cost) < minBalance;
            logger.info(`[DEBUG] Balance Check: Balance=${balance}, Cost=${cost}, Min=${minBalance}, Result=${check ? 'STOP' : 'OK'}`);

            if (check) {
                logger.warn(`Gambling Skipped: Balance ${balance} - Cost ${cost} < Min ${minBalance}`);
                return false;
            }
            return true;
        } else {
            logger.warn(`[DEBUG] Could not parse balance from: "${received.content}". Cleaned: "${cleanContent}". Stopping for safety.`);
            return false;
        }
    } catch (e) {
        logger.error(`Balance Check Error: ${e}`);
        return false; // Error = Stop
    }
};

export const AutoCoinflip = {
    name: "AutoCoinflip",
    enabled: (client: IBotClient) => client.config.autoGamble.coinflip,
    cooldown: () => Helper.random(16000, 22000), // ~15-20s cooldown
    run: async (client: IBotClient) => {
        if (client.paused || client.captchaDetected) return;
        const channel = await client.channels.fetch(client.config.channelId[0]) as TextChannel;
        if (channel && channel.isText()) {
            const amount = client.config.autoGamble.coinflipAmount || 1;
            if (await checkSafeBalance(client, channel, amount)) {
                await channel.send(`owo cf ${amount}`);
                logger.info(`Gambling: Coinflip ${amount}`);
            }
        }
    }
};

export const AutoSlots = {
    name: "AutoSlots",
    enabled: (client: IBotClient) => client.config.autoGamble.slots,
    cooldown: () => Helper.random(16000, 22000),
    run: async (client: IBotClient) => {
        if (client.paused || client.captchaDetected) return;
        const channel = await client.channels.fetch(client.config.channelId[0]) as TextChannel;
        if (channel && channel.isText()) {
            const amount = client.config.autoGamble.slotsAmount || 1;
            if (await checkSafeBalance(client, channel, amount)) {
                await channel.send(`owo slots ${amount}`);
                logger.info(`Gambling: Slots ${amount}`);
            }
        }
    }
};
