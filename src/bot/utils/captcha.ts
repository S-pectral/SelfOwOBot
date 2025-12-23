import { Solver } from '2captcha';
import { logger } from './logger.js';

export class CaptchaSolver {
    private solver: any;

    constructor(apiKey: string, provider: string) {
        if (provider === '2captcha' && apiKey) {
            this.solver = new Solver(apiKey);
        }
    }

    async solve(imageUrl: string): Promise<string | null> {
        if (!this.solver) {
            logger.warn('Captcha Solver not configured or provider not supported.');
            return null;
        }

        try {
            logger.info('Solving captcha via 2captcha...');
            // The library 2captcha usually has methods like 'imageCaptcha'
            const res = await this.solver.imageCaptcha({
                body: imageUrl,
                numeric: 4,
                min_len: 3,
                max_len: 6
            });

            // res usually contains { data: 'text', id: '...' }
            if (res && res.data) {
                logger.success(`Captcha solved: ${res.data}`);
                return res.data;
            }
        } catch (error: any) {
            logger.error(`Captcha Solving Failed: ${error.message}`);
        }
        return null;
    }
}
