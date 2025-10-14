const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { embed_color, emojis, red, green, yellow } = require('../../utils/constants');

module.exports = {
    name: 'purge',
    aliases: ['clear', 'c'],
    description: 'Deletes a specified number of messages (1-100) from the channel',
    usage: '<number>',
    async execute(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            const embed = new EmbedBuilder()
                .setColor(red)
                .setDescription(`${emojis.cross} You do not have permission to use this command.`);
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }

        await message.delete().catch(() => {});

        // Validate input
        if (!args[0]) {
            const embed = new EmbedBuilder()
                .setColor(yellow)
                .setDescription(`${emojis.error} Please specify the number of messages to delete.\nUsage: \`${this.name} ${this.usage}\``);
            return message.channel.send({ embeds: [embed] }).then(msg => setTimeout(() => msg.delete(), 5000));
        }

        const amount = parseInt(args[0]);

        if (isNaN(amount)) {
            const embed = new EmbedBuilder()
                .setColor(yellow)
                .setDescription(`${emojis.error} Please provide a valid number.\nUsage: \`${this.name} ${this.usage}\``);
            return message.channel.send({ embeds: [embed] }).then(msg => setTimeout(() => msg.delete(), 5000));
        }

        if (amount <= 0 || amount > 100) {
            const embed = new EmbedBuilder()
                .setColor(yellow)
                .setDescription(`${emojis.error} Please provide a number between 1 and 100.`);
            return message.channel.send({ embeds: [embed] }).then(msg => setTimeout(() => msg.delete(), 5000));
        }

        try {
            
            const messages = await message.channel.messages.fetch({ limit: amount });
        
            const deletedMessages = await message.channel.bulkDelete(messages, true);
            
            // Send confirmation
            const embed = new EmbedBuilder()
                .setColor(green)
                .setDescription(`${emojis.tick} Successfully deleted ${deletedMessages.size} messages.`);
                
            const reply = await message.channel.send({ embeds: [embed] });
            setTimeout(() => reply.delete().catch(() => {}), 3000);
        } catch (error) {
            console.error('Error deleting messages:', error);
            const embed = new EmbedBuilder()
                .setColor(yellow)
                .setDescription(`${emojis.error} An error occurred while deleting messages. ${error.message.includes('Maximum') ? 'Messages must be younger than 14 days.' : 'Please try again.'}`);
            message.channel.send({ embeds: [embed] }).then(msg => setTimeout(() => msg.delete(), 5000));
        }
    }
};
