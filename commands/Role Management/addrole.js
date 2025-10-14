const {embed_color, emojis, red, green, yellow } = require('../../utils/constants');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'addrole',
    aliases: ['arole', 'grole', 'giverole'],
    async execute(client, message, args) {
        const prefix = getPrefix(message.guild?.id);
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
            await targetMember.roles.add(role);
            const embed = new EmbedBuilder()
                .setColor(green)
                .setDescription(`${emojis.tick} ${role} has been added to ${targetMember.user.tag}.`);
            message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        } catch (error) {
            console.error('Error adding role:', error);
            const embed = new EmbedBuilder()
                .setColor(yellow)
                .setDescription(`${emojis.error} An error occurred while adding the role.`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }
    }
};

// Dependent Function(s)
function findRoleByName(guild, roleName) {
    const lowerCaseRoleName = roleName.toLowerCase();
    return guild.roles.cache.find(role => role.name.toLowerCase().includes(lowerCaseRoleName));
}
