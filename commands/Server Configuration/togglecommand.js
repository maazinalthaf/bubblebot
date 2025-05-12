const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { aliases } = require('../Moderation/snipe');
const {embed_color, emojis, prefix } = require('../../constants');

module.exports = {
    name: 'togglecommand',
    description: 'Enable or disable a command for this server',
    aliases: ['tc'],
    permissions: PermissionsBitField.Flags.ManageGuild, 
    execute,
    checkCommandDisabled
  };


const disabledCommandsPath = './disabledCommands.json';

// Load or initialize disabled commands
let disabledCommands = {};
try {
  if (fs.existsSync(disabledCommandsPath)) {
    disabledCommands = JSON.parse(fs.readFileSync(disabledCommandsPath, 'utf8'));
  } else {
    fs.writeFileSync(disabledCommandsPath, JSON.stringify({}, null, 2));
  }
} catch (error) {
  console.error('Error loading disabled commands:', error);
}

function checkCommandDisabled(guildId, commandName) {
  if (!disabledCommands[guildId]) return false;
  return disabledCommands[guildId].includes(commandName);
}

async function execute(client, message, args) {
  // Check for Manage Guild permission
  if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
    const embed = new EmbedBuilder()
      .setColor('#c83636')
      .setDescription(`${emojis.cross} You do not have permission to use this command.`);
    return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
  }

  if (!args.length) {
    const embed = new EmbedBuilder()
      .setColor('#FFcc32')
      .setDescription(`${emojis.error} Please specify a command to toggle (enable/disable).\n\n**Example:** \`.togglecommand ping\``)
    return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
  }

  const commandName = args[0].toLowerCase();
  const command = client.commands.get(commandName) || 
                 client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) {
    const embed = new EmbedBuilder()
      .setColor('#FFcc32')
      .setDescription(`${emojis.error} Command "${commandName}" not found.`);
    return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
  }

  if (command.name === 'togglecommand') {
    const embed = new EmbedBuilder()
      .setColor('#FFcc32')
      .setDescription(`${emojis.error} You cannot disable the togglecommand itself!`);
    return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
  }

  const guildId = message.guild.id;
  
  if (!disabledCommands[guildId]) {
    disabledCommands[guildId] = [];
  }

  const isDisabled = disabledCommands[guildId].includes(command.name);
  
  const embed = new EmbedBuilder();
  
  if (isDisabled) {
    disabledCommands[guildId] = disabledCommands[guildId].filter(cmd => cmd !== command.name);
    embed
      .setColor('#77b255')
      .setDescription(`${emojis.tick} Command **${command.name}** has been **enabled** for this server.`);
  } else {
    disabledCommands[guildId].push(command.name);
    embed
      .setColor('#77b255')
      .setDescription(`${emojis.tick} Command **${command.name}** has been **disabled** for this server.`);
  }

  try {
    fs.writeFileSync(disabledCommandsPath, JSON.stringify(disabledCommands, null, 2));
    await message.reply({ embeds: [embed] });
  } catch (error) {
    console.error('Error saving disabled commands:', error);
    const errorEmbed = new EmbedBuilder()
      .setColor('#c83636')
      .setDescription(`${emojis.cross} There was an error saving the command toggle state.`);
    return message.reply({ embeds: [errorEmbed], allowedMentions: { repliedUser: false } });
  }
}

