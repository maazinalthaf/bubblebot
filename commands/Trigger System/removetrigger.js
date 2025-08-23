const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { getPrefix } = require('../../utils/prefix');
const triggersPath = path.join(__dirname, '../../triggers.json');
const {embed_color, emojis } = require('../../utils/constants');

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

        let triggers = {};
        try {
            triggers = JSON.parse(fs.readFileSync(triggersPath, 'utf8'));
        } catch (error) {
            console.error('Error reading triggers.json:', error);
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(red)
                        .setDescription(`${emojis.cross} Failed to load triggers.`)
                ]
            });
        }

        const guildId = message.guild.id;
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
            fs.writeFileSync(triggersPath, JSON.stringify(triggers, null, 2));
            if (client.triggerManager) {
                client.triggerManager.reloadTriggers(triggers);
            }
        } catch (error) {
            console.error('Error writing to triggers.json:', error);
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