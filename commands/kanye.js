const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    name: 'kanye',
    aliases: ['kanyequote', 'ye'],
    async execute(client, message) {
        try {
            const response = await axios.get('https://api.kanye.rest/');
            const quote = response.data.quote;

            const embed = new EmbedBuilder()
                .setColor('#F5C518')
                .setTitle('Kanye Wisdom')
                .setThumbnail('https://i.imgflip.com/41j06n.png?a475416')
                .setDescription(`"${quote}."`)
                .setFooter({ text: 'Powered by kanye.rest' })
                .setTimestamp();

            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        } catch (error) {
            console.error('Error fetching Kanye quote:', error);
            const embed = new EmbedBuilder()
                .setColor('#C83636')
                .setDescription('😔 Sorry, I couldn’t fetch a Kanye quote right now. Try again later!');
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }
    }
};
