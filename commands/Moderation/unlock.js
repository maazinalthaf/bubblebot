const { EmbedBuilder, PermissionsBitField, AllowedMentionsTypes } = require('discord.js');
const { emojis, embed_color, red, green, yellow } = require('../../utils/constants.js');

module.exports = {
    name: 'unlock',
    description: 'Unlocks the current channel to allow members to send messages',
    async execute(client, message, args) {
        // Check if user has permission to manage channels
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            const embed = new EmbedBuilder()
                .setColor(yellow)
                .setDescription(`${emojis.error} You don't have permission to unlock channels.`);
           return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }

        const channel = message.channel;

        try {
            // Unlock the channel for @everyone
            await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                SendMessages: null // Reset to default
            });

            const embed = new EmbedBuilder()
                .setColor(green)
                .setDescription(`${emojis.tick} ${channel} has been unlocked.`);
            
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        } catch (error) {
            const embed = new EmbedBuilder()
                .setColor(red)
                .setDescription(`${emojis.cross} Failed to unlock the channel.`);
            
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }
    }
};