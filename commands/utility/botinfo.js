const { EmbedBuilder } = require('discord.js');
const { EMBED_COLORS } = require('../../config/constants');

module.exports = {
    name: 'botinfo',
    aliases: ['info', 'botinfo'],
    description: 'Shows information about the bot.',
    async execute(client, message) {
        const uptimeTimestamp = `<t:${Math.floor((Date.now() - client.uptime) / 1000)}:R>`;
        const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const embed = new EmbedBuilder()
            .setColor(EMBED_COLORS.DEFAULT)
            .setTitle(client.user.username)
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '`👤` Developer', value: 'moozxdz', inline: true },
                { name: '`🆔` Bot ID', value: client.user.id, inline: true },
                { name: '`⏱️` Uptime', value: uptimeTimestamp, inline: true },
                { name: '`🌐` Servers', value: `${client.guilds.cache.size}`, inline: true },
                { name: '`👥` Users', value: `${totalUsers}`, inline: true },
                { name: '`🛠️` Node.js', value: process.version, inline: true }
            )
            .setFooter({ text: 'BubbleBot', iconURL: client.user.displayAvatarURL() })
            .setTimestamp();
        await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }
};
