const { EmbedBuilder } = require('discord.js');
const { embed_color, emojis, red, green, yellow } = require('../../utils/constants');
const fs = require('fs');
const wordStatsPath = '../../wordStats.json';

module.exports = {
    name: 'wordusers',
    description: 'Shows who used a specific word the most',
    aliases: ['wordtop', 'wordleaders', 'whoused'],
    usage: '.wordusers <word> [number]',
    examples: ['.wordusers hello', '.wordusers discord 5', '.wordtop bot'],
    
    async execute(client, message, args) {
        if (!args[0]) {
            const embed = new EmbedBuilder()
                .setColor(yellow)
                .setDescription(`${emojis.error} Please specify a word to check.\nUsage: \`.wordusers <word> [number]\``);
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }

        const word = args[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        const limit = parseInt(args[1]) || 10;
        
        if (word.length < 3) {
            const embed = new EmbedBuilder()
                .setColor(yellow)
                .setDescription(`${emojis.error} Please specify a word with at least 3 characters.`);
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }

        if (limit < 1 || limit > 15) {
            const embed = new EmbedBuilder()
                .setColor(yellow)
                .setDescription(`${emojis.error} Please specify a user limit between 1 and 15.`);
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
        
        if (!wordStats[guildId] || !wordStats[guildId].userWordCounts || !wordStats[guildId].userWordCounts[word]) {
            const embed = new EmbedBuilder()
                .setColor(yellow)
                .setDescription(`${emojis.error} No usage data found for the word \`${word}\` in this server.`);
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }

        // Get top users for this word
        const userCounts = wordStats[guildId].userWordCounts[word];
        const topUsers = Object.entries(userCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, limit);

        // Fetch user information and create leaderboard
        const leaderboard = [];
        let totalUses = 0;

        for (const [userId, count] of topUsers) {
            totalUses += count;
            try {
                const user = await client.users.fetch(userId);
                leaderboard.push({
                    user: user.tag,
                    count: count
                });
            } catch (error) {
                // If user can't be fetched, use userId
                leaderboard.push({
                    user: `Unknown User (${userId})`,
                    count: count
                });
            }
        }

        const description = leaderboard.map((userData, index) => 
            `**${index + 1}.** ${userData.user} - **${userData.count}** time${userData.count !== 1 ? 's' : ''}`
        ).join('\n');

        const totalUsers = Object.keys(userCounts).length;
        const totalWordUses = wordStats[guildId].wordCounts?.[word] || totalUses;

        const embed = new EmbedBuilder()
            .setColor(embed_color || '#4289C1')
            .setTitle(`👥 Top Users for "${word}"`)
            .setDescription(description)
            .addFields(
                { name: '📊 Total Uses', value: `**${totalWordUses}** time${totalWordUses !== 1 ? 's' : ''}`, inline: true },
                { name: '👤 Unique Users', value: `**${totalUsers}** user${totalUsers !== 1 ? 's' : ''}`, inline: true },
                { name: '🎯 Displaying', value: `Top **${leaderboard.length}** user${leaderboard.length !== 1 ? 's' : ''}`, inline: true }
            )
            .setTimestamp();

        await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    },
};