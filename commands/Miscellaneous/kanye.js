const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { embed_color, emojis } = require('../../constants');

module.exports = {
    name: 'kanye',
    aliases: ['kanyequote', 'ye'],
    description: 'Get a random Kanye West quote.',
    async execute(client, message) {
        try {
            const response = await axios.get('https://api.kanye.rest/');
            const quote = response.data.quote;

            const embed = new EmbedBuilder()
                .setColor(embed_color)
                .setDescription(`"${quote}"`)
                .setAuthor({ name: 'Kanye West', iconURL: 'https://i.imgflip.com/41j06n.png?a475416' });

            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        } catch (error) {
            console.error('Error fetching Kanye quote:', error);
            const embed = new EmbedBuilder()
                .setColor(emojis.error)
                .setDescription('😔 Sorry, I couldn\'t fetch a Kanye quote right now. Try again later!')
                .setAuthor({ name: 'Kanye West', iconURL: 'https://i.imgflip.com/41j06n.png?a475416' });
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }
    }
};
