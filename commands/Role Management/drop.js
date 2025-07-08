const { EmbedBuilder } = require('discord.js');
const { getClaimableRoles } = require('./rolemanager');
const { embed_color, emojis } = require('../../utils/constants');
const { getPrefix } = require('../../utils/prefix')

module.exports = {
    name: 'drop',
    description: 'Remove self-assignable roles from yourself',
    usage: '[role name]',
    async execute(client, message, args) {
        const prefix = getPrefix(message.guild?.id);
        if (!message.guild) {
            const embed = new EmbedBuilder()
                .setColor('#ffcc32')
                .setDescription(`${emojis.error} This command only works in servers!`);
             return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        const guildId = message.guild.id;
        const claimableRoles = getClaimableRoles(guildId);
        const member = message.member;

        // List roles the user can drop roles
        if (args.length === 0) {
            const memberRoles = member.roles.cache
                .filter(role => claimableRoles.includes(role.id))
                .map(role => role);  

            if (memberRoles.length === 0) {
                const embed = new EmbedBuilder()
                    .setColor('#ffcc32')
                    .setDescription(`${emojis.error} You don\'t have any self-assignable roles to remove.`);
                 return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
            }

           const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
           const embed = new EmbedBuilder()
           .setTitle('🌟 Droppable Roles')
           .setColor(embed_color)
           .setDescription(`Use \`${prefix}drop <role name>\` to remove one of these roles:\n\n` + memberRoles.map(role => `${role}`).join('\n'))
           .setFooter({ text: `${memberRoles.length} droppable role${memberRoles.length !== 1 ? 's' : ''} • Today at ${currentTime}` })
           .setThumbnail(message.guild.iconURL({ dynamic: true }));

           return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        // drop a role
        const roleName = args.join(' ');
        const role = member.roles.cache.find(r => r.name.toLowerCase() === roleName.toLowerCase());
        
        if (!role) {
            const embed = new EmbedBuilder()
                .setColor('#c83636')
                .setDescription(`${emojis.cross} You don\'t have that role!`);
             return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }
        if (!claimableRoles.includes(role.id)) {
            const embed = new EmbedBuilder()
                .setColor('#ffcc32')
                .setDescription(`${emojis.error} That role isn\'t self-removable!`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        try {
            await member.roles.remove(role);
            const embed = new EmbedBuilder()
                .setColor('#77b255')
                .setDescription(`${emojis.tick} The ${role} role has been removed!`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        } catch (error) {
            console.error(error);
            const embed = new EmbedBuilder()
                .setColor('#c83636')
                .setDescription(`${emojis.cross} Failed to remove the role. The bot might not have permission.`);
             return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }
    },
};