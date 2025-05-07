const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'botinfo',
    async execute(client, message) {
        const embed = new EmbedBuilder()
            .setColor('#f2a600')
            .setTitle('🤖 About This Bot')
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .setDescription('Just a simple bot.')
            .addFields(
                { name: '📋 Features', value: '• Role Management • Utility Tools', inline: false },
                { name: '🚀 Uptime', value: `${Math.floor(client.uptime / 1000 / 60)} minutes online!`, inline: false }
            )
            .setFooter({ text: 'Developed by @moozxdz' })
            .setTimestamp();

        return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
    }
};
