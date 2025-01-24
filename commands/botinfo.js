const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'botinfo',
    aliases: ['info', 'botinfo'],
    async execute(client, message) {
        const embed = new EmbedBuilder()
            .setColor('#89CFF0')
            .setTitle('🤖 About This Bot')
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .setDescription('Just a simple bot.')
            .addFields(
                { name: '📋 Features', value: '• Moderation • Role Management • Utility Tools • AFK management', inline: false },
                { name: '🚀 Uptime', value: `${Math.floor(client.uptime / 1000 / 60)} minutes online!`, inline: false }
            )
            .setFooter({ text: 'Developed by @moozxdz' })
            .setTimestamp();

        return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
    }
};
