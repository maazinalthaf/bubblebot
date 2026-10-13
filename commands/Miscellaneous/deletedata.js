const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const database = require('../../utils/database');
const { emojis, green, red, yellow } = require('../../utils/constants');

module.exports = {
    name: 'deletedata',
    aliases: ['privacydelete'],
    description: 'Delete your stored Bubblebot data',
    async execute(client, message) {
        if (message.guild && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            database.deleteUserData(message.author.id);
            database.deleteGuildData(message.guild.id);
            client.clearGuildSnipeData(message.guild.id);
            client.clearUserSnipeData(message.author.id);
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(green)
                        .setDescription(`${emojis.tick} Stored data for this server and your user account has been deleted.`)
                ],
                allowedMentions: { repliedUser: false }
            });
        }

        database.deleteUserData(message.author.id);
        client.clearUserSnipeData(message.author.id);
        return message.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(green)
                    .setDescription(`${emojis.tick} Your stored Bubblebot data has been deleted.`)
            ],
            allowedMentions: { repliedUser: false }
        });
    }
};
