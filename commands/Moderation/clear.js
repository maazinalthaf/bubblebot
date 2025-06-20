const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const {embed_color, emojis, prefix } = require('../../constants');

module.exports = {
    name: 'purge',
    aliases: ['clear', 'c'],
    async execute(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            const embed = new EmbedBuilder()
                .setColor('#C83636')
                .setDescription(`${emoji.cross} You do not have permission to use this command.`);
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }

        
        await message.delete().catch(() => {});

        const amount = parseInt(args[0]);

        if (isNaN(amount)) {
            const embed = new EmbedBuilder()
                .setColor('#FFCC32')
                .setDescription(`${emojis.error} Please provide a valid number.`);
            return message.channel.send({ embeds: [embed] }).then(msg => setTimeout(() => msg.delete(), 5000));
        }

        if (amount <= 0 || amount > 100) {
            const embed = new EmbedBuilder()
                .setColor('#FFCC32')
                .setDescription(`${emojis.error} Please provide a number between 1 and 100.`);
            return message.channel.send({ embeds: [embed] }).then(msg => setTimeout(() => msg.delete(), 5000));
        }

        try {
            // Fetch messages (including the command message)
            const messages = await message.channel.messages.fetch({ limit: amount + 1 });
            
            // Delete all fetched messages
            const deletedMessages = await message.channel.bulkDelete(messages, true);
            
            const embed = new EmbedBuilder()
                .setColor('#77B255')
                .setDescription(`${emojis.tick} Successfully deleted ${deletedMessages.size - 1} messages.`);
                
            const reply = await message.channel.send({ embeds: [embed] });
            setTimeout(() => reply.delete().catch(() => {}), 2000);
        } catch (error) {
            console.error('Error deleting messages:', error);
            const embed = new EmbedBuilder()
                .setColor('#FFCC32')
                .setDescription(`${emojis.error} An error occurred while deleting messages. Make sure the messages are not older than 14 days.`);
            message.channel.send({ embeds: [embed] }).then(msg => setTimeout(() => msg.delete(), 5000));
        }
    }
};
