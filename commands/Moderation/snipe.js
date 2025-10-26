const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const {embed_color, emojis, red, green, yellow } = require('../../utils/constants');

module.exports = {
    name: 'snipe',
    aliases: ['s'],
    async execute(client, message, args) {
        // Get snipes from client
        const snipes = client.snipes;

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
            .setAuthor({ 
                name: snipedMessage.author.tag, 
                iconURL: snipedMessage.author.displayAvatarURL({ dynamic: true }) 
            })
            .setDescription(snipedMessage.content || '*No text content*')
            .setTimestamp(snipedMessage.createdAt)
            .setFooter({ 
                text: `Snipe ${snipeIndex + 1}/${totalSnipes}`,  
            });
        
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