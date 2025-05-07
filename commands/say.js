const {EmbedBuilder, PermissionsBitField} = require('discord.js');

module.exports = {
    name: 'say',
    async execute(client, message, args) {

if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
    const embed = new EmbedBuilder()
    .setColor('#C83636')
    .setDescription(`<:cross:1332418251849732206> You do not have permission to use this command.`);
    return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
  }

  
  const text = args.join(' ');

  
  if (!text) {
    const embed = new EmbedBuilder()
    .setColor('#FFCC32')
    .setDescription(`<:error:1332418281675558963> Please provide a message.`);
    return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
  }

  
  message.delete().catch(console.error);

  
  message.channel.send(text);
    }
}