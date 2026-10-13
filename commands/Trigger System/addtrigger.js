const { EmbedBuilder } = require('discord.js');
const { embed_color, emojis, red, green, yellow } = require('../../utils/constants');
const database = require('../../utils/database');
const { getPrefix } = require('../../utils/prefix');

module.exports = {
    name: 'addtrigger',
    aliases: ['at'],
    description: 'Add an auto-response trigger (supports multiple words in quotes)',
    usage: '.addtrigger "<word or phrase>" <response> OR .at "<word or phrase>" <response>',
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

        if (args.length < 2) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(yellow)
                        .setDescription(`${emojis.error} Usage: \`${prefix}addtrigger "<word or phrase>" <response>\`\nExample: \`${prefix}addtrigger "hello there" "Hi! How can I help?"\``)
                ]
            });
        }

        const guildId = message.guild.id;

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
                            .setColor(red)
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

        try {
            database.setTrigger(guildId, triggerPhrase, response);
            // Update triggers in memory without restart
            if (client.triggerManager) {
                client.triggerManager.reloadTriggers(database.getTriggers());
            }
        } catch (error) {
            console.error('Error writing trigger to database:', error);
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(red)
                        .setDescription(`${emojis.cross} Failed to save the trigger.`)
                ]
            });
        }

        const embed = new EmbedBuilder()
            .setColor(green)
            .setDescription(`${emojis.tick} **Trigger Added**\nThe bot will now respond to \`${triggerPhrase}\` with:\n\n${response}`)
            .setTimestamp();

        return message.reply({ embeds: [embed] , allowedMentions: {repliedUser: false}});
    }
};
