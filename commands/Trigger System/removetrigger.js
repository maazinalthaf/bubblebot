const { EmbedBuilder } = require('discord.js');
const { getPrefix } = require('../../utils/prefix');
const database = require('../../utils/database');
const {embed_color, emojis, red, green, yellow } = require('../../utils/constants');

module.exports = {
    name: 'removetrigger',
    aliases: ['rt'],
    description: 'Remove an auto-response trigger (supports multi-word triggers in quotes)',
    usage: '.removetrigger "<word or phrase>" OR .rt "<word or phrase>"',
    permissions: ['ManageMessages'],
    async execute(client, message, args) {
        const prefix = getPrefix(message.guild?.id);
        if (!message.member.permissions.has('ManageMessages')) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(yellow)
                        .setDescription(`${emojis.error} You need the **Manage Messages** permission to use this command.`)
                ]
            });
        }

        if (args.length < 1) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(yellow)
                        .setDescription(`${emojis.error} Usage: \`${prefix}removetrigger "<word or phrase>"\`\nExample: \`${prefix}removetrigger "hello there"\``)
                ]
            });
        }

        const guildId = message.guild.id;
        const triggers = database.getTriggers();
        if (!triggers[guildId]) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(yellow)
                        .setDescription(`${emojis.error} No triggers found for this server.`)
                ]
            });
        }

        let triggerPhrase;
        if (args[0].startsWith('"') && args.join(' ').includes('"')) {
            const fullText = args.join(' ');
            const firstQuote = fullText.indexOf('"');
            const secondQuote = fullText.indexOf('"', firstQuote + 1);
            
            if (secondQuote === -1) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(yellow)
                            .setDescription(`${emojis.error} Invalid format. Make sure to close your quotes.\nUsage: \`.removetrigger "<word or phrase>"\``)
                    ]
                });
            }
            
            triggerPhrase = fullText.slice(firstQuote + 1, secondQuote).toLowerCase();
        } else {
            triggerPhrase = args[0].toLowerCase();
        }

        if (!triggers[guildId][triggerPhrase]) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(yellow)
                        .setDescription(`${emojis.error} No trigger found for \`${triggerPhrase}\``)
                ]
            });
        }

        delete triggers[guildId][triggerPhrase];
        
        try {
            database.deleteTrigger(guildId, triggerPhrase);
            if (client.triggerManager) {
                client.triggerManager.reloadTriggers(database.getTriggers());
            }
        } catch (error) {
            console.error('Error removing trigger from database:', error);
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(red)
                        .setDescription(`${emojis.cross} Failed to remove the trigger.`)
                ]
            });
        }

        const embed = new EmbedBuilder()
            .setColor(green)
            .setDescription(`${emojis.tick} **Trigger Removed**\nThe bot will no longer respond to \`${triggerPhrase}\``)
            .setTimestamp();

        return message.reply({ embeds: [embed] , allowedMentions: {repliedUser: false} });
    }
};