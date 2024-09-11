const {EmbedBuilder, PermissionsBitField} = require('discord.js');

module.exports = {
    name: 'removerole',
    aliases: ['rrole'],
    async execute(client, message, args) {    
      if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        const embed = new EmbedBuilder()
        .setColor('#C83636')
        .setDescription(`<:cross:1283228336666968114> You do not have permission to use this command.`);
        return message.channel.send({ embeds: [embed] });
      }
    
      const targetUser = message.mentions.users.first();
      const roleName = args.slice(1).join(' ');
    
      if (!targetUser || !roleName) {
        const embed = new EmbedBuilder()
        .setColor('#FFCC32')
        .setDescription(`<:hazard:1283227908491710505> Please provide a user and a role name.`);
        return message.channel.send({ embeds: [embed] });
      }
    
      const targetMember = message.guild.members.cache.get(targetUser.id);
      const role = findRoleByName(message.guild, roleName);
    
      if (!targetMember || !role) {
        const embed = new EmbedBuilder()
        .setColor('#FFCC32')
        .setDescription(`<:hazard:1283227908491710505> User or role not found.`);
        return message.channel.send({ embeds: [embed] });
      }
    
      try {
        await targetMember.roles.remove(role);
        const embed = new EmbedBuilder()
        .setColor('#46DC01')
        .setDescription(`<:tick:1283246758356451432>  ${role} has been removed from ${targetUser}.`);
        message.channel.send({ embeds: [embed] });
      } catch (error) {
        console.error('Error removing role:', error);
        const embed = new EmbedBuilder()
        .setColor('#FFCC32')
        .setDescription(`<:hazard:1283227908491710505> An error occurred while removing the role.`);
        return message.channel.send({ embeds: [embed] });
      }
    }
}

// Dependent Function(s)
function findRoleByName(guild, roleName) {
    const lowerCaseRoleName = roleName.toLowerCase();
    return guild.roles.cache.find(role => role.name.toLowerCase().includes(lowerCaseRoleName));
  }