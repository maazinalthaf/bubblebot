const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { EMBED_COLORS, EMOJIS, PREFIX } = require('../../config/constants');

module.exports = {
    name: 'nick',
    async execute(client, message, args) {
        // Check if the user has permission to use the command
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
            const embed = new EmbedBuilder()
                .setColor(EMBED_COLORS.ERROR)
                .setDescription(`${EMOJIS.CROSS} You do not have permission to use this command.`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        // Check if args are provided
        const userInput = args[0];
        const newNickname = args.slice(1).join(' ');

        if (!userInput) {
            const embed = new EmbedBuilder()
                .setColor(EMBED_COLORS.WARNING)
                .setDescription(`${EMOJIS.ERROR} Please provide a user mention/ID and the new nickname.`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        try {
            // Extract user ID from mention if necessary
            const userId = userInput.replace(/[<@!>]/g, '');
            const user = await client.users.fetch(userId);
            const member = await message.guild.members.fetch(user.id);

            // Check if the bot can manage the target user's nickname
            if (member.roles.highest.position >= message.guild.members.me.roles.highest.position) {
                const embed = new EmbedBuilder()
                    .setColor(EMBED_COLORS.ERROR)
                    .setDescription(`${EMOJIS.CROSS} I cannot modify this user's nickname due to role hierarchy.`);
                return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
            }

            // Check if the command user can manage the target user's nickname
            if (member.roles.highest.position >= message.member.roles.highest.position && message.member.id !== message.guild.ownerId) {
                const embed = new EmbedBuilder()
                    .setColor(EMBED_COLORS.ERROR)
                    .setDescription(`${EMOJIS.CROSS} You cannot modify this user's nickname due to role hierarchy.`);
                return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
            }

            // If no new nickname is provided, reset it
            if (!newNickname) {
                await member.setNickname(null);
                const embed = new EmbedBuilder()
                    .setColor(EMBED_COLORS.SUCCESS)
                    .setDescription(`${EMOJIS.TICK} Successfully reset nickname for ${user}.`);
                return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
            }

            // Check nickname length
            if (newNickname.length > 32) {
                const embed = new EmbedBuilder()
                    .setColor(EMBED_COLORS.WARNING)
                    .setDescription(`${EMOJIS.ERROR} Nickname cannot be longer than 32 characters.`);
                return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
            }

            // Set the new nickname
            await member.setNickname(newNickname);
            
            const embed = new EmbedBuilder()
                .setColor(EMBED_COLORS.SUCCESS)
                .setDescription(`${EMOJIS.TICK} Successfully changed ${user}'s nickname to: ${newNickname}`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });

        } catch (error) {
            console.error(error);
            const embed = new EmbedBuilder()
                .setColor(EMBED_COLORS.ERROR)
                .setDescription(`${EMOJIS.ERROR} An error occurred while trying to change the nickname.`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }
    },
};