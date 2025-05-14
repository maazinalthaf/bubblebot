const { EmbedBuilder } = require('discord.js');
const { embed_color } = require('../../constants');

module.exports = {
    name: 'timer',
    aliases: ['t', 'countdown'],
    description: 'Set a timer with custom duration',
    async execute(client, message, args) {
        if (!args.length) {
            return message.reply('Please provide a duration! Example: `.timer 5m` or `.timer 1h 30m`');
        }

        // Parse duration
        let totalSeconds = 0;
        const timeUnits = {
            's': 1,
            'm': 60,
            'h': 3600,
            'd': 86400
        };

        for (const arg of args) {
            const match = arg.match(/^(\d+)([smhd])$/);
            if (!match) {
                return message.reply(`Invalid time format: ${arg}. Use format like 5m, 1h, 30s, or 2d`);
            }

            const [, amount, unit] = match;
            totalSeconds += parseInt(amount) * timeUnits[unit];
        }

        if (totalSeconds <= 0) {
            return message.reply('Please provide a valid duration greater than 0!');
        }

        if (totalSeconds > 86400) { // 24 hours
            return message.reply('Timer cannot be longer than 24 hours!');
        }

        const endTime = Math.floor(Date.now() / 1000) + totalSeconds;

        // Create initial embed
        const embed = new EmbedBuilder()
            .setColor(embed_color)
            .setTitle('⏰ Timer Started')
            .setDescription(`Duration: ${formatDuration(totalSeconds)}`)

        const timerMessage = await message.reply({ embeds: [embed] });

        // Calculate update intervals based on total duration
        const updateIntervals = calculateUpdateIntervals(totalSeconds);
        let lastUpdate = totalSeconds;

        // Update timer at calculated intervals
        const interval = setInterval(async () => {
            totalSeconds--;
            const timeLeft = Math.max(0, totalSeconds);

            // Check if we should update the embed
            if (updateIntervals.includes(timeLeft) || timeLeft === 0) {
                if (timeLeft === 0) {
                    clearInterval(interval);
                    
                    const endEmbed = new EmbedBuilder()
                        .setColor('#00ff00')
                        .setTitle('⏰ Timer Complete!')
                        .setDescription(`Your timer has ended!`)
                        .setFooter({ text: `Requested by ${message.author.tag}` });

                    await timerMessage.edit({ embeds: [endEmbed] });
                    await message.channel.send(`${message.author} Your timer has ended! ⏰`);
                    return;
                }

                const updateEmbed = new EmbedBuilder()
                    .setColor(embed_color)
                    .setTitle('⏰ Timer Running')
                    .setDescription(`Duration: ${formatDuration(timeLeft)}`)
                    .addFields([
                        { name: '⏳ Time Remaining', value: formatDuration(timeLeft), inline: true },
                        { name: '🎯 End Time', value: `<t:${endTime}:R>`, inline: true }
                    ])
                    .setFooter({ text: `Requested by ${message.author.tag}` });

                await timerMessage.edit({ embeds: [updateEmbed] });
                lastUpdate = timeLeft;
            }
        }, 1000);
    },
};

function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}s`);

    return parts.join(' ');
}

function calculateUpdateIntervals(totalSeconds) {
    const intervals = new Set();
    
    // Always update at these specific times
    const importantTimes = [3600, 1800, 900, 300, 60, 30, 10, 5, 4, 3, 2, 1];
    
    // Add important time intervals
    for (const time of importantTimes) {
        if (totalSeconds >= time) {
            intervals.add(time);
        }
    }

    // For longer timers, add hourly updates
    if (totalSeconds > 3600) {
        for (let i = Math.floor(totalSeconds / 3600); i > 0; i--) {
            intervals.add(i * 3600);
        }
    }

    return Array.from(intervals).sort((a, b) => b - a);
} 