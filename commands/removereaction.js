const {EmbedBuilder, PermissionsBitField} = require('discord.js');
const fs = require('fs');
const reactions = require('../reactions.json')

module.exports = {
    name: 'removereaction',
    aliases: ['rreaction'],
    async execute(client, message, args) {
if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuildExpressions)) {
    const embed = new EmbedBuilder()
    .setColor('#C83636')
    .setDescription(`<:cross:1283228336666968114> You do not have permission to use this command.`);
    return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
  }

  // Process the removereaction command...
  const word = args[0];

  if (!word) {
    const embed = new EmbedBuilder()
    .setColor('#FFCC32')
    .setDescription(`<:hazard:1283227908491710505> Please provide a word to remove the reaction.`);
    return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
  }

  if (!reactions[word]) {
    const embed = new EmbedBuilder()
    .setColor('#FFCC32')
    .setDescription(`<:hazard:1283227908491710505> There is no reaction associated with the word **"${word}"**.`);
    return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
  }

  delete reactions[word];
  saveReactions();
  const embed = new EmbedBuilder()
    .setColor('#77B255')
    .setDescription(`<:tick:1326247406576210012> Reaction removed for word "${word}".`);
  message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
    }
}

// Dependent Function(s)
function saveReactions() {
    fs.writeFileSync('./reactions.json', JSON.stringify(reactions, null, 2), 'utf8');
  }