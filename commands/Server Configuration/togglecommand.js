const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { embed_color, emojis, red, green, yellow } = require('../../utils/constants');
const { getPrefix } = require('../../utils/prefix');
const disabledCommandsManager = require('../../utils/disabledCommandsManager');

module.exports = {
    name: 'togglecommand',
    description: 'Enable or disable a command for this server',
    aliases: ['tc'],
    permissions: PermissionsBitField.Flags.ManageGuild, 
    execute
};

async function execute(client, message, args) {
  const prefix = getPrefix(message.guild?.id);
  
  // Check for Manage Guild permission
  if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
    const embed = new EmbedBuilder()
      .setColor(red)
      .setDescription(`${emojis.cross} You do not have permission to use this command.`);
    return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
  }

  if (!args.length) {
    const embed = new EmbedBuilder()
      .setColor(yellow)
      .setDescription(`${emojis.error} Please specify a command to toggle (enable/disable).\n\n**Example:** \`${prefix}togglecommand ping\``)
    return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
  }

  const commandName = args[0].toLowerCase();
  const command = client.commands.get(commandName) || 
                 client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) {
    const embed = new EmbedBuilder()
      .setColor(yellow)
      .setDescription(`${emojis.error} Command "${commandName}" not found.`);
    return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
  }

  if (command.name === 'togglecommand') {
    const embed = new EmbedBuilder()
      .setColor(yellow)
      .setDescription(`${emojis.error} You cannot disable the togglecommand itself!`);
    return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
  }

  const guildId = message.guild.id;
  const { disabledCommands } = disabledCommandsManager;
  
  if (!disabledCommands[guildId]) {
    disabledCommands[guildId] = [];
  }

  const isDisabled = disabledCommands[guildId].includes(command.name);
  
  const embed = new EmbedBuilder();
  
  if (isDisabled) {
    // Enable the command
    disabledCommands[guildId] = disabledCommands[guildId].filter(cmd => cmd !== command.name);
    embed
      .setColor(green)
      .setDescription(`${emojis.tick} Command **${command.name}** has been **enabled** for this server.`);
  } else {
    // Disable the command
    disabledCommands[guildId].push(command.name);
    embed
      .setColor(green)
      .setDescription(`${emojis.tick} Command **${command.name}** has been **disabled** for this server.`);
  }

  // Save to file
  if (disabledCommandsManager.saveDisabledCommands()) {
    await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
  } else {
    const errorEmbed = new EmbedBuilder()
      .setColor(red)
      .setDescription(`${emojis.cross} There was an error saving the command toggle state.`);
    return message.reply({ embeds: [errorEmbed], allowedMentions: { repliedUser: false } });
  }
}