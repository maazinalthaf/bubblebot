const {EmbedBuilder, PermissionsBitField} = require('discord.js');
const fs = require('fs');
const reactions = require('../reactions.json')

module.exports = {
    name: 'removereaction',
    aliases: ['rreaction'],
    async execute(client, message, args) {
if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuildExpressions)) {
    const embed = new EmbedBuilder()
    .setColor('#F92F60')
    .setDescription(`❌ You do not have permission to use this command.`);
    return message.channel.send({ embeds: [embed] });
  }

  // Process the removereaction command...
  const word = args[0];

  if (!word) {
    const embed = new EmbedBuilder()
    .setColor('#F6CF57')
    .setDescription(`⚠️ Please provide a word to remove the reaction.`);
    return message.channel.send({ embeds: [embed] });
  }

  if (!reactions[word]) {
    const embed = new EmbedBuilder()
    .setColor('#F6CF57')
    .setDescription(`⚠️ There is no reaction associated with the word **"${word}"**.`);
    return message.channel.send({ embeds: [embed] });
  }

  delete reactions[word];
  saveReactions();
  const embed = new EmbedBuilder()
    .setColor('#77B255')
    .setDescription(`✅ Reaction removed for word "${word}".`);
  message.channel.send({ embeds: [embed] });
    }
}

// Dependent Function(s)
function saveReactions() {
    fs.writeFileSync('./reactions.json', JSON.stringify(reactions, null, 2), 'utf8');
  }