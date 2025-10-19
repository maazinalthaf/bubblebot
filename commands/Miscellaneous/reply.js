const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const {embed_color, emojis, red, green, yellow } = require('../../utils/constants');

module.exports = {
    name: 'reply',
    async execute(client, message, args) {

        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            const embed = new EmbedBuilder()
            .setColor(red)
            .setDescription(`${emojis.cross} You do not have permission to use this command.`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        // Check if channel mention/ID is provided
        let targetChannel = message.channel;
        let messageIdIndex = 0;
        
        // Check if first argument is a channel mention/ID
        if (args[0] && (args[0].startsWith('<#') && args[0].endsWith('>') || /^\d+$/.test(args[0]))) {
            const channelId = args[0].replace(/[<#>]/g, '');
            try {
                targetChannel = await message.guild.channels.fetch(channelId);
                if (!targetChannel || !targetChannel.isTextBased()) {
                    const embed = new EmbedBuilder()
                        .setColor(red)
                        .setDescription(`${emojis.cross} Invalid channel provided.`);
                    return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
                }
                messageIdIndex = 1; // Move to next argument for message ID
            } catch (error) {
                const embed = new EmbedBuilder()
                    .setColor(red)
                    .setDescription(`${emojis.cross} Invalid channel provided.`);
                return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
            }
        }

        const messageId = args[messageIdIndex];

        // Check if a message ID is provided
        if (!messageId) {
            const embed = new EmbedBuilder()
                .setColor(yellow)
                .setDescription(`${emojis.error} Please provide a message ID to reply to.\nUsage: \`!reply [channel] <messageId> <text>\``);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        const text = args.slice(messageIdIndex + 1).join(' ');

        // Check if no message is provided to reply with
        if (!text) {
            const embed = new EmbedBuilder()
                .setColor(yellow)
                .setDescription(`${emojis.error} Please provide a message to reply with.\nUsage: \`!reply [channel] <messageId> <text>\``);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        // Fetch the message using the provided message ID from the target channel
        targetChannel.messages.fetch(messageId)
            .then(replyMessage => {
                // Reply to the fetched message with the specified text
                replyMessage.reply(text)
                    .then(() => {
                        message.delete(); // Delete the command message
                    })
                    .catch(error => {
                        console.error('Error replying to message:', error);
                        const embed = new EmbedBuilder()
                            .setColor(red)
                            .setDescription(`${emojis.cross} Failed to reply to the message.`);
                        return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
                    });
            })
            .catch(error => {
                console.error('Error fetching message:', error);
                const embed = new EmbedBuilder()
                    .setColor(red)
                    .setDescription(`${emojis.cross} Failed to fetch the message with the provided ID in that channel.`);
                return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
            });
    }
}