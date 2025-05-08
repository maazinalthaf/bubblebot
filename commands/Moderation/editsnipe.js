const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const {embed_color, emojis, prefix } = require('../../constants');

// Object to store edited messages for each channel
const editsnipes = new Map();

module.exports = {
    name: 'editsnipe',
    aliases: ['es'],
    editsnipes, // Export the editsnipes map
    async execute(client, message, args) {
        // Check if the user has permission to use the ?editsnipe command
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            const embed = new EmbedBuilder()
                .setColor('#C83636')
                .setDescription('${emoji.cross} You do not have permission to use this command.');
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        // Get the number of editsnipes requested, default to 1
        const editsnipeIndex = parseInt(args[0]) - 1 || 0;
        const editsnipedMessages = editsnipes.get(message.channel.id);

        if (!editsnipedMessages || !editsnipedMessages[editsnipeIndex]) {
            const embed = new EmbedBuilder()
                .setColor('#ffcc32')
                .setDescription('${emojis.error} There is no recently edited message to snipe at that index!');
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        const editsnipedMessage = editsnipedMessages[editsnipeIndex];
        const totalEditsnipes = editsnipedMessages.length;

        // Create an embed for the editsniped message
        const embed = new EmbedBuilder()
            .setColor('#89CFF0')
            .setAuthor({ 
                name: editsnipedMessage.author.tag, 
                iconURL: editsnipedMessage.author.displayAvatarURL({ dynamic: true }) 
            })
            .addFields(
                { name: 'Original Message', value: editsnipedMessage.oldContent || '*No original content*' },
                { name: 'Edited Message', value: editsnipedMessage.newContent || '*No new content*' }
            )
            .setTimestamp(editsnipedMessage.editedAt)
            .setFooter({ 
                text: ` Editsnipe ${editsnipeIndex + 1}/${totalEditsnipes}`, 
            });

        message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
    },
};
