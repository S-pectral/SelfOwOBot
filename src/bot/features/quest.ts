import { IBotClient } from '../types.js';
import { Helper } from '../utils/helper.js';
import { logger } from '../utils/logger.js';

export const AutoQuest = {
    name: "AutoQuest",
    enabled: (client: IBotClient) => client.config.autoQuest,
    cooldown: () => Helper.random(300000, 600000), // Check quests every 5-10 mins
    run: async (client: IBotClient) => {
        if (client.paused || client.captchaDetected) return;
        const channel = await client.channels.fetch(client.config.channelId[0]);
        if (!channel || !channel.isText()) return;

        // 1. Check Quest
        // We can't easily "await" the specific response message in this loop structure 
        // without blocking everything else. 
        // A better approach for quests is:
        // - Send 'owo quest'
        // - In `client.on('messageCreate')` (or a specific collector), listen for the quest embed.
        // - Parse and execute.

        // For now, let's just trigger the command. The parsing logic should ideally be 
        // in a separate event listener or we add a "QuestParser" utility.
        // But to keep it simple within "features": 
        // We will send the command, and if we want to act, we rely on the main message handler 
        // or we just blindly perform common quest actions if we know they are active.

        // Since we can't see the response easily here, we will just Log for now:
        await channel.send('owo quest');
        logger.info('Quest: Checked status');

        // TODO: Implement a MessageCollector here to read the quest?
        // That might block the thread. 
        // Ideally, `BotClient` should emit events or `QuestBot` should attach a temporary listener.
    }
};
