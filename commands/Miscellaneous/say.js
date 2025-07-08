const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { embed_color, emojis } = require('../../utils/constants');

module.exports = {
    name: 'say',
    async execute(client, message, args) {

if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
    const embed = new EmbedBuilder()
    .setColor('#C83636')
    .setDescription(`${emojis.cross} You do not have permission to use this command.`);
    return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
  }

  
  const text = args.join(' ');

  
  if (!text) {
    const embed = new EmbedBuilder()
    .setColor('#FFCC32')
    .setDescription(`${emojis.error} Please provide a message.`);
    return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
  }

  
  message.delete().catch(console.error);

  
  message.channel.send(text);
    }
}
