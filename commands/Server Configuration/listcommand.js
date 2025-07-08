const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { checkCommandDisabled } = require('./togglecommand');
const { embed_color, emojis  } = require('../../utils/constants');
const { execute } = require('./togglecommand');
const { getPrefix } = require('../../utils/prefix');


module.exports = {
  name: 'listcommand',
  aliases: ['lc','listcommands'],
  description: 'List all enabled and disabled commands in the server',
  async execute(client, message, args) {
    const prefix = getPrefix(message.guild?.id);
    // Get all commands and sort alphabetically
    const commands = Array.from(client.commands.values())
      .filter(cmd => cmd.name !== 'commandslist') 
      .sort((a, b) => a.name.localeCompare(b.name));

    // Load disabled commands
    let disabledCommands = {};
    const disabledCommandsPath = path.join(__dirname, '../../disabledCommands.json');
    
    try {
      if (fs.existsSync(disabledCommandsPath)) {
        disabledCommands = JSON.parse(fs.readFileSync(disabledCommandsPath, 'utf8'));
      }
    } catch (error) {
      console.error('Error reading disabled commands:', error);
      return message.reply('Could not load command status data.');
    }

    // Create lists
    const enabled = [];
    const disabled = [];
    
    commands.forEach(cmd => {
      const isDisabled = message.guild ? 
        (disabledCommands[message.guild.id] || []).includes(cmd.name) : 
        false;
      
      if (isDisabled) disabled.push(` \`${cmd.name}\``);
      else enabled.push(` \`${cmd.name}\``);
    });

    // Build embed
    const embed = new EmbedBuilder()
      .setColor(embed_color)
      .setTitle('🔧 Command Status')
      .setDescription(`**Command availability in ${message.guild ? 'this server' : 'DMs'}**`)
      .addFields(
        { name: '✅ Enabled', value: enabled.join(' ') || 'None', inline: false },
        { name: '❌ Disabled', value: disabled.join(' ') || 'None', inline: false }
      )
      .setFooter({ 
        text: message.guild ? 
          `Use ${prefix}togglecommand [name] to change status` : 
          'Status can only be changed in servers' 
      });

    await message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
  }
};
