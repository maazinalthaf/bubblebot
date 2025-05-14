const { EmbedBuilder } = require('discord.js');
const { embed_color } = require('../../constants');

module.exports = {
    name: 'stopwatch',
    aliases: ['sw', 'timer'],
    description: 'Start a stopwatch',
    async execute(client, message, args) {
        const startTime = Date.now();
        let isRunning = true;

        // Create initial embed
        const embed = new EmbedBuilder()
            .setColor(embed_color)
            .setTitle('⏱️ Stopwatch')
            .setDescription('0s')
            .setFooter({ text: 'Type .stop to stop the stopwatch' });

        const stopwatchMessage = await message.reply({ embeds: [embed] });

        // Update stopwatch every second
        const interval = setInterval(async () => {
            if (!isRunning) {
                clearInterval(interval);
                return;
            }

            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const updateEmbed = new EmbedBuilder()
                .setColor(embed_color)
                .setTitle('⏱️ Stopwatch')
                .setDescription(formatDuration(elapsed))
                .setFooter({ text: 'Type .stop to stop the stopwatch' });

            await stopwatchMessage.edit({ embeds: [updateEmbed] });
        }, 1000);

        // Create message collector for stop command
        const filter = m => m.author.id === message.author.id && m.content.toLowerCase() === '.stop';
        const collector = message.channel.createMessageCollector({ filter, time: 3600000 }); // 1 hour max

        collector.on('collect', async () => {
            isRunning = false;
            clearInterval(interval);
            collector.stop();

            const finalTime = Math.floor((Date.now() - startTime) / 1000);
            const finalEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('⏱️ Stopwatch Stopped')
                .setDescription(`Final time: ${formatDuration(finalTime)}`)
                .setFooter({ text: `Requested by ${message.author.tag}` });

            await stopwatchMessage.edit({ embeds: [finalEmbed] });
        });

        collector.on('end', () => {
            if (isRunning) {
                isRunning = false;
                clearInterval(interval);
            }
        });
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