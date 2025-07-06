const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const {embed_color, emojis, prefix } = require('../../constants');

const prefixesPath = path.join(__dirname, '../../prefixes.json');

// Load or create prefixes file
let prefixes = {};
try {
  if (fs.existsSync(prefixesPath)) {
    prefixes = JSON.parse(fs.readFileSync(prefixesPath, 'utf8'));
  } else {
    fs.writeFileSync(prefixesPath, JSON.stringify({}, null, 2));
  }
} catch (error) {
  console.error('Error loading prefixes:', error);
}

module.exports = {
  name: 'setprefix',
  description: 'Set a custom prefix for this server (Admin only)',
  usage: '<new prefix>',
  permissions: ['ManageGuild'],
  async execute(client, message, args) {
    if (!message.member.permissions.has('ManageGuild')) {
      const embed = new EmbedBuilder()
      .setColor('#c83636')
      .setDescription(`${emojis.cross} You do not have permission to use this command.`);
    return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
  }

    if (!args[0]) {
      const currentPrefix = prefixes[message.guild.id] || '.';
      const embed = new EmbedBuilder()
        .setColor(embed_color)
        .setTitle('Current Prefix')
        .setDescription(`The current prefix for this server is: \`${currentPrefix}\``)
        .addFields(
          { name: 'Usage', value: `To change it, use: \`${currentPrefix}setprefix <new prefix>\`` }
        );
      return message.reply({ embeds: [embed] });
    }

    const newPrefix = args[0];
    
    // Validate prefix length
    if (newPrefix.length > 3) {
      return message.reply('Prefix must be 3 characters or less.');
    }

    // Update prefix for this server
    prefixes[message.guild.id] = newPrefix;

    try {
      fs.writeFileSync(prefixesPath, JSON.stringify(prefixes, null, 2));
      const embed = new EmbedBuilder()
        .setColor('77b255')
        .setDescription(`${emojis.tick} Server prefix has been updated to: \`${newPrefix}\``);
      message.reply({ embeds: [embed] , allowedMentions: { repliedUser: false }});
    } catch (error) {
      console.error('Error saving prefixes:', error);
      message.reply('There was an error saving the new prefix.');
    }
  },
};