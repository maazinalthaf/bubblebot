const {EmbedBuilder, PermissionsBitField} = require('discord.js');
const database = require('../../utils/database');
const {embed_color, emojis, red, green, yellow } = require('../../utils/constants');

module.exports = {
    name: 'removereaction',
    aliases: ['rr'],
    async execute(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuildExpressions)) {
            const embed = new EmbedBuilder()
                .setColor(red)
                .setDescription(`${emojis.cross} You do not have permission to use this command.`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        // Process the removereaction command...
        const word = args[0];

        if (!word) {
            const embed = new EmbedBuilder()
                .setColor(yellow)
                .setDescription(`${emojis.error} Please provide a word to remove the reaction.`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        const guildId = message.guild.id;
        const reactions = database.getReactions();
        if (!reactions[guildId] || !reactions[guildId][word]) {
            const embed = new EmbedBuilder()
                .setColor(yellow)
                .setDescription(`${emojis.error} There is no reaction associated with the word **"${word}"** in this server.`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        database.deleteReaction(guildId, word);
        client.triggerManager.reloadReactions(database.getReactions()); 
        const embed = new EmbedBuilder()
            .setColor(green)
            .setDescription(`${emojis.tick} Reaction removed for word "${word}" in this server.`);
        message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
    }
}
