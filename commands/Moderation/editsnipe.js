const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const {embed_color, emojis, red, green, yellow } = require('../../utils/constants');

module.exports = {
    name: 'editsnipe',
    aliases: ['es'],
    editsnipeExpiration: 15 * 60 * 1000,
    async execute(client, message, args) {
        if (!message.guild) {
            return message.reply('This command can only be used in a server.');
        }
        const editsnipes = client.editsnipes;

        // Clean expired editsnipes before displaying any message content.
        const channelEditsnipes = editsnipes.get(message.channel.id);
        if (channelEditsnipes) {
            const now = Date.now();
            const validEditsnipes = channelEditsnipes.filter(editsnipe => {
                return now - editsnipe.editedAt < this.editsnipeExpiration;
            });
            if (validEditsnipes.length < channelEditsnipes.length) {
                editsnipes.set(message.channel.id, validEditsnipes);
            }
        }

        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            const embed = new EmbedBuilder()
                .setColor(red)
                .setDescription(`${emojis.cross} You do not have permission to use this command.`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        // Get the number of editsnipes requested, default to 1
        const editsnipeIndex = parseInt(args[0]) - 1 || 0;
        const editsnipedMessages = editsnipes.get(message.channel.id);

        if (!editsnipedMessages || !editsnipedMessages[editsnipeIndex]) {
            const embed = new EmbedBuilder()
                .setColor(yellow)
                .setDescription(`${emojis.error} There is no recently edited message to snipe at that index!`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        const editsnipedMessage = editsnipedMessages[editsnipeIndex];
        const totalEditsnipes = editsnipedMessages.length;

        const embed = new EmbedBuilder()
            .setColor(embed_color)
            .setAuthor({ name: `<@${editsnipedMessage.authorId}>` })
            .addFields(
                { name: 'Original Message', value: (editsnipedMessage.oldContent || '*No original content*').slice(0, 1024) },
                { name: 'Edited Message', value: (editsnipedMessage.newContent || '*No new content*').slice(0, 1024) }
            )
            .setTimestamp(editsnipedMessage.editedAt)
            .setFooter({ 
                text: `Editsnipe ${editsnipeIndex + 1}/${totalEditsnipes}`, 
            });

        message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
    },
};