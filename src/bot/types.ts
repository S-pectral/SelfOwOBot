import { Client } from 'discord.js-selfbot-v13';
import { BotConfig } from '../config/config.js';
import { LoopHandler } from './handler.js';

export interface IBotClient extends Client {
    config: BotConfig;
    isReadyFlag: boolean;
    paused: boolean;
    captchaDetected: boolean;
    loopHandler: LoopHandler;
    total: {
        hunt: number;
        battle: number;
        pray: number;
        curse: number;
        huntbot: number;
        vote: number;
        giveaway: number;
        captcha: number;
        solvedcaptcha: number;
    };
    start(): Promise<void>;
    stop(): Promise<void>;
}
