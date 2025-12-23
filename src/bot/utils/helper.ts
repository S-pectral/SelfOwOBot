export class Helper {
    /**
     * Sleep for a specific amount of time
     * @param ms Time in milliseconds
     */
    static sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get a random number between min and max
     * @param min Minimum value
     * @param max Maximum value
     */
    static random(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Get a random element from an array
     * @param array The array to pick from
     */
    static randomElement<T>(array: T[]): T {
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * Sleep for a random amount of time between min and max
     * @param min Minimum time in ms
     * @param max Maximum time in ms
     */
    static async randomSleep(min: number, max: number): Promise<void> {
        const time = this.random(min, max);
        await this.sleep(time);
    }

    /**
     * Wait for a message in a channel matching a filter
     */
    static waitForMessage(channel: any, options: { filter: (m: any) => boolean, time: number }): Promise<any> {
        return new Promise(resolve => {
            const collector = channel.createMessageCollector(options);
            collector.on('collect', (m: any) => {
                resolve(m);
                collector.stop();
            });
            collector.on('end', (collected: any) => {
                if (collected.size === 0) resolve(null);
            });
        });
    }
    /**
     * Parse duration string to milliseconds
     * @param str Duration string (e.g. "1h", "30m", "45s")
     */
    static parseTime(str: string): number | null {
        if (!str) return null;
        const match = str.match(/^(\d+)([smhd])$/);
        if (!match) return null;

        const value = parseInt(match[1]);
        const unit = match[2];

        switch (unit) {
            case 's': return value * 1000;
            case 'm': return value * 60 * 1000;
            case 'h': return value * 60 * 60 * 1000;
            case 'd': return value * 24 * 60 * 60 * 1000;
            default: return null;
        }
    }

    static formatTime(ms: number): string {
        const s = Math.floor((ms / 1000) % 60);
        const m = Math.floor((ms / (1000 * 60)) % 60);
        const h = Math.floor((ms / (1000 * 60 * 60)) % 24);

        const parts = [];
        if (h > 0) parts.push(`${h}h`);
        if (m > 0) parts.push(`${m}m`);
        if (s > 0) parts.push(`${s}s`);

        return parts.join(' ') || '0s';
    }
}
