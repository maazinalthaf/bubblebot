const {EmbedBuilder} = require('discord.js');
const database = require('../../utils/database');
const { embed_color, emojis, red, green, yellow } = require('../../utils/constants');
module.exports = {
    name: 'afk',
    async execute(client, message, args) {
        const afkMessage = args.join(' ');
        database.setAfk(message.author.id, afkMessage);

        if (afkMessage) {
            const embed = new EmbedBuilder()
            .setColor(green)
            .setDescription(`${emojis.tick} **${message.author}** You're now AFK with the status: **${afkMessage}**`);

            message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });

        } else {
            const embed = new EmbedBuilder()
            .setColor(green)
            .setDescription(`${emojis.tick} **${message.author}** You're now AFK with the status: **AFK**`);

            message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

    }
};
