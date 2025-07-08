const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const {embed_color, emojis } = require('../../utils/constants');

module.exports = {
    name: 'roles',
    async execute(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            const embed = new EmbedBuilder()
                .setColor('#C83636')
                .setDescription(`${emoji.cross} You do not have permission to use this command.`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        let target;
        
        try {
            if (message.mentions.members.first()) {
                target = message.mentions.members.first();
            } else if (args[0]) {
                target = await message.guild.members.fetch(args[0]).catch(() => null);
            } else {
                target = message.member;
            }

            
            if (!target) {
                const embed = new EmbedBuilder()
                    .setColor('#C83636')
                    .setDescription(`${emoji.cross} Could not find a user with ID: ${args[0]}`);
                return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
            }

            
            const roles = target.roles.cache
                .filter(role => role.id !== message.guild.id)
                .sort((a, b) => b.position - a.position) // Sort by position (highest to lowest)
                .map(role => `<@&${role.id}>`);

            
            const embed = new EmbedBuilder()
                .setColor(target.displayHexColor)
                .setTitle(`Roles for ${target.user.tag}`)
                .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { 
                        name: `Role Count: ${roles.length}`, 
                        value: roles.length ? roles.join('\n') : 'This user has no roles.'
                    }
                )
                .setFooter({ text: `User ID: ${target.id}` })
                .setTimestamp();

            
            message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });

        } catch (error) {
            console.error(error);
            const embed = new EmbedBuilder()
                .setColor('#C83636')
                .setDescription(`${emoji.cross} An error occurred while fetching the user information.`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }
    }
}