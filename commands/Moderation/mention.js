const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { emojis, embed_color } = require('../../utils/constants.js');
const { getPrefix } = require('../../utils/prefix');

// Path to store the mention permissions data
const mentionDataPath = path.join(__dirname, '../../mentionData.json');

// Initialize mention data
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

module.exports = {
  name: 'mention',
  description: 'Mention a specific role or manage mention permissions',
  usage: '.mention <role name> OR .mention add <role> <user> OR .mention remove <role> <user>',
  async execute(client, message, args) {
    
    const prefix = getPrefix(message.guild?.id);

    if (args.length === 0) {
      // Show help if no arguments provided
      const embed = new EmbedBuilder()
        .setColor(embed_color)
        .setTitle('Mention Command Help')
        .setDescription(`Learn how to manage pingable roles with this command.`)
        .addFields({ 
        name: 'Usage', 
        value: `\`\`\`${prefix}${this.usage}\`\`\``,
        inline: false},
        { 
        name: 'Examples', 
        value: `\`\`\`${prefix}mention @Announcements\n${prefix}mention add @Announcements @User\n${prefix}mention remove @Announcements @User\`\`\``,
        inline: false
        },
          { 
            name: 'Current Pingable Roles', 
            value: Object.keys(mentionData).length > 0 ? Object.keys(mentionData).map(roleId => `• <@&${roleId}>`).join('\n') : '*No pingable roles set up yet*',
            inline: false
          }
        );
      return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
    }

    // Check for add/remove subcommands
    if (args[0].toLowerCase() === 'add' || args[0].toLowerCase() === 'remove') {
      // Require ManageRoles permission for add/remove operations
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
        const embed = new EmbedBuilder()
          .setColor('#ffcc32')
          .setDescription(`${emojis.error} You do not have permission to use this subcommand.`);
        return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
      }

      if (args.length < 3) {
        const embed = new EmbedBuilder()
          .setColor(embed_color)
          .setDescription(`${emojis.info} Usage: .mention ${args[0].toLowerCase()} <role> <user>`);
        return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
      }

      const role = message.mentions.roles.first();
      const user = message.mentions.users.first();

      if (!role || !user) {
        const embed = new EmbedBuilder()
          .setColor('#FFcc32')
          .setDescription(`${emojis.error} Please mention both a role and a user.`);
        return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
      }

      if (args[0].toLowerCase() === 'add') {
        if (!mentionData[role.id]) {
          mentionData[role.id] = [];
        }

        if (!mentionData[role.id].includes(user.id)) {
          mentionData[role.id].push(user.id);
          saveMentionData();

          const embed = new EmbedBuilder()
            .setColor('#77b255')
            .setDescription(`${emojis.tick} Added ${user} to the list of users who can mention ${role}.`);
          return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        } else {
          const embed = new EmbedBuilder()
            .setColor('#FFcc32')
            .setDescription(`${emojis.error} ${user} already has permission to mention ${role}.`);
          return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }
      } else { // remove
        if (mentionData[role.id] && mentionData[role.id].includes(user.id)) {
          mentionData[role.id] = mentionData[role.id].filter(id => id !== user.id);
          
          if (mentionData[role.id].length === 0) {
            delete mentionData[role.id];
          }
          
          saveMentionData();

          const embed = new EmbedBuilder()
            .setColor('#77b255')
            .setDescription(`${emojis.tick} Removed ${user} from the list of users who can mention ${role}.`);
          return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        } else {
          const embed = new EmbedBuilder()
            .setColor('#c83636')
            .setDescription(`${emojis.cross} ${user} doesn't have permission to mention ${role}.`);
          return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }
      }
    } else {
      // Regular mention functionality
      const role = message.mentions.roles.first() || 
                   message.guild.roles.cache.find(r => r.name.toLowerCase() === args.join(' ').toLowerCase());

      if (!role) {
        const embed = new EmbedBuilder()
          .setColor('#FFcc32')
          .setDescription(`${emojis.error} Role not found.`);
        return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
      }

      if (!mentionData[role.id]) {
        const embed = new EmbedBuilder()
          .setColor('#FFcc32')
          .setDescription(`${emojis.error} This role is not configured for mentions.`);
        return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
      }

      if (!mentionData[role.id].includes(message.author.id)) {
        const embed = new EmbedBuilder()
          .setColor('#FFcc32')
          .setDescription(`${emojis.error} You don't have permission to mention ${role}.`);
        return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
      }

      try {
        await message.channel.send(`${role}`);
      } catch (error) {
        console.error('Error mentioning role:', error);
        const embed = new EmbedBuilder()
          .setColor('#c83636')
          .setDescription(`${emojis.cross} Failed to mention role. I may not have permission.`);
        return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
      }
    }
  },
};