const {EmbedBuilder, PermissionsBitField} = require('discord.js');
const fs = require('fs');
const reactions = require('../reactions.json')

module.exports = {
    name: 'addreaction',
    aliases: ['areaction'],
    async execute(client, message, args) {
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuildExpressions)) {
        const embed = new EmbedBuilder()
       .setColor('#F92F60')
       .setDescription(`❌ You do not have permission to use this command.`);
       return message.channel.send({ embeds: [embed] });
 
     }
   
     // Process the addreaction command...
     const word = args[0];
     const reactionsToAdd = args.slice(1);
   
     if (!word || reactionsToAdd.length === 0) {
       const embed = new EmbedBuilder()
       .setColor('#F6CF57')
       .setDescription(`⚠️ Please provide a word and at least one reaction.`);
       return message.channel.send({ embeds: [embed] });
     }
   
     // Check if a similar word already exists
     if (reactions[word]) {
       const embed = new EmbedBuilder()
           .setColor('#F6CF57')
           .setDescription(`⚠️ The word "${word}" already has a reaction associated with it.`);
       return message.channel.send({ embeds: [embed] });
     }
 
   
     // Add the new reaction
     reactions[word] = reactionsToAdd;
 
     saveReactions();
     const embed = new EmbedBuilder()
       .setColor('#77B255')
       .setDescription(`✅ Reactions ${reactionsToAdd.join(', ')} added for word "${word}".`);
       message.channel.send({ embeds: [embed] });
   }
 }
     

// Dependent Function(s)
function saveReactions() {
    fs.writeFileSync('./reactions.json', JSON.stringify(reactions, null, 2), 'utf8');
  }