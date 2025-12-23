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

            this.user?.setActivity("Gambling in OwO ", {
                type: "PLAYING",
                // @ts-ignore
                assets: largeImage ? { large_image: largeImage, large_text: "OwO" } : undefined
            });
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
            const content = message.content.toLowerCase();
            const isDM = message.channel.type === "DM";

            // STRICT CHECK: The message MUST mention the bot to be a valid captcha for us.
            // (Unless it's a DM, where mentions might not be explicit or it's implicitly for us)
            // UPDATE: Strict mention check failed (Owo bot might bold name instead of ping). 
            // Fallback to username/displayname check.

            const guildMe = message.guild?.me;
            const guildNick = guildMe?.displayName?.toLowerCase(); // Local server nickname
            const globalName = this.user?.username.toLowerCase();
            const displayName = this.user?.displayName.toLowerCase(); // Global display name

            const isReplyToMe = message.reference?.messageId
                ? (await message.channel.messages.fetch(message.reference.messageId).then(m => m.author.id === this.user?.id).catch(() => false))
                : false;

            const isForMe =
                isDM ||
                isReplyToMe ||
                message.mentions.users.has(this.user?.id!) ||
                (globalName && content.includes(globalName)) ||
                (displayName && content.includes(displayName)) ||
                (guildNick && content.includes(guildNick)) ||
                content.includes(this.user?.id!);

            if (!isForMe) return;

            const isCaptcha =
                (content.includes("captcha") ||
                    content.includes("verify") ||
                    content.includes("human") ||
                    content.includes("banned")) &&
                !content.includes("verified that you are human") && // Ignore success message
                !content.includes("thank you");

            // Also check for DMs which are common for captchas
            const suspiciousDM = isDM && (content.includes("link") || message.attachments.size > 0);

            // Comprehensive Embed Check
            const embedJson = message.embeds.length > 0 ? JSON.stringify(message.embeds[0]).toLowerCase() : "";

            const isEmbedCaptcha = (message.embeds.length > 0 && (
                embedJson.includes("captcha") ||
                embedJson.includes("verify that you are human")
            ));

            // DEBUG: Trace why captcha logic triggers or doesn't
            if (content.includes("captcha") || content.includes("verify")) {
                logger.debug(`[Captcha Check] Triggered: ${content.substring(0, 50)}... | ForMe: ${isForMe} (DM:${isDM}, Reply:${isReplyToMe}, Nick:${guildNick}) | IsCaptcha: ${isCaptcha} | IsEmbed: ${isEmbedCaptcha}`);
            }

            // Log OwO messages for debugging if they contain suspicious keywords but weren't caught
            if ((content.includes("captcha") || content.includes("verify")) && !isCaptcha && !isEmbedCaptcha) {
                logger.warn(`[DEBUG] Potential uncaught captcha: ${content} | Embeds: ${embedJson}`);
            }

            if (isCaptcha || isEmbedCaptcha || (isDM && suspiciousDM) || /are you a real human|(check|verify) that you are.{1,3}human!/img.test(content)) {
                this.captchaDetected = true;
                this.paused = true;
                this.total.captcha++;
                logger.error("🚨 CAPTCHA DETECTED! Bot paused automatically.");
                logger.warn(`Reason: ${content.substring(0, 100)}...`);

                // Notify Admin via DM
                if (this.config.adminId) {
                    this.users.fetch(this.config.adminId).then(admin => {
                        admin.send(`🚨 **CAPTCHA DETECTED!** 🚨\n**Bot Account:** ${this.user?.tag}\n**Reason:** ${content.substring(0, 100)}...`)
                            .then(() => logger.info(`[Notify] Sent DM to admin (${this.config.adminId})`))
                            .catch(err => logger.error(`[Notify] Failed to DM admin: ${err.message}`));
                    }).catch(err => logger.error(`[Notify] Failed to fetch admin user: ${err.message}`));
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
