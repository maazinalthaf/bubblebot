const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { emojis, embed_color } = require('../../utils/constants.js');

module.exports = {
    name: 'lock',
    description: 'Locks the current channel to prevent members from sending messages',
    async execute(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            const embed = new EmbedBuilder()
                .setColor('#ffcc32')
                .setDescription(`${emojis.error} You don't have permission to lock channels.`);
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }

        const channel = message.channel;

        try {
            // Lock the channel for @everyone
            await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                SendMessages: false
            });

            const embed = new EmbedBuilder()
                .setColor('#77b255')
                .setDescription(`${emojis.tick} ${channel} has been locked.`);
            
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        } catch (error) {
            console.error('Error locking channel:', error);
            const embed = new EmbedBuilder()
                .setColor('#c83636')
                .setDescription(`${emojis.cross} Failed to lock the channel.`);
            
           return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }
    }
};