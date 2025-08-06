const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { embed_color, emojis } = require('../../utils/constants');

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
            .setDescription('Click on the button below for more info.')
            .setColor(embed_color);

        const githubButton = new ButtonBuilder()
            .setLabel('View Commands')
            .setURL('https://maazinalthaf.github.io/bubblebot')
            .setStyle(ButtonStyle.Link);

        const row = new ActionRowBuilder()
            .addComponents(githubButton);

        await message.channel.send({
            embeds: [embed],
            components: [row]
        });
    },
};
