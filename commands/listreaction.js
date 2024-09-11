const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionsBitField, InteractionType } = require('discord.js');
const reactions = require('../reactions.json');

module.exports = {
    name: 'listreaction',
    aliases: ['lr'],
    async execute(client, message, args) {
        // Check if the user has permission
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuildExpressions)) {
            const embed = new EmbedBuilder()
                .setColor('#C83636')
                .setDescription('<:cross:1283228336666968114> You do not have permission to use this command.');
            return message.channel.send({ embeds: [embed] });
        }

        // Function to create the embed for a specific page
        const createEmbed = (page, perPage, reactions) => {
            const reactionEntries = Object.entries(reactions);
            const totalPages = Math.ceil(reactionEntries.length / perPage);

            // Slice the reactions for the current page
            const slicedReactions = reactionEntries.slice((page - 1) * perPage, page * perPage)
                .map(([word, reaction]) => `- **${word}**: ${reaction}`)
                .join('\n');

            // Calculate how many lines are used and pad with zero-width space if needed to maintain fixed height
            const linesInCurrentPage = slicedReactions.split('\n').length;
            let paddedReactions = slicedReactions;

            if (linesInCurrentPage < perPage) {
                paddedReactions += '\n' + '\u200B\n'.repeat(perPage - linesInCurrentPage);
            }

            return new EmbedBuilder()
                .setTitle('🎭 Reactions List')
                .setDescription(paddedReactions || 'No reactions to show.')
                .setColor('#0a2472')
                .setFooter({ text: `Page ${page} of ${totalPages}` });
        };

        // Pagination variables
        const perPage = 7;
        let currentPage = 1;
        const totalPages = Math.ceil(Object.entries(reactions).length / perPage);

        // Initial embed
        const embed = createEmbed(currentPage, perPage, reactions);

        // Function to create action rows with buttons and a "Jump to Page" button
        const createActionRow = (currentPage, totalPages, disable = false) => {
            // First row with navigation buttons and page number
            const row1 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('first')
                        .setLabel('FIRST')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(disable || currentPage === 1),
                    new ButtonBuilder()
                        .setCustomId('prev')
                        .setLabel('PREVIOUS')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(disable || currentPage === 1),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('NEXT')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(disable || currentPage === totalPages),
                    new ButtonBuilder()
                        .setCustomId('last')
                        .setLabel('LAST')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(disable || currentPage === totalPages)
                );

            // Second row with the "Jump to Page" button
            const row2 = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('jump')
                        .setLabel('🔢 Jump to Page')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(disable)
                );

            return [row1, row2]; // Return two separate rows
        };

        // Send the initial message
        const rows = createActionRow(currentPage, totalPages);
        const messageInstance = await message.channel.send({ embeds: [embed], components: rows });

        // Button interaction handler
        const collector = messageInstance.createMessageComponentCollector({ time: 30000 });

        collector.on('collect', async (interaction) => {
            if (!interaction.isButton()) return;

            // Handle button clicks
            if (interaction.customId === 'first' && currentPage > 1) {
                currentPage = 1;
            } else if (interaction.customId === 'prev' && currentPage > 1) {
                currentPage--;
            } else if (interaction.customId === 'next' && currentPage < totalPages) {
                currentPage++;
            } else if (interaction.customId === 'last' && currentPage < totalPages) {
                currentPage = totalPages;
            } else if (interaction.customId === 'jump') {
                // Open a modal for entering the page number
                const modal = new ModalBuilder()
                    .setCustomId('jumpModal')
                    .setTitle('Jump to Page');

                const pageNumberInput = new TextInputBuilder()
                    .setCustomId('pageNumberInput')
                    .setLabel('Enter page number')
                    .setStyle(TextInputStyle.Short)
                    .setPlaceholder(`1 - ${totalPages}`)
                    .setRequired(true);

                const actionRow = new ActionRowBuilder().addComponents(pageNumberInput);

                modal.addComponents(actionRow);
                await interaction.showModal(modal);
            }

            // Update embed and buttons after page navigation (if not jumping)
            if (interaction.customId !== 'jump') {
                const updatedEmbed = createEmbed(currentPage, perPage, reactions);
                const updatedRows = createActionRow(currentPage, totalPages);
                await interaction.update({ embeds: [updatedEmbed], components: updatedRows });
            }
        });

        // Modal submit handler
        client.on('interactionCreate', async (interaction) => {
            if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'jumpModal') {
                const selectedPage = parseInt(interaction.fields.getTextInputValue('pageNumberInput'), 10);

                // Ensure the page number is valid
                if (!isNaN(selectedPage) && selectedPage >= 1 && selectedPage <= totalPages) {
                    currentPage = selectedPage;

                    // Defer the update to prevent double interaction acknowledgment
                    await interaction.deferUpdate();

                    // Update the embed with the new page
                    const updatedEmbed = createEmbed(currentPage, perPage, reactions);
                    const updatedRows = createActionRow(currentPage, totalPages);
                    await interaction.editReply({ embeds: [updatedEmbed], components: updatedRows });
                } else {
                    await interaction.reply({ content: `Invalid page number. Please enter a number between 1 and ${totalPages}.`, ephemeral: true });
                }
            }
        });

        collector.on('end', async () => {
            // Disable buttons after the collector ends
            const disabledRows = createActionRow(currentPage, totalPages, true);
            await messageInstance.edit({ components: disabledRows });
        });
    }
};
