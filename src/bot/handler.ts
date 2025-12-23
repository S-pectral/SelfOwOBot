import { IBotClient } from './types.js';
import { Helper } from './utils/helper.js';
import { logger } from './utils/logger.js';

interface Feature {
    name: string;
    run: (client: IBotClient) => Promise<void>;
    cooldown: () => number;
    enabled: (client: IBotClient) => boolean;
}

export class LoopHandler {
    private client: IBotClient;
    private features: Feature[] = [];
    private timeouts: Map<string, NodeJS.Timeout> = new Map();

    constructor(client: IBotClient) {
        this.client = client;
    }

    public registerFeature(feature: Feature) {
        this.features.push(feature);
    }

    public start() {
        this.features.forEach((feature, index) => this.scheduleFeature(feature, index));
    }

    public stop() {
        this.timeouts.forEach(timeout => clearTimeout(timeout));
        this.timeouts.clear();
    }

    private scheduleFeature(feature: Feature, index: number = 0) {
        if (this.timeouts.has(feature.name)) return;

        const loop = async () => {
            // Check global pause/captcha states
            if (this.client.paused || this.client.captchaDetected || !this.client.isReadyFlag) {
                // Retry in 5 seconds if paused
                this.timeouts.set(feature.name, setTimeout(loop, 5000));
                return;
            }

            if (feature.enabled(this.client)) {
                try {
                    await feature.run(this.client);
                } catch (error: any) {
                    logger.error(`Error in feature ${feature.name}: ${error.message}`);
                }
            }

            // Schedule next run
            const delay = feature.cooldown();
            this.timeouts.set(feature.name, setTimeout(loop, delay));
        };

        // Start initial loop with staggered delay to prevent burst
        // Random 1-5s BASE + (Index * 3-5s) Stagger
        const stagger = index * 4000;
        const initialDelay = Helper.random(1000, 3000) + stagger;

        logger.info(`[LoopHandler] Scheduled ${feature.name} to start in ${(initialDelay / 1000).toFixed(1)}s`);
        this.timeouts.set(feature.name, setTimeout(loop, initialDelay));
    }
}
