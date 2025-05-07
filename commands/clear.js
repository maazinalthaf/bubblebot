const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'purge',
    aliases: ['clear', 'c'],
    async execute(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            const embed = new EmbedBuilder()
                .setColor('#C83636')
                .setDescription('<:cross:1332418251849732206> You do not have permission to use this command.');
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        const amount = parseInt(args[0]);

        if (isNaN(amount) || amount <= 0 || amount > 100) {
            const embed = new EmbedBuilder()
                .setColor('#FFCC32')
                .setDescription('<:error:1332418281675558963> Please provide a number between 1 and 100 for the amount of messages to delete.');
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        try {
            const deletedMessages = await message.channel.bulkDelete(amount, true);
            const embed = new EmbedBuilder()
                .setColor('#77B255')
                .setDescription(`<:tick:1332418339372273684> Successfully deleted ${deletedMessages.size} messages.`);
            message.channel.send({ embeds: [embed] }).then(msg => setTimeout(() => msg.delete(), 2000));
        } catch (error) {
            console.error('Error deleting messages:', error);
            const embed = new EmbedBuilder()
                .setColor('#FFCC32')
                .setDescription('<:error:1332418281675558963> An error occurred while deleting messages. Make sure the messages are not older than 14 days.');
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }
    }
};
