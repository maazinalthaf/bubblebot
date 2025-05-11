const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const {embed_color, emojis, prefix } = require('../../constants');
const triggersPath = path.join(__dirname, '../../triggers.json');

module.exports = {
    name: 'addtrigger',
    aliases: ['at'],
    description: 'Add an auto-response trigger (supports multiple words in quotes)',
    usage: '.addtrigger "<word or phrase>" <response> OR .at "<word or phrase>" <response>',
    permissions: ['ManageMessages'],
    async execute(client, message, args) {
        if (!message.member.permissions.has('ManageMessages')) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FFcc32')
                        .setDescription(`${emojis.error} You need the **Manage Messages** permission to use this command.`)
                ]
            });
        }

        if (args.length < 2) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FFcc32')
                        .setDescription(`${emojis.error} Usage: \`.addtrigger "<word or phrase>" <response>\`\nExample: \`.addtrigger "hello there" "Hi! How can I help?"\``)
                ]
            });
        }

        let triggers = {};
        try {
            triggers = JSON.parse(fs.readFileSync(triggersPath, 'utf8'));
        } catch (error) {
            console.error('Error reading triggers.json:', error);
        }

        // Check if the first argument is quoted (for multi-word triggers)
        let triggerPhrase;
        let response;
        
        if (args[0].startsWith('"') && args.join(' ').includes('" ')) {
            const firstQuote = args.join(' ').indexOf('"');
            const secondQuote = args.join(' ').indexOf('" ', firstQuote + 1);
            
            if (secondQuote === -1) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#c83636')
                            .setDescription(`${emojis.cross} Invalid format. Make sure to close your quotes.\nUsage: \`.addtrigger "<word or phrase>" <response> \``)
                    ]
                });
            }
            
            triggerPhrase = args.join(' ').slice(firstQuote + 1, secondQuote).toLowerCase();
            response = args.join(' ').slice(secondQuote + 2).trim();
        } else {
            triggerPhrase = args[0].toLowerCase();
            response = args.slice(1).join(' ');
        }

        triggers[triggerPhrase] = response;
        
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
                        .setDescription(`${emojis.cross} Failed to save the trigger.`)
                ]
            });
        }

        const embed = new EmbedBuilder()
            .setColor('#77b255')
            .setDescription(`${emojis.tick} **Trigger Added**\nThe bot will now respond to \`${triggerPhrase}\` with:\n\n${response}`)
            .setTimestamp();

        return message.reply({ embeds: [embed] , allowedMentions: {repliedUser: false}});
    }
};
