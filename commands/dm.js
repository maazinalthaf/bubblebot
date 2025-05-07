const {EmbedBuilder, PermissionsBitField, DMChannel} = require('discord.js')
const { execute } = require('./removereaction')

module.exports = {
name: 'dm' ,
async execute (client,message,args) {
  if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
    const embed = new EmbedBuilder()
    .setColor('#C83636')
    .setDescription(`<:cross:1332418251849732206> You do not have permission to use this command.`);
    return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
  }
      
      // Get the user mentioned in the command
      const mentionedUser = message.mentions.users.first();
      
      // Check if no user is mentioned
      if (!mentionedUser) {
        const embed = new EmbedBuilder()
          .setColor('#FFCC32')
          .setDescription('<:error:1332418281675558963> Please mention a user to reply to.');
        return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
      }
      
      // Get the text to be replied with
      const text = args.slice(1).join(' ');
      
      // Check if no message is provided to reply with
      if (!text) {
        return message.channel.send("<:error:1332418281675558963> Please provide a message to reply with.");
      }
      
      // Send the reply as a DM to the mentioned user
      mentionedUser.send(text)
        .then(() => {
          // Create and send an embed indicating success
          const successEmbed = new EmbedBuilder()
            .setColor('#77B255')  // Green color for success
            .setDescription(`<:tick:1332418339372273684> Successfully sent the reply to ${mentionedUser}.`);
      
          message.channel.send({ embeds: [successEmbed] });
        })
        .catch(error => {
          console.error('Error sending message:', error);
          const embed = new EmbedBuilder()
    .setColor('#C83636')
    .setDescription(`<:cross:1332418251849732206> Failed to send the reply.`);
    return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        });
      
}
}