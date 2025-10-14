const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');
const { PermissionsBitField } = require('discord.js');
const {embed_color, emojis} = require('../../utils/constants');

module.exports = {
  name: 'reload',
  description: 'Reloads a command',
  usage: '<command name>',
  aliases: ['rl'],
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply('❌ You do not have permission to use this command.');
    }

    if (!args.length) {
      const embed = new EmbedBuilder()
        .setColor('#FF6B6B')
        .setTitle('Reload Command')
        .setDescription('Please provide a command name to reload.\n**Usage:** `.reload <command>`\n**Example:** `.reload ping`');
      return message.reply({ embeds: [embed] });
    }

    const commandName = args[0].toLowerCase();
    
    // Check if command exists in current collection
    const existingCommand = client.commands.get(commandName) || 
                           client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    
    if (!existingCommand) {
      return message.reply(`❌ Command \`${commandName}\` not found in current commands.`);
    }

    function findCommandFile(dir, targetCommand) {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const file of files) {
        const filePath = path.join(dir, file.name);
        
        if (file.isDirectory()) {
          const result = findCommandFile(filePath, targetCommand);
          if (result) return result;
        } else if (file.isFile() && file.name.endsWith('.js')) {
          try {
            // Quick check without requiring the module first
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const commandMatch = fileContent.match(/name:\s*['"]([^'"]+)['"]/);
            if (commandMatch && commandMatch[1].toLowerCase() === targetCommand) {
              return filePath;
            }
          } catch (error) {
            continue;
          }
        }
      }
      return null;
    }

    try {
      const loadingMsg = await message.reply(`🔄 Reloading command \`${commandName}\`...`);

      const commandPath = findCommandFile('./commands', commandName);
      
      if (!commandPath) {
        return loadingMsg.edit(`❌ Could not find file for command \`${commandName}\`.`);
      }

      // Store old command for reference
      const oldCommand = client.commands.get(commandName);

      // Clear require cache
      delete require.cache[require.resolve(commandPath)];
      
      // Load new command
      const newCommand = require(commandPath);
      
      // Validate new command
      if (!newCommand.name || typeof newCommand.execute !== 'function') {
        return loadingMsg.edit(`❌ Invalid command structure in \`${commandPath}\`.`);
      }

      // Update commands collection
      client.commands.set(newCommand.name, newCommand);
      
      // If command name changed, delete old entry
      if (oldCommand && oldCommand.name !== newCommand.name) {
        client.commands.delete(oldCommand.name);
      }

      const successEmbed = new EmbedBuilder()
        .setColor('#51D98C')
        .setTitle('✅ Command Reloaded')
        .setDescription(`**Command:** \`${newCommand.name}\`\n**File:** \`${path.relative(process.cwd(), commandPath)}\``)
        .setTimestamp();

      await loadingMsg.edit({ content: null, embeds: [successEmbed] });
      
    } catch (error) {
      console.error(`Reload error for ${commandName}:`, error);
      
      const errorEmbed = new EmbedBuilder()
        .setColor('#FF6B6B')
        .setTitle('❌ Reload Failed')
        .setDescription(`**Command:** \`${commandName}\`\n**Error:** \`${error.message}\``);
      
      message.reply({ embeds: [errorEmbed] });
    }
  },
};