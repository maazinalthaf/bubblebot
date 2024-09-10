const {EmbedBuilder, PermissionsBitField, DMChannel} = require('discord.js')
const { execute } = require('./removereaction')

module.exports = {
name: 'dm' ,
async execute (client,message,args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
        return message.channel.send("❌ You do not have permission to use this command.");
      }
      
      // Get the user mentioned in the command
      const mentionedUser = message.mentions.users.first();
      
      // Check if no user is mentioned
      if (!mentionedUser) {
        const embed = new EmbedBuilder()
          .setColor('#F6CF57')
          .setDescription('⚠️ Please mention a user to reply to.');
        return message.channel.send({ embeds: [embed] });
      }
      
      // Get the text to be replied with
      const text = args.slice(1).join(' ');
      
      // Check if no message is provided to reply with
      if (!text) {
        return message.channel.send("⚠️ Please provide a message to reply with.");
      }
      
      // Send the reply as a DM to the mentioned user
      mentionedUser.send(text)
        .then(() => {
          // Create and send an embed indicating success
          const successEmbed = new EmbedBuilder()
            .setColor('#57F68D')  // Green color for success
            .setDescription(`✅ Successfully sent the reply to ${mentionedUser}.`);
      
          message.channel.send({ embeds: [successEmbed] });
        })
        .catch(error => {
          console.error('Error sending message:', error);
          message.channel.send("❌ Failed to send the reply.");
        });
      
}
}