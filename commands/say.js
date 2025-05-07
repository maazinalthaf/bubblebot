const {EmbedBuilder, PermissionsBitField} = require('discord.js');

module.exports = {
    name: 'say',
    async execute(client, message, args) {
// Check if the user has permission to use the say command
if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
    const embed = new EmbedBuilder()
    .setColor('#C83636')
    .setDescription(`<:cross:1332418251849732206> You do not have permission to use this command.`);
    return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
  }

  // Get the text to be said
  const text = args.join(' ');

  // Check if no message is provided
  if (!text) {
    const embed = new EmbedBuilder()
    .setColor('#FFCC32')
    .setDescription(`<:error:1332418281675558963> Please provide a message.`);
    return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
  }

  // Delete the message that triggered the command
  message.delete().catch(console.error);

  // Send the text back to the channel
  message.channel.send(text);
    }
}