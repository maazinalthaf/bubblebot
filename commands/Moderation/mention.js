const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { emojis, embed_color, red, green, yellow } = require('../../utils/constants.js');
const { getPrefix } = require('../../utils/prefix');

// Path to store the mention permissions data
const mentionDataPath = path.join(__dirname, '../../mentionData.json');

// Initialize mention data with server-specific structure
let mentionData = {};
try {
  if (fs.existsSync(mentionDataPath)) {
    mentionData = JSON.parse(fs.readFileSync(mentionDataPath, 'utf8'));
  } else {
    fs.writeFileSync(mentionDataPath, JSON.stringify({}, null, 2));
  }
} catch (error) {
  console.error('Error loading mention data:', error);
}

// Save mention data to file
function saveMentionData() {
  fs.writeFileSync(mentionDataPath, JSON.stringify(mentionData, null, 2), 'utf8');
}

// Helper function to get server-specific data
function getServerData(guildId) {
  if (!mentionData[guildId]) {
    mentionData[guildId] = {};
  }
  return mentionData[guildId];
}

module.exports = {
  name: 'mention',
  description: 'Mention a specific role or manage mention permissions',
  usage: `mention <role name> OR mention add <role> <user> OR mention remove <role> <user>`,
  async execute(client, message, args) {
    if (!message.guild) {
      const embed = new EmbedBuilder()
        .setColor(yellow)
        .setDescription(`${emojis.error} This command can only be used in a server.`);
      return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }

    const prefix = getPrefix(message.guild.id);
    const serverData = getServerData(message.guild.id);

    if (args.length === 0) {
      // Show help if no arguments provided
      const embed = new EmbedBuilder()
        .setColor(embed_color)
        .setTitle('Mention Command Help')
        .setDescription(`Learn how to manage pingable roles with this command.`)
        .addFields(
          {
            name: 'Usage',
            value: `\`\`\`${prefix}${this.usage}\`\`\``,
            inline: false
          },
          {
            name: 'Examples',
            value: `\`\`\`${prefix}mention @Announcements\n${prefix}mention add @Announcements @User\n${prefix}mention remove @Announcements @User\`\`\``,
            inline: false
          },
          {
            name: 'Current Pingable Roles',
            value: Object.keys(serverData).length > 0
              ? Object.keys(serverData).map(roleId => `• <@&${roleId}>`).join('\n')
              : '*No pingable roles set up yet*',
            inline: false
          }
        );
      return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }

    // Check for add/remove subcommands
    if (args[0].toLowerCase() === 'add' || args[0].toLowerCase() === 'remove') {
      // Require ManageRoles permission for add/remove operations
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
        const embed = new EmbedBuilder()
          .setColor(yellow)
          .setDescription(`${emojis.error} You do not have permission to use this subcommand.`);
        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
      }

      if (args.length < 3) {
        const embed = new EmbedBuilder()
          .setColor(embed_color)
          .setDescription(`${emojis.info} Usage: .mention ${args[0].toLowerCase()} <role> <user>`);
        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
      }

      const role = message.mentions.roles.first();
      const user = message.mentions.users.first();

      if (!role || !user) {
        const embed = new EmbedBuilder()
          .setColor(yellow)
          .setDescription(`${emojis.error} Please mention both a role and a user.`);
        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
      }

      if (args[0].toLowerCase() === 'add') {
        if (!serverData[role.id]) {
          serverData[role.id] = [];
        }

        if (!serverData[role.id].includes(user.id)) {
          serverData[role.id].push(user.id);
          saveMentionData();

          const embed = new EmbedBuilder()
            .setColor(green)
            .setDescription(`${emojis.tick} Added ${user} to the list of users who can mention ${role}.`);
          return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        } else {
          const embed = new EmbedBuilder()
            .setColor(yellow)
            .setDescription(`${emojis.error} ${user} already has permission to mention ${role}.`);
          return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }
      } else { // remove
        if (serverData[role.id] && serverData[role.id].includes(user.id)) {
          serverData[role.id] = serverData[role.id].filter(id => id !== user.id);

          if (serverData[role.id].length === 0) {
            delete serverData[role.id];
          }

          saveMentionData();

          const embed = new EmbedBuilder()
            .setColor(green)
            .setDescription(`${emojis.tick} Removed ${user} from the list of users who can mention ${role}.`);
          return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        } else {
          const embed = new EmbedBuilder()
            .setColor(red)
            .setDescription(`${emojis.cross} ${user} doesn't have permission to mention ${role}.`);
          return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }
      }
    } else {
      // Regular mention functionality
      const role = message.mentions.roles.first() ||
        message.guild.roles.cache.find(r => r.name.toLowerCase() === args.join(' ').toLowerCase());

      if (!role) {
        const embed = new EmbedBuilder()
          .setColor(yellow)
          .setDescription(`${emojis.error} Role not found.`);
        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
      }

      if (!serverData[role.id]) {
        const embed = new EmbedBuilder()
          .setColor(yellow)
          .setDescription(`${emojis.error} This role is not configured for mentions.`);
        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
      }

      if (!serverData[role.id].includes(message.author.id)) {
        const embed = new EmbedBuilder()
          .setColor(yellow)
          .setDescription(`${emojis.error} You don't have permission to mention ${role}.`);
        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
      }

      try {
        await message.channel.send(`${role}`);
      } catch (error) {
        console.error('Error mentioning role:', error);
        const embed = new EmbedBuilder()
          .setColor(red)
          .setDescription(`${emojis.cross} Failed to mention role. I may not have permission.`);
        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
      }
    }
  },
};