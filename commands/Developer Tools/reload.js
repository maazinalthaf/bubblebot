const { EmbedBuilder } = require('discord.js');
const {embed_color, emojis, red, green, yellow } = require('../../utils/constants');

module.exports = {
  name: 'reload',
  description: 'Reload one or all commands without restarting the bot',
  aliases: ['rl'],
  execute: async (client, message, args) => {
    // Get the application info to find the owner
    const application = await client.application.fetch();
    const ownerId = application.owner?.id || (application.owner?.ownerId || application.owner?.user?.id);
    
    // Check if user is bot owner
    if (message.author.id !== ownerId) {
      const embed = new EmbedBuilder()
        .setColor(red)
        .setDescription(`${emojis.cross} You don't have permission to use this command.`);
      return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }

    // Rest of the code remains the same...
    if (args.length === 0) {
      const result = client.commandManager.reloadAll();
      const embed = new EmbedBuilder()
        .setColor(result.success ? green : red)
        .setDescription(`${result.success ? emojis.tick : emojis.error} ${result.message}`);
      
      if (result.errors) {
        embed.addFields({
          name: 'Errors',
          value: result.errors.slice(0, 5).join('\n') + (result.errors.length > 5 ? `\n... and ${result.errors.length - 5} more` : ''),
          inline: false
        });
      }

      return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }

    const commandName = args[0].toLowerCase();
    const result = client.commandManager.reloadCommand(commandName);
    
    const embed = new EmbedBuilder()
      .setColor(result.success ? green : red)
      .setDescription(`${result.success ? emojis.tick : emojis.cross} ${result.message}`);

    message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
  }
};