const {EmbedBuilder, PermissionsBitField} = require('discord.js');
const fs = require('fs');
const path = require('path');
const reactionsPath = path.join(__dirname, '../../reactions.json');
const {embed_color, emojis } = require('../../utils/constants');

module.exports = {
    name: 'removereaction',
    aliases: ['rr'],
    async execute(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuildExpressions)) {
            const embed = new EmbedBuilder()
                .setColor('#C83636')
                .setDescription(`${emojis.cross} You do not have permission to use this command.`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        // Process the removereaction command...
        const word = args[0];

        if (!word) {
            const embed = new EmbedBuilder()
                .setColor('#FFCC32')
                .setDescription(`${emojis.error} Please provide a word to remove the reaction.`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        // Load reactions
        let reactions = {};
        try {
            reactions = JSON.parse(fs.readFileSync(reactionsPath, 'utf8'));
        } catch (error) {
            console.error('Error reading reactions.json:', error);
            const embed = new EmbedBuilder()
                .setColor('#C83636')
                .setDescription(`${emojis.cross} Failed to load reactions.`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        const guildId = message.guild.id;
        if (!reactions[guildId] || !reactions[guildId][word]) {
            const embed = new EmbedBuilder()
                .setColor('#FFCC32')
                .setDescription(`${emojis.error} There is no reaction associated with the word **"${word}"** in this server.`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        delete reactions[guildId][word];
        saveReactions(reactions);
        client.triggerManager.reloadReactions(reactions); 
        const embed = new EmbedBuilder()
            .setColor('#77B255')
            .setDescription(`${emojis.tick} Reaction removed for word "${word}" in this server.`);
        message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
    }
}

// Dependent Function(s)
function saveReactions(reactions) {
    fs.writeFileSync('./reactions.json', JSON.stringify(reactions, null, 2), 'utf8');
}