const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { embed_color: EMBED_COLOR } = require('../../constants');

module.exports = {
    name: 'help',
    aliases: ['h', 'commands'],
    description: 'Shows the list of commands with pagination.',
    async execute(client, message, args) {
        const user = message.author;
        if (!user) {
            return console.error('User object is undefined.');
        }

        const commandsDir = path.join(__dirname, '..');
        const categories = fs.readdirSync(commandsDir).filter(folder => 
            fs.statSync(path.join(commandsDir, folder)).isDirectory()
        );

        // Create category embeds
        const categoryEmbeds = categories.map((category, index) => {
            const categoryPath = path.join(commandsDir, category);
            const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));
            
            const commandList = commandFiles
                .map(file => path.parse(file).name)
                .filter(cmd => cmd !== 'help')  // Exclude help command from listings
                .join(', ');
            
            return {
                category,
                embed: new EmbedBuilder()
                    .setColor(EMBED_COLOR)
                    .setTitle(`${category}`)
                    .setDescription(`Commands:\n\`\`\`${commandList}\`\`\``)
                    .setFooter({ text: `${category} Commands` })
            };
        });

        // Create the select menu
        const menu = new StringSelectMenuBuilder()
            .setCustomId('help_menu')
            .setPlaceholder('Select a category')
                .addOptions(
                categories.map(category => ({
                        label: category,
                        value: category,
                    }))
            );

        const row = new ActionRowBuilder().addComponents(menu);

        // Send initial embed with first category
        const helpMessage = await message.reply({
            embeds: [categoryEmbeds[0].embed],
            components: [row],
            allowedMentions: { repliedUser: false }
        });

        const collector = helpMessage.createMessageComponentCollector({
            filter: i => i.user.id === user.id,
            time: 60000
        });

        collector.on('collect', async interaction => {
                const selectedCategory = interaction.values[0];
            const selectedEmbed = categoryEmbeds.find(cat => cat.category === selectedCategory);

                await interaction.update({
                embeds: [selectedEmbed.embed],
                components: [row]
                });
        });

        collector.on('end', () => {
            const disabledRow = new ActionRowBuilder()
                .addComponents(menu.setDisabled(true));
            helpMessage.edit({ components: [disabledRow] }).catch(() => {});
        });
    },
};