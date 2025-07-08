const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { getClaimableRoles, addClaimableRole, removeClaimableRole, saveClaimableRoles } = require('./rolemanager'); 
const { embed_color, emojis } = require('../../utils/constants');
const { getPrefix } = require('../../utils/prefix')

module.exports = {
    name: 'claim',
    description: 'Claim self-assignable roles or manage the claimable roles list',
    usage: '[role name] or [add/remove] [role]',
    async execute(client, message, args) {
        const prefix = getPrefix(message.guild?.id);
        if (!message.guild) {
            const embed = new EmbedBuilder()
                .setColor('#ffcc32')
                .setDescription(`${emojis.error} This command only works in servers!`);
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }

        const guildId = message.guild.id;
        const member = message.member;
        let claimableRoles = getClaimableRoles(guildId);

        const existingRoleIds = message.guild.roles.cache.map(r => r.id);
        const validClaimableRoles = claimableRoles.filter(roleId => existingRoleIds.includes(roleId));
        if (validClaimableRoles.length !== claimableRoles.length) {
            saveClaimableRoles(guildId, validClaimableRoles);
            claimableRoles = validClaimableRoles; 
        }

        const subCommand = args[0]?.toLowerCase();

        if (member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            if (subCommand === 'add') {
                const roleName = args.slice(1).join(' ');
                const role = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleName.toLowerCase());
                
                if (!role) {
                    const embed = new EmbedBuilder()
                        .setColor('#c83636')
                        .setDescription(`${emojis.cross} Could not find that role!`);
                     return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
                }
                if (claimableRoles.includes(role.id)) {
                    const embed = new EmbedBuilder()
                        .setColor('#ffcc32')
                        .setDescription(`${emojis.error} ${role} is already claimable!`);
                     return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
                }

                addClaimableRole(guildId, role.id);
                const embed = new EmbedBuilder()
                    .setColor('#77b255')
                    .setDescription(`${emojis.tick} Successfully added ${role} to claimable roles!`);
                 return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
            }

            if (subCommand === 'remove') {
                const roleName = args.slice(1).join(' ');
                const role = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleName.toLowerCase());
                
                if (!role) {
                    const embed = new EmbedBuilder()
                        .setColor('#ffcc32')
                        .setDescription(`${emojis.error} Could not find that role!`);
                     return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
                }
                if (!claimableRoles.includes(role.id)) {
                    const embed = new EmbedBuilder()
                        .setColor('#ffcc32')
                        .setDescription(`${emojis.error} ${role} isn't currently claimable!`);
                     return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
                }

                removeClaimableRole(guildId, role.id);
                const embed = new EmbedBuilder()
                    .setColor('#77b255')
                    .setDescription(`${emojis.tick} Successfully removed ${role} from claimable roles!`);
                 return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
            }
        }

        if (args.length === 0) {
            if (claimableRoles.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor('#ffcc32')
                    .setDescription(`${emojis.error} There are no self-assignable roles in this server.`);
                 return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
            }

           const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
           const embed = new EmbedBuilder()
           .setTitle('🌟 Claimable Roles')
           .setColor(embed_color)
           .setDescription(`Use \`${prefix}claim <role name>\` to get one of these roles:\n\n` +  claimableRoles.map(roleId => {const role = message.guild.roles.cache.get(roleId);return role ? `${role}` : `Unknown Role (ID: ${roleId})`;}).join('\n'))
           .setFooter({ text: `${claimableRoles.length} claimable role${claimableRoles.length !== 1 ? 's' : ''} • Today at ${currentTime}` })
           .setThumbnail(message.guild.iconURL({ dynamic: true }));

             return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        const roleName = args.join(' ');
        const role = message.guild.roles.cache.find(r => r.name.toLowerCase() === roleName.toLowerCase());
        
        if (!role) {
            const embed = new EmbedBuilder()
                .setColor('#c83636')
                .setDescription(`${emojis.cross} Could not find that role!`);
             return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }
        if (!claimableRoles.includes(role.id)) {
            const embed = new EmbedBuilder()
                .setColor('#ffcc32')
                .setDescription(`${emojis.error} ${role} isn't self-assignable!`);
             return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        try {
            if (member.roles.cache.has(role.id)) {
                const embed = new EmbedBuilder()
                    .setColor('#ffcc32')
                    .setDescription(`${emojis.error} You already have the ${role} role!`);
                 return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
            }

            await member.roles.add(role);
            const embed = new EmbedBuilder()
                .setColor('#77b255')
                .setDescription(`${emojis.tick} You've been given the ${role} role!`);
             return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        } catch (error) {
            console.error(error);
            const embed = new EmbedBuilder()
                .setColor('#c83636')
                .setDescription(`${emojis.cross} Failed to assign the role. The bot might not have permission.`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }
    },
};
