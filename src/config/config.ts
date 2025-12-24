import fs from 'fs';
import path from 'path';

export interface BotConfig {
    token: string;
    userId: string;
    channelId: string[];
    adminId: string;
    prefix: string;

    // Feature Toggles
    autoHunt: boolean;
    autoBattle: boolean;
    autoPray: string[]; // ['pray', 'curse']
    prayCurseTarget: "self" | "other";
    prayCurseTargetId: string;
    autoGamble: {
        coinflip: boolean;
        slots: boolean;
        blackjack: boolean;
        coinflipAmount: number;
        slotsAmount: number;
        minGambleBalance: number;
    };

    // Inventory Management
    autoGem: number; // 0, 1, -1
    gemTier: string[];
    autoLootbox: boolean;
    autoFabledLootbox: boolean;
    useSpecialGem: boolean;
    autoDaily: boolean;

    // New Inventory Settings
    autoSell: boolean;
    autoSellRarity: string[]; // ['common', 'uncommon']
    autoSacrifice: boolean;
    autoSacrificeRarity: string[];

    // Auto Leveling
    autoLevel: boolean;
    autoQuote: boolean;

    // Interactions
    autoCookie: boolean;
    autoClover: boolean;
    interactionTargetId: string;

    // Quest
    autoQuest: boolean;

    // Advanced & Huntbot
    autoHuntBot: boolean;

    autoTrait: string;
    useAdotfAPI: boolean;

    // Captcha
    captchaAPI: "2captcha" | "yescaptcha" | "none";
    apiKey: string;

    // Webhook/Notifications
    webhookURL: string;
    notifications: string[]; // ['webhook', 'dms', 'sound']
}

export interface Settings {
    // WebUI Settings
    expressPort: number;
    developerMode: boolean;
}

export interface GlobalConfig {
    main: BotConfig;
    extra?: BotConfig;
    settings: Settings;
}

const CONFIG_PATH = path.join(process.cwd(), 'config.json');

export function loadConfig(): GlobalConfig {
    if (!fs.existsSync(CONFIG_PATH)) {
        throw new Error("config.json not found!");
    }
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
}

export function saveConfig(config: GlobalConfig): void {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 4));
}
