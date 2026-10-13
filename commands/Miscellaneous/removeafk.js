const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const database = require('../../utils/database');
const {embed_color, emojis, red, green, yellow } = require('../../utils/constants');

module.exports = {
    name: 'removeafk',
    aliases: ['rafk'],
    async execute(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const embed = new EmbedBuilder()
                .setColor(red)
                .setDescription(`${emojis.cross} You do not have permission to use this command.`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        const mention = message.mentions.users.first();

        if (!mention) {
            const embed = new EmbedBuilder()
                .setColor(yellow)
                .setDescription(`${emojis.error} Please mention a user to remove their AFK status.`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        const userId = mention.id;

        if (database.getAfk(userId)) {
            database.deleteAfk(userId);

            const embed = new EmbedBuilder()
                .setColor(green)
                .setDescription(`${emojis.tick} AFK status removed for ${mention}.`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        } else {
            const embed = new EmbedBuilder()
                .setColor(red)
                .setDescription(`${emojis.cross} ${mention} is not AFK.`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }
    }
};
