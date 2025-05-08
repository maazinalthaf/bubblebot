const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { embed_color, emojis: emoji } = require('../../constants');

module.exports = {
    name: 'reply',
    async execute(client, message, args) {

if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
  const embed = new EmbedBuilder()
  .setColor('#C83636')
  .setDescription(`${emoji.cross} You do not have permission to use this command.`);
  return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
}

  
  const messageId = args[0]; // Assuming the message ID is provided as the first argument

  // Check if a message ID is provided
  if (!messageId) {
    const embed = new EmbedBuilder()
      .setColor('#FFCC32')
      .setDescription(`${emoji.error} Please provide a message ID to reply to.`);
    return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
  }

  
  const text = args.slice(1).join(' ');

  // Check if no message is provided to reply with
  if (!text) {
    const embed = new EmbedBuilder()
      .setColor('#FFCC32')
      .setDescription(`${emoji.error} Please provide a message to reply to.`);
    return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
  }

  // Fetch the message using the provided message ID
  message.channel.messages.fetch(messageId)
    .then(replyMessage => {
      // Reply to the fetched message with the specified text
      replyMessage.reply(text)
        .then(() => {
          message.delete(); // Delete the command message
        })
        .catch(error => {
          console.error('Error replying to message:', error);
          const embed = new EmbedBuilder()
            .setColor('#C83636')
            .setDescription(`${emoji.cross} Failed to reply to the message.`);
          return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        });
    })
    .catch(error => {
      console.error('Error fetching message:', error);
      const embed = new EmbedBuilder()
        .setColor('#C83636')
        .setDescription(`${emoji.cross} Failed to fetch the message with the provided ID.`);
      return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
    });
  }
}