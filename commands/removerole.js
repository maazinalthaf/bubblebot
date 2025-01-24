const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'removerole',
    aliases: ['rrole'],
    async execute(client, message, args) {    
      if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        const embed = new EmbedBuilder()
        .setColor('#C83636')
        .setDescription('<:cross:1283228336666968114> You do not have permission to use this command.');
        return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
      }
    
      const targetUserMention = message.mentions.users.first();
      const targetUserId = targetUserMention ? targetUserMention.id : args[0];
      const roleName = targetUserMention ? args.slice(1).join(' ') : args.slice(1).join(' ');
    
      if (!targetUserId || !roleName) {
        const embed = new EmbedBuilder()
        .setColor('#FFCC32')
        .setDescription('<:hazard:1283227908491710505> Please provide a user mention or ID and a role name.');
        return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
      }
    
      const targetMember = message.guild.members.cache.get(targetUserId);
      const role = findRoleByName(message.guild, roleName);
    
      if (!targetMember || !role) {
        const embed = new EmbedBuilder()
        .setColor('#FFCC32')
        .setDescription('<:hazard:1283227908491710505> User or role not found.');
        return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
      }
    
      try {
        await targetMember.roles.remove(role);
        const embed = new EmbedBuilder()
        .setColor('#77B255')
        .setDescription(`<:tick:1326247406576210012> ${role} has been removed from ${targetMember.user.tag}.`);
        message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
      } catch (error) {
        console.error('Error removing role:', error);
        const embed = new EmbedBuilder()
        .setColor('#FFCC32')
        .setDescription('<:hazard:1283227908491710505> An error occurred while removing the role.');
        return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
      }
    }
};

// Dependent Function(s)
function findRoleByName(guild, roleName) {
    const lowerCaseRoleName = roleName.toLowerCase();
    return guild.roles.cache.find(role => role.name.toLowerCase().includes(lowerCaseRoleName));
}
