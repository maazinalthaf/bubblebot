const { EmbedBuilder } = require('discord.js');
const { embed_color, emojis, red, green, yellow } = require('../../utils/constants');
const fs = require('fs');
const wordStatsPath = '../../wordStats.json';

module.exports = {
    name: 'wordinfo',
    description: 'Get detailed information about a specific word usage in this server',
    aliases: ['wordstat', 'wordusage'],
    usage: '.wordinfo <word>',
    examples: ['.wordinfo hello', '.wordinfo discord', '.wordstat bot'],
    
    async execute(client, message, args) {
        if (!args[0]) {
            const embed = new EmbedBuilder()
                .setColor(yellow)
                .setDescription(`${emojis.error} Please specify a word to check.\nUsage: \`.wordinfo <word>\``);
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }

        const word = args[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        
        if (word.length < 3) {
            const embed = new EmbedBuilder()
                .setColor(yellow)
                .setDescription(`${emojis.error} Please specify a word with at least 3 characters.`);
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }

        // Load current word stats
        let wordStats = {};
        try {
            if (fs.existsSync(require.resolve(wordStatsPath))) {
                wordStats = JSON.parse(fs.readFileSync(require.resolve(wordStatsPath), 'utf8'));
            }
        } catch (error) {
            console.error('Error loading word stats:', error);
        }

        const guildId = message.guild.id;
        
        if (!wordStats[guildId] || !wordStats[guildId].wordCounts || !wordStats[guildId].wordCounts[word]) {
            const embed = new EmbedBuilder()
                .setColor(yellow)
                .setDescription(`${emojis.error} The word \`${word}\` hasn't been used in this server or isn't being tracked.`);
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }

        const wordCount = wordStats[guildId].wordCounts[word];
        
        // Calculate rank
        const sortedWords = Object.entries(wordStats[guildId].wordCounts)
            .sort(([,a], [,b]) => b - a);
        
        const rank = sortedWords.findIndex(([w]) => w === word) + 1;
        const totalWords = Object.values(wordStats[guildId].wordCounts).reduce((sum, count) => sum + count, 0);
        const percentage = ((wordCount / totalWords) * 100).toFixed(2);

        // Get top user for this word
        let topUser = null;
        let topUserCount = 0;
        
        if (wordStats[guildId].userWordCounts && wordStats[guildId].userWordCounts[word]) {
            const userCounts = wordStats[guildId].userWordCounts[word];
            const topUserEntry = Object.entries(userCounts)
                .sort(([,a], [,b]) => b - a)[0];
            
            if (topUserEntry) {
                topUserCount = topUserEntry[1];
                try {
                    const user = await client.users.fetch(topUserEntry[0]);
                    topUser = user.tag;
                } catch (error) {
                    topUser = `Unknown User (${topUserEntry[0]})`;
                }
            }
        }

        const uniqueUsers = wordStats[guildId].userWordCounts?.[word] ? Object.keys(wordStats[guildId].userWordCounts[word]).length : 0;

        const embed = new EmbedBuilder()
            .setColor(embed_color || '#4289C1')
            .setTitle(`📊 Word Info: "${word}"`)
            .setDescription(`Detailed usage statistics for the word \`${word}\``)
            .addFields(
                { name: '🔄 Total Uses', value: `**${wordCount}** time${wordCount !== 1 ? 's' : ''}`, inline: true },
                { name: '🏆 Rank', value: `**#${rank}** / ${sortedWords.length}`, inline: true },
                { name: '📈 Usage Rate', value: `**${percentage}%** of all words`, inline: true },
                { name: '👥 Unique Users', value: `**${uniqueUsers}** user${uniqueUsers !== 1 ? 's' : ''}`, inline: true },
                { name: '👑 Top User', value: topUser ? `${topUser} (**${topUserCount}** times)` : 'No data', inline: true },
                { name: '📝 First Tracked', value: 'Since bot startup', inline: true }
            )
            .setTimestamp();

        await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    },
};