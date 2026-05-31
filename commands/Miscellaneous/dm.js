const { EmbedBuilder, PermissionsBitField, DMChannel } = require('discord.js')
const { execute } = require('../Reaction System/removereaction')
const { embed_color, emojis, red, green, yellow } = require('../../utils/constants');

module.exports = {
  name: 'dm',
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      const embed = new EmbedBuilder()
        .setColor(red)
        .setDescription(`${emojis.cross} You do not have permission to use this command.`);
      return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }

    const mentionedUser = message.mentions.users.first();

    // Check if no user is mentioned
    if (!mentionedUser) {
      const embed = new EmbedBuilder()
        .setColor(yellow)
        .setDescription(`${emojis.error} Please mention a user to reply to.`);
      return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }

    // Get the text to be replied with
    const text = args.slice(1).join(' ');

    // Check if no message is provided to reply with
    if (!text) {
      const embed = new EmbedBuilder()
        .setColor(yellow)
        .setDescription(`${emojis.error} Please provide a message to reply with.`);
      return message.channel.send({ embeds: [embed] , allowedMentions: {repliedUser: false} });
    }
   

    mentionedUser.send(text)
      .then(() => {
        const successEmbed = new EmbedBuilder()
          .setColor(green)  
          .setDescription(`${emojis.tick} Successfully sent the reply to ${mentionedUser}.`);

        message.channel.send({ embeds: [successEmbed] , allowedMentions: {repliedUser: false} });
      })
      .catch(error => {
        console.error('Error sending message:', error);
        const embed = new EmbedBuilder()
          .setColor(red)
          .setDescription(`${emojis.cross} Failed to send the reply.`);
        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
      });
  }
}
