const { EmbedBuilder } = require('discord.js');
const { embed_color, emojis, red, green, yellow } = require('../../utils/constants');
const fs = require('fs');
const wordStatsPath = '../../wordStats.json';

module.exports = {
    name: 'wordstats',
    description: 'Shows the most commonly used words in this server',
    aliases: ['topwords', 'wordleaderboard'],
    usage: '.wordstats [number]',
    examples: ['.wordstats', '.wordstats 15', '.topwords 20'],
    
    async execute(client, message, args) {
        // Load current word stats
        let wordStats = {};
        try {
            if (fs.existsSync(require.resolve(wordStatsPath))) {
                wordStats = JSON.parse(fs.readFileSync(require.resolve(wordStatsPath), 'utf8'));
            }
        } catch (error) {
            console.error('Error loading word stats:', error);
        }

        const limit = parseInt(args[0]) || 10;
        
        // Validate limit
        if (limit < 1 || limit > 25) {
            const embed = new EmbedBuilder()
                .setColor(yellow)
                .setDescription(`${emojis.error} Please specify a number between 1 and 25.`);
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }

        const guildId = message.guild.id;
        
        if (!wordStats[guildId] || !wordStats[guildId].wordCounts || Object.keys(wordStats[guildId].wordCounts).length === 0) {
            const embed = new EmbedBuilder()
                .setColor(yellow)
                .setDescription(`${emojis.error} No word statistics available for this server yet. Start chatting to build up data!`);
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }

        // Get top words
        const topWords = Object.entries(wordStats[guildId].wordCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, limit)
            .map(([word, count], index) => ({ rank: index + 1, word, count }));

        const description = topWords.map(({ rank, word, count }) => 
            `**${rank}.** \`${word}\` - **${count}** time${count !== 1 ? 's' : ''}`
        ).join('\n');
        
        const totalWords = Object.values(wordStats[guildId].wordCounts).reduce((sum, count) => sum + count, 0);
        const uniqueWords = Object.keys(wordStats[guildId].wordCounts).length;

        const embed = new EmbedBuilder()
            .setColor(embed_color)
            .setTitle(`📊 Most Common Words in ${message.guild.name}`)
            .setDescription(description)
            .addFields(
                { name: '📝 Total Tracked Words', value: `**${totalWords}** words`, inline: true },
                { name: '🔤 Unique Words', value: `**${uniqueWords}** words`, inline: true },
                { name: '📈 Displaying', value: `Top **${topWords.length}** words`, inline: true }
            )
            .setTimestamp();

        await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    },
};