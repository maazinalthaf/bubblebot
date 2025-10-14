const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const {embed_color, emojis, red, green, yellow } = require('../../utils/constants');

module.exports = {
    name: 'removerole',
    aliases: ['rrole'],
    async execute(client, message, args) {    
      if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
        const embed = new EmbedBuilder()
        .setColor(red)
        .setDescription(`${emojis.cross} You do not have permission to use this command.`);
        return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
      }
    
      const targetUserMention = message.mentions.users.first();
      const targetUserId = targetUserMention ? targetUserMention.id : args[0];
      const roleName = targetUserMention ? args.slice(1).join(' ') : args.slice(1).join(' ');
    
      if (!targetUserId || !roleName) {
        const embed = new EmbedBuilder()
        .setColor(yellow)
        .setDescription(`${emojis.error} Please provide a user mention or ID and a role name.`);
        return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
      }
    
      const targetMember = message.guild.members.cache.get(targetUserId);
      const role = findRoleByName(message.guild, roleName);
    
      if (!targetMember || !role) {
        const embed = new EmbedBuilder()
        .setColor(yellow)
        .setDescription(`${emojis.error} User or role not found.`);
        return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
      }
    
      try {
        await targetMember.roles.remove(role);
        const embed = new EmbedBuilder()
        .setColor(green)
        .setDescription(`${emojis.tick} ${role} has been removed from ${targetMember.user.tag}.`);
        message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
      } catch (error) {
        console.error('Error removing role:', error);
        const embed = new EmbedBuilder()
        .setColor(yellow)
        .setDescription(`${emojis.error} An error occurred while removing the role.`);
        return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
      }
    }
};

// Dependent Function(s)
function findRoleByName(guild, roleName) {
    const lowerCaseRoleName = roleName.toLowerCase();
    return guild.roles.cache.find(role => role.name.toLowerCase().includes(lowerCaseRoleName));
}
