const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { embed_color, emojis } = require('../../constants');

module.exports = {
    name: 'timer',
    aliases: ['t', 'countdown'],
    description: 'Set a timer with custom duration',
    async execute(client, message, args) {
        if (!args.length) {
            const helpEmbed = new EmbedBuilder()
                .setColor(embed_color)
                .setTitle('⏰ Timer Help')
                .setDescription('Please provide a duration!\nExamples:\n`.timer 5m` - 5 minute timer\n`.timer 1h 30m` - 1 hour 30 minute timer\n`.timer 45s` - 45 second timer')
                .addFields([
                    { name: 'Valid Units', value: '`s` - seconds\n`m` - minutes\n`h` - hours\n`d` - days', inline: true },
                    { name: 'Max Duration', value: '24 hours', inline: true }
                ]);
            
            return message.reply({ embeds: [helpEmbed] });
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
                const errorEmbed = new EmbedBuilder()
                    .setColor('#c83636')
                    .setTitle(`${emojis.cross} Invalid Time Format`)
                    .setDescription(`\`${arg}\` is not a valid time format. Use format like \`5m\`, \`1h\`, \`30s\`, or \`2d\``);
                
                return message.reply({ embeds: [errorEmbed] });
            }

            const [, amount, unit] = match;
            totalSeconds += parseInt(amount) * timeUnits[unit];
        }

        if (totalSeconds <= 0) {
            const errorEmbed = new EmbedBuilder()
                .setColor('#c83636')
                .setTitle(`${emojis.cross} Invalid Duration`)
                .setDescription('Please provide a valid duration greater than 0!');
            
            return message.reply({ embeds: [errorEmbed] });
        }

        if (totalSeconds > 86400) { // 24 hours
            const errorEmbed = new EmbedBuilder()
                .setColor('#c83636')
                .setTitle(`${emojis.cross} Timer Too Long`)
                .setDescription('Timer cannot be longer than 24 hours!');
            
            return message.reply({ embeds: [errorEmbed] });
        }

        const endTime = Math.floor(Date.now() / 1000) + totalSeconds;

        // Create cancel button
        const cancelButton = new ButtonBuilder()
            .setCustomId(`cancel_timer_${message.id}`)
            .setLabel('Cancel Timer')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🗑️');

        const buttonRow = new ActionRowBuilder().addComponents(cancelButton);

        // Create initial embed
        const embed = new EmbedBuilder()
            .setColor(embed_color)
            .setTitle('⏰ Timer Started')
            .setDescription(`A timer has been set for **${formatDuration(totalSeconds)}**`)
            .addFields([
                { name: '⏳ Time Remaining', value: formatDuration(totalSeconds), inline: true },
                { name: '🎯 End Time', value: `<t:${endTime}:R>`, inline: true }
            ])
            .setFooter({ text: `Requested by ${message.author.tag}` })
            .setTimestamp();

        const timerMessage = await message.reply({ 
            embeds: [embed], 
            components: [buttonRow] 
        });

        // Create button collector
        const collector = timerMessage.createMessageComponentCollector({ 
            filter: i => i.customId === `cancel_timer_${message.id}` && i.user.id === message.author.id,
            time: totalSeconds * 1000
        });

        collector.on('collect', async i => {
            clearInterval(interval);
            
            const cancelledEmbed = new EmbedBuilder()
                .setColor('#c836363')
                .setTitle('⏰ Timer Cancelled')
                .setDescription(`The timer for **${formatDuration(totalSeconds)}** was cancelled.`)
                .setFooter({ text: `Cancelled by ${message.author.tag}` })
                .setTimestamp();
            
            await i.update({ 
                embeds: [cancelledEmbed], 
                components: [] 
            });
            
            collector.stop();
        });

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
                    collector.stop();
                    
                    const endEmbed = new EmbedBuilder()
                        .setColor(embed_color)
                        .setTitle('⏰ Timer Complete!')
                        .setDescription(`Your timer for **${formatDuration(lastUpdate)}** has ended!`)
                        .setFooter({ text: `Requested by ${message.author.tag}` })
                        .setTimestamp();

                    await timerMessage.edit({ 
                        embeds: [endEmbed], 
                        components: [] 
                    });
                    
                    await message.channel.send({ 
                        content: `${message.author} Your timer has ended! ⏰`,
                        allowedMentions: { users: [message.author.id] }
                    });
                    return;
                }

                // Update progress bar based on time elapsed
                const progressBar = createProgressBar(timeLeft, lastUpdate);
                
                const updateEmbed = new EmbedBuilder()
                    .setColor(embed_color)
                    .setTitle('⏰ Timer Running')
                    .setDescription(`${progressBar}\nTime remaining: **${formatDuration(timeLeft)}**`)
                    .addFields([
                        { name: '⏳ Time Remaining', value: formatDuration(timeLeft), inline: true },
                        { name: '🎯 End Time', value: `<t:${endTime}:R>`, inline: true }
                    ])
                    .setFooter({ text: `Requested by ${message.author.tag}` })
                    .setTimestamp();

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
    const importantTimes = [3600, 1800, 900, 300, 180, 120, 60, 30, 15, 10, 5, 4, 3, 2, 1];
    
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

function createProgressBar(timeLeft, totalDuration) {
    const progress = 1 - (timeLeft / totalDuration);
    const progressBarLength = 10;
    const filledBlocks = Math.round(progress * progressBarLength);
    const emptyBlocks = progressBarLength - filledBlocks;
    
    return `[${'█'.repeat(filledBlocks)}${'░'.repeat(emptyBlocks)}] ${Math.round(progress * 100)}%`;
}