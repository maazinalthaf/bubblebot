const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'untimeout',
    async execute(client, message, args) {
        // Check if the user has permission to use the command
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            const embed = new EmbedBuilder()
                .setColor('#C83636')
                .setDescription('<:cross:1283228336666968114> You do not have permission to use this command.');
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        // Check if the correct arguments are provided
        const userInput = args[0];
        if (!userInput) {
            const embed = new EmbedBuilder()
                .setColor('#ffcc32')
                .setDescription('<:hazard:1283227908491710505> Please provide a user mention or ID to untimeout.');
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        try {
            // Extract user ID from mention if necessary
            const userId = userInput.replace(/[<@!>]/g, '');
            const user = await client.users.fetch(userId);
            const member = await message.guild.members.fetch(user.id);

            // Check if the user is timed out
            if (!member.isCommunicationDisabled()) {
                const embed = new EmbedBuilder()
                    .setColor('#C83636')
                    .setDescription(`<:cross:1283228336666968114> ${user} is not timed out.`);
                return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
            }

            // Remove the timeout
            await member.timeout(null);

            const embed = new EmbedBuilder()
                .setColor('#77B255')
                .setDescription(`<:tick:1326247406576210012> Successfully removed timeout for ${user}.`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        } catch (error) {
            console.error(error);
            const embed = new EmbedBuilder()
                .setColor('#ffcc32')
                .setDescription('<:hazard:1283227908491710505> An error occurred while trying to untimeout the user.');
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }
    },
};
