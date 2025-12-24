import { Client, ClientOptions, Message } from 'discord.js-selfbot-v13';
import { BotConfig } from '../config/config.js';
import { logger } from './utils/logger.js';
import { Helper } from './utils/helper.js';
import { LoopHandler } from './handler.js';
import { IBotClient } from './types.js';

import { AutoHunt, AutoBattle, AutoPray } from './features/automations.js';
import { AutoHuntBot } from './features/huntbot.js';
import { AutoCoinflip, AutoSlots } from './features/gamble.js';
import { AutoSell, AutoSacrifice } from './features/inventory.js';
import { AutoLevel } from './features/leveling.js';
import { AutoCookie, AutoClover } from './features/interactions.js';
import { AutoQuest } from './features/quest.js';
import { CaptchaSolver } from './utils/captcha.js';

import { CommandManager } from './commands/manager.js';
import { Ping } from './commands/ping.js';
import { Say } from './commands/say.js';
import { Pause } from './commands/pause.js';
import { Resume } from './commands/resume.js';
import { Stop } from './commands/stop.js';
import { Status } from './commands/status.js';
import { Uptime } from './commands/uptime.js';
import { Eval } from './commands/eval.js';
import { Send } from './commands/send.js';

export class BotClient extends Client implements IBotClient {
    public config: BotConfig;
    public isReadyFlag: boolean = false;
    public paused: boolean = false;
    public captchaDetected: boolean = false;
    public loopHandler: LoopHandler;
    public commandManager: CommandManager;

    public total = {
        hunt: 0, battle: 0, pray: 0, curse: 0, huntbot: 0,
        vote: 0, giveaway: 0, captcha: 0, solvedcaptcha: 0
    };

    constructor(config: BotConfig, options?: ClientOptions) {
        super(options || {});
        this.config = config;
        this.loopHandler = new LoopHandler(this);
        this.commandManager = new CommandManager(this);

        // Register features
        this.loopHandler.registerFeature(AutoHunt);
        this.loopHandler.registerFeature(AutoBattle);
        this.loopHandler.registerFeature(AutoPray);
        this.loopHandler.registerFeature(AutoHuntBot);
        this.loopHandler.registerFeature(AutoCoinflip);
        this.loopHandler.registerFeature(AutoSlots);
        this.loopHandler.registerFeature(AutoSell);
        this.loopHandler.registerFeature(AutoSacrifice);
        this.loopHandler.registerFeature(AutoLevel);
        this.loopHandler.registerFeature(AutoCookie);
        this.loopHandler.registerFeature(AutoClover);
        this.loopHandler.registerFeature(AutoQuest);

        // Register commands
        this.commandManager.register(Ping);
        this.commandManager.register(Say);
        this.commandManager.register(Pause);
        this.commandManager.register(Resume);
        this.commandManager.register(Stop);
        this.commandManager.register(Status);
        this.commandManager.register(Uptime);
        this.commandManager.register(Eval);
        this.commandManager.register(Send);

        this.on('ready', async () => {
            this.isReadyFlag = true;
            logger.success(`Logged in as ${this.user?.tag}`);

            let largeImage = undefined;
            try {
                // Upload local image to get a URL
                const fs = await import('fs');
                if (fs.existsSync('./src/assets/activity.png')) {
                    logger.info('Found custom activity image. Uploading...');

                    let targetUser: import('discord.js-selfbot-v13').User | null = this.user;
                    if (this.config.adminId) {
                        try {
                            targetUser = await this.users.fetch(this.config.adminId);
                        } catch (e) {
                            logger.warn(`Could not fetch admin user ${this.config.adminId}, falling back to self.`);
                        }
                    }

                    if (targetUser) {
                        const msg = await targetUser.send({ files: ['./src/assets/activity.png'] });
                        largeImage = msg?.attachments.first()?.url;
                        logger.success(`Image uploaded: ${largeImage}`);
                    }
                }
            } catch (err) {
                logger.error(`Failed to upload activity image: ${err}`);
            }

            this.user?.setActivity("Gambling in OwO", {
                type: "PLAYING",
                details: "Made by Spectral.",
                assets: largeImage ? { large_image: largeImage, large_text: "OwO" } : undefined
            } as any);
            logger.info("Status set to: Gambling in OwO");

            // Start main loop handler
            logger.info("[Startup] Starting main loop handler...");
            this.loopHandler.start();
        });

        this.on('error', (error) => {
            logger.error(`Client Error: ${error.message}`);
        });

        this.on('messageCreate', this.handleMessage.bind(this));
    }

    private async handleMessage(message: Message) {
        // 1. Check for Captcha from OwO Bot
        if (message.author.id === "408785106942164992") { // OwO Bot ID
            const rawContent = message.content.toLowerCase();
            // Remove zero-width spaces, formatting marks, and extra whitespace to ensure clean match
            const normalizedContent = rawContent.replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '').replace(/\s+/g, ' ');

            const isDM = message.channel.type === "DM";

            // STRICT CHECK: The user explicitly asked to ONLY stop if the warning is for THIS bot.
            // Check mentions specifically.
            const isReplyToMe = message.reference?.messageId
                ? (await message.channel.messages.fetch(message.reference.messageId).then(m => m.author.id === this.user?.id).catch(() => false))
                : false;

            const isForMe =
                isDM ||
                isReplyToMe ||
                message.mentions.users.has(this.user?.id!) ||
                rawContent.includes(this.user?.username.toLowerCase()!) ||
                rawContent.includes(this.user?.displayName.toLowerCase()!) ||
                rawContent.includes(this.user?.id!);

            if (!isForMe) return;

            // Define captcha keywords based on normalized content
            const captchaKeywords = [
                "captcha",
                "verify",
                "human",
                "banned",
                "are you a real human",
                "security checking",
                "please complete this within 10 minutes",
                "please use the link below"
            ];

            const isCaptcha =
                captchaKeywords.some(k => normalizedContent.includes(k)) &&
                !normalizedContent.includes("verified that you are human") &&
                !normalizedContent.includes("thank you");

            // Also check for DMs which are common for captchas
            const suspiciousDM = isDM && (normalizedContent.includes("link") || message.attachments.size > 0);

            // Comprehensive Embed Check
            // Embeds might also have weird formatting, so normalize them too
            const embedJson = message.embeds.length > 0 ? JSON.stringify(message.embeds[0]).toLowerCase().replace(/[\u200B-\u200D\uFEFF\u00A0]/g, '') : "";

            const isEmbedCaptcha = (message.embeds.length > 0 && (
                embedJson.includes("captcha") ||
                embedJson.includes("verify that you are human") ||
                embedJson.includes("are you a real human")
            ));

            if (isCaptcha || isEmbedCaptcha || (isDM && suspiciousDM)) {
                this.captchaDetected = true;
                this.paused = true;
                this.total.captcha++;
                logger.error("🚨 CAPTCHA DETECTED! Bot paused automatically.");
                logger.warn(`Reason: ${normalizedContent.substring(0, 100)}...`);

                // Notify Admin via DM
                if (this.config.adminId) {
                    this.users.fetch(this.config.adminId).then(admin => {
                        admin.send(`🚨 **CAPTCHA DETECTED!** 🚨\n**Bot Account:** ${this.user?.tag}\n**Reason:** ${normalizedContent.substring(0, 100)}...`)
                            .catch(err => logger.error(`[Notify] Failed to DM admin: ${err.message}`));
                    }).catch(() => { });
                }

                // Attempt to solve if configured
                if (this.config.captchaAPI === '2captcha' && this.config.apiKey) {
                    const attachment = message.attachments.first();
                    const url = attachment ? attachment.url : null;

                    if (url) {
                        logger.info('Attempting to solve captcha...');
                        const solver = new CaptchaSolver(this.config.apiKey, '2captcha');
                        const code = await solver.solve(url);

                        if (code) {
                            logger.success(`Solving successful. Code: ${code}`);
                            await message.channel.send(`owo verify ${code}`);
                            this.total.solvedcaptcha++;

                            // Resume after a short delay
                            setTimeout(() => {
                                this.paused = false;
                                this.captchaDetected = false;
                                logger.info('Resuming bot after captcha solve.');
                            }, 5000);
                            return;
                        }
                    } else {
                        logger.warn('No image attachment found for captcha.');
                    }
                }

                return;
            }
        }

        // 2. Handle Self Commands via Manager
        this.commandManager.handle(message);
    }

    public async start() {
        try {
            await this.login(this.config.token);
        } catch (error: any) {
            logger.error(`Login failed: ${error.message}`);
        }
    }

    public async stop() {
        this.loopHandler.stop();
        this.destroy();
        this.isReadyFlag = false;
        logger.warn('Bot stopped.');
    }
}
