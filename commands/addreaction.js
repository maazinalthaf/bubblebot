const {EmbedBuilder, PermissionsBitField} = require('discord.js');
const fs = require('fs');
const reactions = require('../reactions.json')

module.exports = {
    name: 'addreaction',
    aliases: ['ar'],
    async execute(client, message, args) {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuildExpressions)) {
        const embed = new EmbedBuilder()
       .setColor('#C83636')
       .setDescription(`<:cross:1332418251849732206> You do not have permission to use this command.`);
       return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
 
     }
   
     // Process the addreaction command...
     const word = args[0];
     const reactionsToAdd = args.slice(1);
   
     if (!word || reactionsToAdd.length === 0) {
       const embed = new EmbedBuilder()
       .setColor('#FFCC32')
       .setDescription(`<:error:1332418281675558963> Please provide a word and at least one reaction.`);
       return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
     }
   
     // Check if a similar word already exists
     if (reactions[word]) {
       const embed = new EmbedBuilder()
           .setColor('#FFCC32')
           .setDescription(`<:error:1332418281675558963> The word "${word}" already has a reaction associated with it.`);
       return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
     }
 
   
     // Add the new reaction
     reactions[word] = reactionsToAdd;
 
     saveReactions();
     const embed = new EmbedBuilder()
       .setColor('#77B255')
       .setDescription(`<:tick:1332418339372273684> Reaction(s) ${reactionsToAdd.join(', ')} added for word "${word}".`);
       message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
   }
 }
     

// Dependent Function(s)
function saveReactions() {
    fs.writeFileSync('./reactions.json', JSON.stringify(reactions, null, 2), 'utf8');
  }