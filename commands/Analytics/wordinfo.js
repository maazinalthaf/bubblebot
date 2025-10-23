const { EmbedBuilder } = require('discord.js');
const { embed_color, emojis, red, green, yellow } = require('../../utils/constants');
const fs = require('fs');
const wordStatsPath = '../../wordStats.json';

module.exports = {
    name: 'wordinfo',
    description: 'Get information about a specific word usage in this server',
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
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false }});
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
        
        if (!wordStats[guildId] || Object.keys(wordStats[guildId]).length === 0) {
            const embed = new EmbedBuilder()
                .setColor(yellow)
                .setDescription(`${emojis.error} No word statistics available for this server yet.`);
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }

        const wordCount = wordStats[guildId][word] || 0;
        
        if (wordCount === 0) {
            const embed = new EmbedBuilder()
                .setColor(yellow)
                .setDescription(`${emojis.error} The word \`${word}\` hasn't been used in this server or isn't being tracked.`);
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }

        // Calculate rank
        const sortedWords = Object.entries(wordStats[guildId])
            .sort(([,a], [,b]) => b - a);
        
        const rank = sortedWords.findIndex(([w]) => w === word) + 1;
        const totalWords = Object.values(wordStats[guildId]).reduce((sum, count) => sum + count, 0);
        const percentage = ((wordCount / totalWords) * 100).toFixed(2);

        const embed = new EmbedBuilder()
            .setColor(embed_color || '#4289C1')
            .setTitle(`📊 Word Info: "${word}"`)
            .setDescription(`Detailed usage statistics for the word \`${word}\``)
            .addFields(
                { name: '🔄 Times Used', value: `**${wordCount}** time${wordCount !== 1 ? 's' : ''}`, inline: true },
                { name: '🏆 Rank', value: `**#${rank}** / ${sortedWords.length}`, inline: true },
                { name: '📈 Usage Rate', value: `**${percentage}%** of all words`, inline: true }
            )
            .setFooter({ text: `Total tracked words: ${totalWords} • Use .wordstats for full leaderboard` })
            .setTimestamp();

        await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    },
};