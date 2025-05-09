const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'help',
    aliases: ['h', 'commands'],
    description: 'Shows bot information and commands.',
    async execute(client, message, args) {
        const embed = new EmbedBuilder()
            .setAuthor({
                name: '| Command List',
                iconURL: message.author.displayAvatarURL({ dynamic: true })
            })
            .setDescription('Use .help [command] to get more information about a command')
            .setColor('#2B2D31');

        const githubButton = new ButtonBuilder()
            .setLabel('View Commands')
            .setURL('https://github.com/maazinalthaf/bubblebot')
            .setStyle(ButtonStyle.Link);

        const row = new ActionRowBuilder()
            .addComponents(githubButton);

        await message.channel.send({
            embeds: [embed],
            components: [row]
        });
    },
};
