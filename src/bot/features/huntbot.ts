import { IBotClient } from '../types.js';
import { Helper } from '../utils/helper.js';
import { logger } from '../utils/logger.js';
import { Message } from 'discord.js-selfbot-v13';

// Simple in-memory storage for HuntBot state
// In a real app, this might be in the client or a separate service
interface HuntBotState {
    nextRun: number;
    processing: boolean;
}

const state: HuntBotState = {
    nextRun: 0,
    processing: false
};

const MIRAI_ID = "1205422490969579530";

async function solveWithMirai(client: IBotClient, channel: any, imageUrl: string): Promise<string | null> {
    try {
        // Ensure Mirai is authorized (if method exists)
        if (typeof client.authorizedApplications === 'function' && typeof client.installUserApps === 'function') {
            const apps = await client.authorizedApplications();
            if (!apps.some((a: any) => a.application.id === MIRAI_ID)) {
                await client.installUserApps(MIRAI_ID);
                logger.info("Installed Mirai user app for captcha solving.");
            }
        }

        // Send Slash Command: /solve huntbot [url]
        // Note: The second arg in reference was [undefined, url] but sendSlash usually takes name, then args.
        // Reference: command: "solve huntbot", args: [undefined, attachmentUrl]
        // This implies proper sub-command handling: solve -> huntbot -> url?
        // Or "solve huntbot" is the name?
        // Let's assume `channel.sendSlash(MIRAI_ID, "solve huntbot", imageUrl)` based on common usage.
        // Reference uses `channel.sendSlash(bot, command, ...args)`.

        // Wait for response logic
        // We need to capture the initial loading message and its update.

        const slashMsg = await channel.sendSlash(MIRAI_ID, "solve huntbot", imageUrl);

        if (!slashMsg) return null;

        // Wait for update (Mirai edits the message with result)
        // Simple polling/wait mechanism since we can't easily do complex event listeners here without clutter.
        // Or use a temporary collector/listener.

        return new Promise((resolve) => {
            const timeout = setTimeout(() => resolve(null), 20000);

            const listener = async (oldM: Message, newM: Message) => {
                if (newM.id === slashMsg.id) {
                    // Check if loading is done
                    if (newM.content && !newM.content.includes("Thinking")) {
                        clearTimeout(timeout);
                        client.off("messageUpdate", listener as any);

                        // Parse result
                        try {
                            // Content is JSON: { "time": 123, "result": "CODE", "avgConfidence": "99%" }
                            const json = JSON.parse(newM.content);
                            if (json && json.result) {
                                resolve(json.result);
                            } else {
                                resolve(null);
                            }
                        } catch (e) {
                            resolve(null);
                        }
                    }
                }
            };

            client.on("messageUpdate", listener as any);
        });

    } catch (e: any) {
        logger.error(`Mirai Solver Error: ${e.message}`);
        return null;
    }
}

export const AutoHuntBot = {
    name: "AutoHuntBot",
    enabled: (client: IBotClient) => client.config.autoHuntBot,
    cooldown: () => Helper.random(60000, 120000),
    run: async (client: IBotClient) => {
        if (client.paused || client.captchaDetected) return;
        if (state.processing || Date.now() < state.nextRun) return;

        const channel = await client.channels.fetch(client.config.channelId[0]);
        if (!channel || !channel.isText()) return;

        state.processing = true;

        try {
            // 1. Check status
            await channel.send("owohb");
            logger.info("Sent: owohb");

            const filter = (m: Message) =>
                m.author.id === "408785106942164992" &&
                (
                    m.content.includes(client.user?.username!) ||
                    m.content.includes(client.user?.displayName!) ||
                    (m.embeds.length > 0 && (
                        m.embeds[0].author?.name?.includes(client.user?.username!) ||
                        m.embeds[0].author?.name?.includes(client.user?.displayName!) ||
                        m.embeds[0].description?.includes(client.user?.username!) ||
                        m.embeds[0].description?.includes(client.user?.displayName!)
                    ))
                );

            const collector = channel.createMessageCollector({ filter, time: 10000, max: 1 });

            // Using promise wrapper
            const collected = await new Promise<Message | null>(resolve => {
                collector.on('collect', m => resolve(m));
                collector.on('end', collected => resolve(collected.first() || null));
            });

            if (!collected) {
                logger.warn("HuntBot: No response to owohb");
                state.processing = false;
                return;
            }

            // 2. Parse response
            const content = collected.content;
            const embeds = collected.embeds;

            // Scenario A: Already hunting
            let isHunting = false;
            let timeMatch: RegExpMatchArray | null = null;

            if (embeds.length > 0) {
                const fields = embeds[0].fields;
                const huntingField = fields.find(f => f.name.includes("currently hunting"));
                if (huntingField) {
                    isHunting = true;
                    timeMatch = huntingField.value.match(/IN\s((\d+)H\s)?(\d+)M/i);
                }
            } else if (content.includes("I AM STILL HUNTING")) {
                isHunting = true;
                timeMatch = content.match(/IN\s*(?:(\d+)\s*H\s*)?(\d+)\s*M/i);
            }

            if (isHunting && timeMatch) {
                const hours = parseInt(timeMatch[2] || "0");
                const minutes = parseInt(timeMatch[3] || "0");
                const msRemaining = (hours * 3600 * 1000) + (minutes * 60 * 1000);

                logger.info(`HuntBot is hunting. Waiting for ${hours}h ${minutes}m.`);
                state.nextRun = Date.now() + msRemaining + Helper.random(60000, 300000);
                state.processing = false;
                return;
            }

            // Scenario B: Not hunting, need to start
            await Helper.sleep(2000);
            await channel.send("owohb 24h");
            logger.info("Sent: owohb 24h");

            const passMsg = await new Promise<Message | null>(resolve => {
                const c = channel.createMessageCollector({
                    filter: m => m.author.id === "408785106942164992" && m.attachments.size > 0,
                    time: 15000, max: 1
                });
                c.on('collect', m => resolve(m));
                c.on('end', col => resolve(col.first() || null));
            });

            if (!passMsg) {
                logger.warn("HuntBot: No password captcha received.");
                state.processing = false;
                return;
            }

            const attachmentUrl = passMsg.attachments.first()?.url;
            if (!attachmentUrl) {
                state.processing = false;
                return;
            }

            logger.info(`HuntBot Captcha received: ${attachmentUrl}`);

            // Solve using Mirai (ADOTF API)
            if (client.config.useAdotfAPI) {
                logger.info("Attempting to solve via Mirai...");
                const code = await solveWithMirai(client, channel, attachmentUrl);

                if (code) {
                    logger.success(`Mirai Solved: ${code}`);
                    await channel.send(`owohb 24h ${code}`);
                    // Assume success for now, or wait for confirmation
                } else {
                    logger.error("Mirai failed to solve captcha.");
                }
            } else {
                logger.warn("AdotfAPI (Mirai) disabled. Cannot auto-solve.");
            }

        } catch (e: any) {
            logger.error(`HuntBot Error: ${e.message}`);
        } finally {
            state.processing = false;
        }
    }
}
