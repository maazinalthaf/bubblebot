const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const {embed_color, emojis, red, green, yellow } = require('../../utils/constants');

module.exports = {
    name: 'nick',
    async execute(client, message, args) {

        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
            const embed = new EmbedBuilder()
                .setColor(red)
                .setDescription(`${emojis.cross} You do not have permission to use this command.`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        const userInput = args[0];
        const newNickname = args.slice(1).join(' ');

        if (!userInput) {
            const embed = new EmbedBuilder()
                .setColor(yellow)
                .setDescription(`${emojis.error} Please provide a user mention/ID and the new nickname.`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        try {
            const userId = userInput.replace(/[<@!>]/g, '');
            const user = await client.users.fetch(userId);
            const member = await message.guild.members.fetch(user.id);

            if (member.roles.highest.position >= message.guild.members.me.roles.highest.position) {
                const embed = new EmbedBuilder()
                    .setColor(red)
                    .setDescription(`${emojis.cross} I cannot modify this user\'s nickname due to role hierarchy.`);
                return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
            }

            if (member.roles.highest.position >= message.member.roles.highest.position && message.member.id !== message.guild.ownerId) {
                const embed = new EmbedBuilder()
                    .setColor(red)
                    .setDescription(`${emojis.cross} You cannot modify this user\'s nickname due to role hierarchy.`);
                return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
            }

            if (!newNickname) {
                await member.setNickname(null);
                const embed = new EmbedBuilder()
                    .setColor(green)
                    .setDescription(`${emojis.tick} Successfully reset nickname for ${user}.`);
                return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
            }

            if (newNickname.length > 32) {
                const embed = new EmbedBuilder()
                    .setColor(yellow)
                    .setDescription(`${emojis.error} Nickname cannot be longer than 32 characters.`);
                return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
            }

            await member.setNickname(newNickname);
            
            const embed = new EmbedBuilder()
                .setColor(green)
                .setDescription(`${emojis.tick} Successfully changed ${user}'s nickname to: ${newNickname}`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });

        } catch (error) {
            console.error(error);
            const embed = new EmbedBuilder()
                .setColor(yellow)
                .setDescription(`${emojis.error} An error occurred while trying to change the nickname.`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }
    },
};
