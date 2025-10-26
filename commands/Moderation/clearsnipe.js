const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const {embed_color, emojis, red, green, yellow } = require('../../utils/constants.js');

module.exports = {
    name: 'clearsnipe',
    aliases: ['cs', 'clearsnipes'],
    async execute(client, message, args) {
        // Get snipes from client
        const snipes = client.snipes;

        // Check if the user has permission to use the command
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            const embed = new EmbedBuilder()
                .setColor(red)
                .setDescription(`${emojis.cross} You do not have permission to use this command.`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        // Check if there are any snipes to clear
        if (!snipes.has(message.channel.id) || snipes.get(message.channel.id).length === 0) {
            const embed = new EmbedBuilder()
                .setColor(yellow)
                .setDescription(`${emojis.error} There are no sniped messages to clear!`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        // Clear snipes for the current channel
        snipes.delete(message.channel.id);

        // Send success message
        const embed = new EmbedBuilder()
            .setColor(green)
            .setDescription(`${emojis.tick} Successfully cleared all sniped messages in this channel.`);

        message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
    }
};