const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const {embed_color, emojis, prefix } = require('../../constants');

// Object to store deleted messages for each channel
const snipes = new Map();

module.exports = {
    name: 'snipe',
    aliases: ['s'],
    snipes, // Export the snipes map
    async execute(client, message, args) {
        // Check if the user has permission to use the ?snipe command
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            const embed = new EmbedBuilder()
                .setColor('#C83636')
                .setDescription('${emoji.cross} You do not have permission to use this command.');
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        // Get the number of snipes requested, default to 1
        const snipeIndex = parseInt(args[0]) - 1 || 0;
        const snipedMessages = snipes.get(message.channel.id);

        if (!snipedMessages || !snipedMessages[snipeIndex]) {
            const embed = new EmbedBuilder()
                .setColor('#ffcc32')
                .setDescription('${emojis.error} There is no recently deleted message to snipe at that index!');
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        const snipedMessage = snipedMessages[snipeIndex];
        const totalSnipes = snipedMessages.length;

        // Create an embed for the sniped message
        const embed = new EmbedBuilder()
            .setColor('#89CFF0')
            .setAuthor({ 
                name: snipedMessage.author.tag, 
                iconURL: snipedMessage.author.displayAvatarURL({ dynamic: true }) 
            })
            .setDescription(snipedMessage.content || '*No text content*')
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
