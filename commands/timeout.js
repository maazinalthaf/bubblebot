const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'timeout',
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
        const duration = args[1];
        const reason = args.slice(2).join(' ') || 'No reason provided';

        if (!userInput || !duration) {
            const embed = new EmbedBuilder()
                .setColor('#ffcc32')
                .setDescription('<:hazard:1283227908491710505> Please provide a user mention/ID and duration (e.g., 1h, 1d, 7d).');
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        try {
            // Extract user ID from mention if necessary
            const userId = userInput.replace(/[<@!>]/g, '');
            const user = await client.users.fetch(userId);
            const member = await message.guild.members.fetch(user.id);

            // Convert duration string to milliseconds
            const durationInMs = parseDuration(duration);
            if (!durationInMs) {
                const embed = new EmbedBuilder()
                    .setColor('#ffcc32')
                    .setDescription('<:hazard:1283227908491710505> Invalid duration format. Use format: 1m, 1h, 1d, etc.');
                return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
            }

            // Check if duration is within Discord's limits (max 28 days)
            if (durationInMs > 28 * 24 * 60 * 60 * 1000) {
                const embed = new EmbedBuilder()
                    .setColor('#ffcc32')
                    .setDescription('<:hazard:1283227908491710505> Timeout duration cannot exceed 28 days.');
                return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
            }

            // Apply the timeout
            await member.timeout(durationInMs, reason);

            // Create and send DM embed to the user
            const dmEmbed = new EmbedBuilder()
                .setColor('#89CFF0')
                .setThumbnail(message.guild.iconURL({ dynamic: true }))
                .setTitle(`You have been timed out in ${message.guild.name}`)
                .addFields(
                    { name: 'Duration', value: duration, inline: true },
                    { name: 'Reason', value: reason, inline: true },
                    { name: 'Moderator', value: message.author.tag, inline: true }
                )
                .setTimestamp();

            try {
                await user.send({ embeds: [dmEmbed] });
            } catch (dmError) {
                console.log(`Could not DM user ${user.tag}`);
                // Continue with the timeout even if DM fails
            }

            // Send confirmation in the channel
            const embed = new EmbedBuilder()
                .setColor('#77B255')
                .setDescription(`<:tick:1326247406576210012> Successfully timed out ${user} for ${duration}\nReason: **${reason}**`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        } catch (error) {
            console.error(error);
            const embed = new EmbedBuilder()
                .setColor('#ffcc32')
                .setDescription('<:hazard:1283227908491710505> An error occurred while trying to timeout the user.');
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }
    },
};

// Helper function to parse duration string to milliseconds
function parseDuration(duration) {
    const match = duration.match(/^(\d+)([mhd])$/);
    if (!match) return null;

    const [, amount, unit] = match;
    const multipliers = {
        'm': 60 * 1000,            // minutes to milliseconds
        'h': 60 * 60 * 1000,       // hours to milliseconds
        'd': 24 * 60 * 60 * 1000   // days to milliseconds
    };

    return parseInt(amount) * multipliers[unit];
}