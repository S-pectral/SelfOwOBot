import { GlobalConfig } from '../config/config.js';

export interface BotStats {
    totalHunt: number;
    totalBattle: number;
    totalGemsUsed: number;
    totalCowoncyParsed: number;
    zooCount: Record<string, number>;
}

// In-memory stats for now. 
// Can be improved to save to JSON if persistence is needed across restarts.
export const stats: BotStats = {
    totalHunt: 0,
    totalBattle: 0,
    totalGemsUsed: 0,
    totalCowoncyParsed: 0,
    zooCount: {}
};

export const incrementStat = (key: keyof BotStats, amount: number = 1) => {
    if (typeof stats[key] === 'number') {
        (stats[key] as number) += amount;
    }
};

export const updateZooStat = (rarity: string, amount: number = 1) => {
    if (!stats.zooCount[rarity]) stats.zooCount[rarity] = 0;
    stats.zooCount[rarity] += amount;
};

export const getStats = () => stats;
