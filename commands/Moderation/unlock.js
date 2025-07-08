const { EmbedBuilder, PermissionsBitField, AllowedMentionsTypes } = require('discord.js');
const { emojis, embed_color } = require('../../constants.js');

module.exports = {
    name: 'unlock',
    description: 'Unlocks the current channel to allow members to send messages',
    async execute(client, message, args) {
        // Check if user has permission to manage channels
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            const embed = new EmbedBuilder()
                .setColor('#ffcc32')
                .setDescription(`${emojis.error} You don't have permission to unlock channels.`);
            message.reply({ embeds: [embed] , AllowedMentions :{ repliedUser: false }});
        }

        const channel = message.channel;

        try {
            // Unlock the channel for @everyone
            await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                SendMessages: null // Reset to default
            });

            const embed = new EmbedBuilder()
                .setColor('#77b255')
                .setDescription(`${emojis.tick} ${channel} has been unlocked.`);
            
            message.reply({ embeds: [embed] , AllowedMentions :{ repliedUser: false }});
        } catch (error) {
            const embed = new EmbedBuilder()
                .setColor('#c83636')
                .setDescription(`${emojis.cross} Failed to unlock the channel.`);
            
            message.reply({ embeds: [embed] , AllowedMentions :{ repliedUser: false }});
        }
    }
};