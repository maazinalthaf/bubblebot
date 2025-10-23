const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { embed_color, emojis, red, green, yellow } = require('../../utils/constants');
const fs = require('fs');
const wordStatsPath = '../../wordStats.json';

module.exports = {
    name: 'resetwordstats',
    description: 'Reset word statistics for this server',
    aliases: ['clearwordstats', 'resetwords'],
    usage: '.resetwordstats',
    examples: ['.resetwordstats'],
    permissions: ['ManageMessages'],
    
    async execute(client, message, args) {
        // Check permissions
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            const embed = new EmbedBuilder()
                .setColor(yellow)
                .setDescription(`${emojis.error} You do not have permission to use this command.`);
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
        const hadData = wordStats[guildId] && Object.keys(wordStats[guildId]).length > 0;

        if (hadData) {
            // Store backup of old data for confirmation message
            const oldWordCount = Object.values(wordStats[guildId]).reduce((sum, count) => sum + count, 0);
            const oldUniqueWords = Object.keys(wordStats[guildId]).length;
            
            delete wordStats[guildId];
            
            // Save updated stats
            try {
                fs.writeFileSync(require.resolve(wordStatsPath), JSON.stringify(wordStats, null, 2), 'utf8');
            } catch (error) {
                console.error('Error saving word stats:', error);
                const embed = new EmbedBuilder()
                    .setColor(red)
                    .setDescription(`${emojis.cross} Failed to reset word statistics. Please try again.`);
                return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
            }

            const embed = new EmbedBuilder()
                .setColor(green)
                .setDescription(`${emojis.tick} Word statistics have been reset for this server.\n\n**Cleared Data:**\n• **${oldWordCount}** total word occurrences\n• **${oldUniqueWords}** unique words`);
            
            await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        } else {
            const embed = new EmbedBuilder()
                .setColor(yellow)
                .setDescription(`${emojis.error} No word statistics found to reset for this server.`);
            
            await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }
    },
};