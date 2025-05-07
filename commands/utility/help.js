const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { EMBED_COLORS } = require('../../config/constants');

module.exports = {
    name: 'help',
    aliases: ['learn'],
    description: 'Shows the list of commands with pagination.',
    async execute(client, message) {
        const user = message.author;
        if (!user) {
            return console.error('User object is undefined.');
        }

        const commandsDir = path.join(__dirname, '../..');
        const categories = fs.readdirSync(path.join(commandsDir, 'commands')).filter((folder) => !folder.startsWith('.') && fs.statSync(path.join(commandsDir, 'commands', folder)).isDirectory());

        let currentPage = 0;
        const totalPages = categories.length;

        const categoryEmbeds = categories.map((category, index) => {
            const categoryPath = path.join(commandsDir, 'commands', category);
            const commandFiles = fs.readdirSync(categoryPath).filter((file) => file.endsWith('.js'));
            const commandList = commandFiles.map((file) => path.parse(file).name).join(', ');
            return new EmbedBuilder()
                .setColor(EMBED_COLORS.DEFAULT)
                .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
                .setTitle(`${category.charAt(0).toUpperCase() + category.slice(1)} Commands`)
                .setDescription(`Commands:\n\u0060\u0060\u0060${commandList}\u0060\u0060\u0060`)
                .setFooter({ text: `Page ${index + 1}/${totalPages}` });
        });

        const menuOptions = categories.map((category) => ({
            label: category.charAt(0).toUpperCase() + category.slice(1),
            value: category,
        }));

        const menu = new StringSelectMenuBuilder()
            .setCustomId('help_menu')
            .setPlaceholder('Select a category')
            .addOptions(menuOptions);

        const row = new ActionRowBuilder().addComponents(menu);

        // Show the first category page by default
        const sentMessage = await message.channel.send({
            embeds: [categoryEmbeds[0]],
            components: [row],
            allowedMentions: { users: [] }
        });

        const filter = (i) => i.user.id === user.id;
        const collector = sentMessage.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', (i) => {
            const selectedValue = i.values[0];
            const selectedIndex = categories.indexOf(selectedValue);
            if (selectedIndex !== -1) {
                currentPage = selectedIndex;
                i.update({
                    embeds: [categoryEmbeds[currentPage]],
                });
            }
        });

        collector.on('end', () => {
            sentMessage.edit({ components: [] }).catch(() => {});
        });
    },
};