import { IBotClient } from '../types.js';
import { Message, MessageActionRow, MessageButton } from 'discord.js-selfbot-v13';
import { Command } from './types.js';
import { logger } from '../utils/logger.js';
import { Helper } from '../utils/helper.js';

export const Send: Command = {
    name: "send",
    description: "Send owo currency safely",
    usage: "send <user> <amount>",
    execute: async (client: IBotClient, message: Message, args: string[]) => {
        if (!message.guild || args.length < 2) return;

        const [userArg, amountArg] = args;

        // Trigger command
        await message.channel.send(`owo give ${userArg} ${amountArg}`);

        // Wait for OwO confirmation message with button
        const confirmMsg = await Helper.waitForMessage(message.channel, {
            filter: (m) => m.author.id === "408785106942164992" &&
                m.embeds.length > 0 &&
                m.components.length > 0 &&
                m.embeds[0].description?.includes(amountArg), // Rough verification
            time: 15000
        });

        if (confirmMsg) {
            // Click the Confirm button
            const row = confirmMsg.components[0] as MessageActionRow;
            if (row) {
                const button = row.components.find(c => c.type === 'BUTTON' && (c as MessageButton).style === 'SUCCESS' || (c as MessageButton).label === 'Confirm');
                if (button && button.type === 'BUTTON') {
                    try {
                        // Need to use the interaction API or a helper if available, 
                        // but discord.js-selfbot-v13 supports clickButton on message if polyfilled, 
                        // or we can use customId if available.
                        // Selfbot lib usually exposes clickButton on the message itself (via extension) or component.

                        // Note: In newer djs-selfbot methods, we might need message.clickButton(customId) 
                        // or use invalid interaction.

                        // The source used: `response.clickButton(button.customId)`
                        // Let's assume confirmMsg has this method.

                        if ('clickButton' in confirmMsg && typeof (confirmMsg as any).clickButton === 'function') {
                            await (confirmMsg as any).clickButton(button.customId);
                            logger.info(`[Send] Auto-confirmed transfer to ${userArg}`);
                        } else {
                            logger.warn("[Send] Could not find clickButton method on message.");
                        }
                    } catch (err: any) {
                        logger.error(`[Send] Failed to click confirm: ${err.message}`);
                    }
                }
            }
        }
    }
};
