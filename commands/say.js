const {EmbedBuilder, PermissionsBitField} = require('discord.js');

module.exports = {
    name: 'say',
    async execute(client, message, args) {
// Check if the user has permission to use the ?say command
if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
    const embed = new EmbedBuilder()
    .setColor('#F92F60')
    .setDescription(`❌ You do not have permission to use this command.`);
    return message.channel.send({ embeds: [embed] });
  }

  // Get the text to be said
  const text = args.join(' ');

  // Check if no message is provided
  if (!text) {
    const embed = new EmbedBuilder()
    .setColor('#F6CF57')
    .setDescription(`⚠️ Please provide a message.`);
    return message.channel.send({ embeds: [embed] });
  }

  // Delete the message that triggered the command
  message.delete().catch(console.error);

  // Send the text back to the channel
  message.channel.send(text);
    }
}