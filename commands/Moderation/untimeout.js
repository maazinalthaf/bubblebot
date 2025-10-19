const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { embed_color, emojis, red, green, yellow } = require('../../utils/constants');

module.exports = {
    name: 'untimeout',
    async execute(client, message, args) {
        // Check if the user has permission to use the command
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            const embed = new EmbedBuilder()
                .setColor(red)
                .setDescription(`${emojis.cross} You do not have permission to use this command.`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        // Check if the correct arguments are provided
        const userInput = args[0];
        if (!userInput) {
            const embed = new EmbedBuilder()
                .setColor(yellow)
                .setDescription(`${emojis.error} Please provide a user mention or ID to untimeout, or use \`all\` to untimeout everyone.`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        // Handle "all" argument
        if (userInput.toLowerCase() === 'all') {
            try {
                // Fetch all members with timeout in the guild
                const members = await message.guild.members.fetch();
                const timedOutMembers = members.filter(member => member.isCommunicationDisabled());
                
                if (timedOutMembers.size === 0) {
                    const embed = new EmbedBuilder()
                        .setColor(yellow)
                        .setDescription(`${emojis.error} There are no timed out members in this server.`);
                    return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
                }

                // Remove timeout from all timed out members
                let successCount = 0;
                let errorCount = 0;
                
                for (const [, member] of timedOutMembers) {
                    try {
                        await member.timeout(null);
                        successCount++;
                    } catch (error) {
                        console.error(`Failed to untimeout ${member.user.tag}:`, error);
                        errorCount++;
                    }
                }

                const embed = new EmbedBuilder()
                    .setColor(green)
                    .setDescription(`${emojis.tick} Successfully removed timeout from **${successCount}** members.${errorCount > 0 ? `\n${emojis.cross} Failed to remove timeout from **${errorCount}** members.` : ''}`);
                return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });

            } catch (error) {
                console.error(error);
                const embed = new EmbedBuilder()
                    .setColor(red)
                    .setDescription(`${emojis.error} An error occurred while trying to untimeout all members.`);
                return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
            }
        }

        // Handle single user untimeout (original functionality)
        try {
            // Extract user ID from mention if necessary
            const userId = userInput.replace(/[<@!>]/g, '');
            const user = await client.users.fetch(userId);
            const member = await message.guild.members.fetch(user.id);

            // Check if the user is timed out
            if (!member.isCommunicationDisabled()) {
                const embed = new EmbedBuilder()
                    .setColor(red)
                    .setDescription(`${emojis.cross} ${user} is not timed out.`);
                return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
            }

            // Remove the timeout
            await member.timeout(null);

            const embed = new EmbedBuilder()
                .setColor(green)
                .setDescription(`${emojis.tick} Successfully removed timeout for ${user}.`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        } catch (error) {
            console.error(error);
            const embed = new EmbedBuilder()
                .setColor(yellow)
                .setDescription(`${emojis.error} An error occurred while trying to untimeout the user. Please make sure the user ID is valid.`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }
    },
};