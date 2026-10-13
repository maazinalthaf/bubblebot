const {embed_color, emojis, red, green, yellow } = require('../../utils/constants');
const {EmbedBuilder, PermissionsBitField} = require('discord.js');
const database = require('../../utils/database');

module.exports = {
    name: 'addreaction',
    aliases: ['ar'],
    async execute(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuildExpressions)) {
            const embed = new EmbedBuilder()
                .setColor(red)
                .setDescription(`${emojis.cross} You do not have permission to use this command.`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }
   
        // Process the addreaction command...
        const word = args[0];
        const reactionsToAdd = args.slice(1);
    
        if (!word || reactionsToAdd.length === 0) {
            const embed = new EmbedBuilder()
                .setColor(yellow)
                .setDescription(`${emojis.error} Please provide a word and at least one reaction.`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        const guildId = message.guild.id;
        const reactions = database.getReactions();
        const serverReactions = reactions[guildId] || {};
    
        // Check if a similar word already exists
        if (serverReactions[word]) {
            const embed = new EmbedBuilder()
                .setColor(yellow)
                .setDescription(`${emojis.error} The word "${word}" already has a reaction associated with it in this server.`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }
    
        // Add the new reaction
        database.setReaction(guildId, word, reactionsToAdd);
        client.triggerManager.reloadReactions(database.getReactions()); 
        const embed = new EmbedBuilder()
            .setColor(green)
            .setDescription(`${emojis.tick} Reaction(s) ${reactionsToAdd.join(', ')} added for word "${word}" in this server.`);
        message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
    }
};
     