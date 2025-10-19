const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { embed_color, emojis, red, green, yellow } = require('../../utils/constants');

module.exports = {
    name: 'say',
    async execute(client, message, args) {

        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            const embed = new EmbedBuilder()
            .setColor(red)
            .setDescription(`${emojis.cross} You do not have permission to use this command.`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        // Check if channel mention/ID is provided
        let targetChannel = message.channel;
        let textIndex = 0;
        
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
                textIndex = 1; // Move to next argument for text
            } catch (error) {
                const embed = new EmbedBuilder()
                    .setColor(red)
                    .setDescription(`${emojis.cross} Invalid channel provided.`);
                return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
            }
        }

        const text = args.slice(textIndex).join(' ');

        if (!text) {
            const embed = new EmbedBuilder()
            .setColor(yellow)
            .setDescription(`${emojis.error} Please provide a message.\nUsage: \`!say [channel] <message>\``);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        message.delete().catch(console.error);

        // Send message to the target channel
        targetChannel.send(text);
    }
}