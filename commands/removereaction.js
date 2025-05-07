const {EmbedBuilder, PermissionsBitField} = require('discord.js');
const fs = require('fs');
const reactions = require('../reactions.json')
const {embed_color, emojis, prefix } = require('../constants');

module.exports = {
    name: 'removereaction',
    aliases: ['rr'],
    async execute(client, message, args) {
if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuildExpressions)) {
    const embed = new EmbedBuilder()
    .setColor('#C83636')
    .setDescription(`${emoji.cross} You do not have permission to use this command.`);
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

  if (!reactions[word]) {
    const embed = new EmbedBuilder()
    .setColor('#FFCC32')
    .setDescription(`${emojis.error} There is no reaction associated with the word **"${word}"**.`);
    return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
  }

  delete reactions[word];
  saveReactions();
  const embed = new EmbedBuilder()
    .setColor('#77B255')
    .setDescription(`${emoji.tick} Reaction removed for word "${word}".`);
  message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
    }
}

// Dependent Function(s)
function saveReactions() {
    fs.writeFileSync('./reactions.json', JSON.stringify(reactions, null, 2), 'utf8');
  }