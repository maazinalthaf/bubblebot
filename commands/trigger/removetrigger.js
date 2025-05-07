const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const triggersPath = path.join(__dirname, '../triggers.json');

module.exports = {
    name: 'removetrigger',
    aliases: ['rt'],
    description: 'Remove an auto-response trigger (supports multi-word triggers in quotes)',
    usage: '.removetrigger "<word or phrase>" OR .rt "<word or phrase>"',
    permissions: ['ManageMessages'],
    async execute(client, message, args) {
        if (!message.member.permissions.has('ManageMessages')) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#ffcc32')
                        .setDescription('<:error:1332418281675558963> You need the **Manage Messages** permission to use this command.')
                ]
            });
        }

        if (args.length < 1) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#ffcc32')
                        .setDescription('<:error:1332418281675558963> Usage: `.removetrigger "<word or phrase>"`\nExample: `.removetrigger "hello there"`')
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
                        .setColor('#c83636')
                        .setDescription('<:cross:1332418251849732206> Failed to load triggers.')
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
                            .setColor('#ffcc32')
                            .setDescription('<:error:1332418281675558963> Invalid format. Make sure to close your quotes.\nUsage: `.removetrigger "<word or phrase>"`')
                    ]
                });
            }
            
            triggerPhrase = fullText.slice(firstQuote + 1, secondQuote).toLowerCase();
        } else {
            triggerPhrase = args[0].toLowerCase();
        }

        if (!triggers[triggerPhrase]) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#ffcc32')
                        .setDescription(`<:error:1332418281675558963> No trigger found for \`${triggerPhrase}\``)
                ]
            });
        }

        delete triggers[triggerPhrase];
        
        try {
            fs.writeFileSync(triggersPath, JSON.stringify(triggers, null, 2));
            // Update triggers in memory without restart
            if (client.triggerManager) {
                client.triggerManager.reloadTriggers(triggers);
            }
        } catch (error) {
            console.error('Error writing to triggers.json:', error);
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#C83636')
                        .setDescription('<:cross:1332418251849732206> Failed to remove the trigger.')
                ]
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#77b255')
            .setDescription(`<:tick:1332418339372273684> **Trigger Removed**\nThe bot will no longer respond to \`${triggerPhrase}\``)
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    }
};