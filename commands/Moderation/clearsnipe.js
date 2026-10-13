const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const {embed_color, emojis, red, green, yellow } = require('../../utils/constants.js');

module.exports = {
    name: 'clearsnipe',
    aliases: ['cs', 'clearsnipes'],
    async execute(client, message, args) {
        const snipes = client.snipes;
        const editsnipes = client.editsnipes;

        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            const embed = new EmbedBuilder()
                .setColor(red)
                .setDescription(`${emojis.cross} You do not have permission to use this command.`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        const hasSnipes = snipes.has(message.channel.id) && snipes.get(message.channel.id).length > 0;
        const hasEditsnipes = editsnipes.has(message.channel.id) && editsnipes.get(message.channel.id).length > 0;
        if (!hasSnipes && !hasEditsnipes) {
            const embed = new EmbedBuilder()
                .setColor(yellow)
                .setDescription(`${emojis.error} There are no sniped messages to clear!`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        snipes.delete(message.channel.id);
        editsnipes.delete(message.channel.id);

        const embed = new EmbedBuilder()
            .setColor(green)
            .setDescription(`${emojis.tick} Successfully cleared all sniped messages in this channel.`);

        message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
    }
};