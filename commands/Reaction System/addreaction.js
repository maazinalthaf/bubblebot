const {embed_color, emojis } = require('../../utils/constants');
const {EmbedBuilder, PermissionsBitField} = require('discord.js');
const fs = require('fs');
const path = require('path');
const reactionsPath = path.join(__dirname, '../../reactions.json');

module.exports = {
    name: 'addreaction',
    aliases: ['ar'],
    async execute(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuildExpressions)) {
            const embed = new EmbedBuilder()
                .setColor('#C83636')
                .setDescription(`${emojis.cross} You do not have permission to use this command.`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }
   
        // Process the addreaction command...
        const word = args[0];
        const reactionsToAdd = args.slice(1);
    
        if (!word || reactionsToAdd.length === 0) {
            const embed = new EmbedBuilder()
                .setColor('#FFCC32')
                .setDescription(`${emojis.error} Please provide a word and at least one reaction.`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        // Load reactions
        let reactions = {};
        try {
            reactions = JSON.parse(fs.readFileSync(reactionsPath, 'utf8'));
        } catch (error) {
            console.error('Error reading reactions.json:', error);
        }

        // Initialize server-specific reactions if they don't exist
        const guildId = message.guild.id;
        if (!reactions[guildId]) {
            reactions[guildId] = {};
        }
    
        // Check if a similar word already exists
        if (reactions[guildId][word]) {
            const embed = new EmbedBuilder()
                .setColor('#FFCC32')
                .setDescription(`${emojis.error} The word "${word}" already has a reaction associated with it in this server.`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }
    
        // Add the new reaction
        reactions[guildId][word] = reactionsToAdd;
    
        saveReactions(reactions);
        client.triggerManager.reloadReactions(reactions); 
        const embed = new EmbedBuilder()
            .setColor('#77B255')
            .setDescription(`${emojis.tick} Reaction(s) ${reactionsToAdd.join(', ')} added for word "${word}" in this server.`);
        message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
    }
};
     
// Dependent Function(s)
function saveReactions(reactions) {
    fs.writeFileSync('./reactions.json', JSON.stringify(reactions, null, 2), 'utf8');
}