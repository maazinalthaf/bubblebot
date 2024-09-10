const {EmbedBuilder, PermissionsBitField} = require('discord.js');

module.exports = {
    name: 'addrole',
    aliases: ['arole','grole','giverole'],
    async execute(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const embed = new EmbedBuilder()
            .setColor('#F92F60')
            .setDescription(`❌ You do not have permission to use this command.`);
            return message.channel.send({ embeds: [embed] });
          }
        
          const targetUser = message.mentions.users.first();
          const roleName = args.slice(1).join(' ');
        
          if (!targetUser || !roleName) {
            const embed = new EmbedBuilder()
            .setColor('#F6CF57')
            .setDescription(`⚠️ Please provide a user and a role name.`);
            return message.channel.send({ embeds: [embed] });
          }
        
          const targetMember = message.guild.members.cache.get(targetUser.id);
          const role = findRoleByName(message.guild, roleName);
        
          if (!targetMember || !role) {
            const embed = new EmbedBuilder()
            .setColor('#F6CF57')
            .setDescription(`⚠️ User or role not found.`);
            return message.channel.send({ embeds: [embed] });
          }
        
          try {
            await targetMember.roles.add(role);
            const embed = new EmbedBuilder()
            .setColor('#77B255')
            .setDescription(`✅  ${role} has been added to ${targetUser}.`);
            message.channel.send({ embeds: [embed] });
          } catch (error) {
            console.error('Error adding role:', error);
            const embed = new EmbedBuilder()
            .setColor('#F6CF57')
            .setDescription(`⚠️ An error occurred while adding the role.`);
            return message.channel.send({ embeds: [embed] });
          }
    }
}

// Dependent Function(s)
function findRoleByName(guild, roleName) {
    const lowerCaseRoleName = roleName.toLowerCase();
    return guild.roles.cache.find(role => role.name.toLowerCase().includes(lowerCaseRoleName));
  }