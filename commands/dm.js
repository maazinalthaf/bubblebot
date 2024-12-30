const {EmbedBuilder, PermissionsBitField, DMChannel} = require('discord.js')
const { execute } = require('./removereaction')

module.exports = {
name: 'dm' ,
async execute (client,message,args) {
  if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
    const embed = new EmbedBuilder()
    .setColor('#C83636')
    .setDescription(`<:cross:1283228336666968114> You do not have permission to use this command.`);
    return message.channel.send({ embeds: [embed] });
  }
      
      // Get the user mentioned in the command
      const mentionedUser = message.mentions.users.first();
      
      // Check if no user is mentioned
      if (!mentionedUser) {
        const embed = new EmbedBuilder()
          .setColor('#FFCC32')
          .setDescription('<:hazard:1283227908491710505> Please mention a user to reply to.');
        return message.channel.send({ embeds: [embed] });
      }
      
      // Get the text to be replied with
      const text = args.slice(1).join(' ');
      
      // Check if no message is provided to reply with
      if (!text) {
        return message.channel.send("<:hazard:1283227908491710505> Please provide a message to reply with.");
      }
      
      // Send the reply as a DM to the mentioned user
      mentionedUser.send(text)
        .then(() => {
          // Create and send an embed indicating success
          const successEmbed = new EmbedBuilder()
            .setColor('#01b700')  // Green color for success
            .setDescription(`<:tick:1321937653708492850> Successfully sent the reply to ${mentionedUser}.`);
      
          message.channel.send({ embeds: [successEmbed] });
        })
        .catch(error => {
          console.error('Error sending message:', error);
          const embed = new EmbedBuilder()
    .setColor('#C83636')
    .setDescription(`<:cross:1283228336666968114> Failed to send the reply.`);
    return message.channel.send({ embeds: [embed] });
        });
      
}
}