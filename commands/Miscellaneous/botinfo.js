const { EmbedBuilder, version } = require('discord.js');
const { embed_color } = require('../../constants');
const os = require('os');

module.exports = {
    name: 'botinfo',
    aliases: ['info', 'about'],
    async execute(client, message) {
        // Calculate uptime
        const days = Math.floor(client.uptime / 86400000);
        const hours = Math.floor(client.uptime / 3600000) % 24;
        const minutes = Math.floor(client.uptime / 60000) % 60;
        const uptime = `${days > 0 ? `${days} day${days !== 1 ? 's' : ''} ` : ''}${hours > 0 ? `${hours} hour${hours !== 1 ? 's' : ''} ` : ''}${minutes} minute${minutes !== 1 ? 's' : ''}`;

        // Get total users across all guilds
        const totalUsers = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

        const embed = new EmbedBuilder()
            .setColor(embed_color)
            .setAuthor({ name: client.user.username, iconURL: client.user.displayAvatarURL({ dynamic: true }) })
            .addFields(
                { 
                    name: '`👨‍💻` Developer',
                    value: '[moozxdz](https://discord.com/users/993747853417664632)',
                    inline: true 
                },
                { 
                    name: '`🤖` Bot ID',
                    value: client.user.id,
                    inline: true 
                },
                {
                    name: '`⏰` Uptime',
                    value: uptime,
                    inline: true
                },
                {
                    name: '`👥` Members',
                    value: totalUsers.toString(),
                    inline: true
                },
                {
                    name: '`📦` Node.js',
                    value: `v${process.version.slice(1)}`,
                    inline: true
                },
                {
                    name: '`⌨️` Github',
                    value: `[bubblebot](https://github.com/maazinalthaf/bubblebot)`,
                    inline: true
                }
            )
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: `Discord.js ${version}` })
            .setTimestamp();

        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }
};
