const { EmbedBuilder } = require('discord.js');
const {embed_color, emojis, red, green, yellow } = require('../../utils/constants');
const database = require('../../utils/database');

module.exports = {
  name: 'setprefix',
  description: 'Set a custom prefix for this server (Admin only)',
  usage: '<new prefix>',
  permissions: ['ManageGuild'],
  async execute(client, message, args) {
    if (!message.member.permissions.has('ManageGuild')) {
      const embed = new EmbedBuilder()
      .setColor(red)
      .setDescription(`${emojis.cross} You do not have permission to use this command.`);
    return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
  }

    if (!args[0]) {
      const currentPrefix = database.getPrefix(message.guild.id);
      const embed = new EmbedBuilder()
        .setColor(embed_color)
        .setTitle('Current Prefix')
        .setDescription(`The current prefix for this server is: \`${currentPrefix}\``)
        .addFields(
          { name: 'Usage', value: `To change it, use: \`${currentPrefix}setprefix <new prefix>\`` }
        );
      return message.reply({ embeds: [embed] , allowedMentions: { repliedUser: false } });
    }

    const newPrefix = args[0];
    
    if (newPrefix.length > 3) {
      return message.reply('Prefix must be 3 characters or less.');
    }

    // Update prefix for this server
    try {
      database.setPrefix(message.guild.id, newPrefix);
      const embed = new EmbedBuilder()
        .setColor(green)
        .setDescription(`${emojis.tick} Server prefix has been updated to: \`${newPrefix}\``);
      message.reply({ embeds: [embed] , allowedMentions: { repliedUser: false }});
    } catch (error) {
      console.error('Error saving prefixes:', error);
      message.reply('There was an error saving the new prefix.');
    }
  },
};