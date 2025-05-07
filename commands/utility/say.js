const {EmbedBuilder, PermissionsBitField} = require('discord.js');
const { EMBED_COLORS, EMOJIS, PREFIX } = require('../../config/constants');

module.exports = {
    name: 'say',
    async execute(client, message, args) {

if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
    const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.ERROR)
    .setDescription(`${EMOJIS.CROSS} You do not have permission to use this command.`);
    return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
  }

  
  const text = args.join(' ');

  
  if (!text) {
    const embed = new EmbedBuilder()
    .setColor(EMBED_COLORS.WARNING)
    .setDescription(`${EMOJIS.ERROR} Please provide a message.`);
    return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
  }

  
  message.delete().catch(console.error);

  
  message.channel.send(text);
    }
}