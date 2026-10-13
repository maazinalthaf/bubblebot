const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const {embed_color, emojis, red, green, yellow } = require('../../utils/constants');

module.exports = {
    name: 'snipe',
    aliases: ['s'],
    snipeExpiration: 15 * 60 * 1000,
    async execute(client, message, args) {
        if (!message.guild) {
            return message.reply('This command can only be used in a server.');
        }
        // Get snipes from client
        const snipes = client.snipes;

        // Clean expired snipes before displaying any message content.
        const channelSnipes = snipes.get(message.channel.id);
        if (channelSnipes) {
            const now = Date.now();
            const validSnipes = channelSnipes.filter(snipe => {
                return now - snipe.createdAt < this.snipeExpiration;
            });
            if (validSnipes.length < channelSnipes.length) {
                snipes.set(message.channel.id, validSnipes);
            }
        }

        // Check if the user has permission to use the snipe command
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            const embed = new EmbedBuilder()
                .setColor(red)
                .setDescription(`${emojis.cross} You do not have permission to use this command.`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        // Get the number of snipes requested, default to 1
        const snipeIndex = parseInt(args[0]) - 1 || 0;
        const snipedMessages = snipes.get(message.channel.id);

        if (!snipedMessages || !snipedMessages[snipeIndex]) {
            const embed = new EmbedBuilder()
                .setColor(yellow)
                .setDescription(`${emojis.error} There is no recently deleted message to snipe at that index!`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        const snipedMessage = snipedMessages[snipeIndex];
        const totalSnipes = snipedMessages.length;

        const embed = new EmbedBuilder()
            .setColor(embed_color)
            .setAuthor({ name: `<@${snipedMessage.authorId}>` })
            .setDescription((snipedMessage.content || '*No text content*').slice(0, 4096))
            .setTimestamp(snipedMessage.createdAt)
            .setFooter({ 
                text: `Snipe ${snipeIndex + 1}/${totalSnipes}`,  
            });
        
        // Add attachment if available
        if (snipedMessage.attachment) {
            embed.setImage(snipedMessage.attachment);
        }
        
        if (snipedMessage.attachment) {
            // Check if the attachment URL ends with a valid image or GIF extension
            if (/\.(gif|jpe?g|png|webp)$/i.test(snipedMessage.attachment)) {
                embed.setImage(snipedMessage.attachment);
            } else {
                embed.addFields({ name: 'Attachment', value: `[View Attachment](${snipedMessage.attachment})` });
            }
        }
        message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
    },
};