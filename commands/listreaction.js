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
            .setDescription(`<:cross:1332418251849732206> You do not have permission to use this command.`);
        return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
  }

        // Function to create the embed for a specific page
        const createEmbed = (page, perPage, reactions) => {
            const reactionEntries = Object.entries(reactions);
            const totalPages = Math.ceil(reactionEntries.length / perPage);

            // Slice the reactions for the current page
            const slicedReactions = reactionEntries
                .slice((page - 1) * perPage, page * perPage)
                .map(([word, reaction]) => `📌 **${word}** → ${reaction}`)
                .join('\n');

            return new EmbedBuilder()
                .setTitle('<:roles:1332417540810342532> Reaction List')
                .setDescription(slicedReactions || 'No reactions to display.')
                .setColor('#5865F2')
                .addFields(
                    { name: 'Page Info', value: `📄 Page **${page}** of **${totalPages}**`, inline: true },
                    { name: 'Total Reactions', value: `🗂️ **${reactionEntries.length}**`, inline: true }
                )
                .setThumbnail(client.user.displayAvatarURL())
                .setFooter({ text: 'Use the buttons below to navigate pages.', iconURL: message.author.displayAvatarURL() });
        };

        // Pagination variables
        const perPage = 7;
        let currentPage = 1;
        const reactionEntries = Object.entries(reactions);
        const totalPages = Math.ceil(reactionEntries.length / perPage);

        // Handle the case where no reactions are defined
        if (reactionEntries.length === 0) {
            const noReactionsEmbed = new EmbedBuilder()
                .setTitle('<:reaction:1321974219973722216> Reaction List')
                .setDescription('🚫 There are currently no reactions configured.')
                .setColor('#FF4C4C');
            return message.channel.send({ embeds: [noReactionsEmbed] });
        }

        // Initial embed
        const embed = createEmbed(currentPage, perPage, reactions);

        // Function to create action rows with buttons
        const createActionRow = (currentPage, totalPages, disable = false) => {
            return new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('first')
                    .setLabel('First')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(disable || currentPage === 1),
                new ButtonBuilder()
                    .setCustomId('prev')
                    .setLabel('Previous')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(disable || currentPage === 1),
                new ButtonBuilder()
                    .setCustomId('next')
                    .setLabel('Next')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(disable || currentPage === totalPages),
                new ButtonBuilder()
                    .setCustomId('last')
                    .setLabel('Last')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(disable || currentPage === totalPages),
            );
        };

        // Send the initial message
        const rows = [createActionRow(currentPage, totalPages)];
        const messageInstance = await message.channel.send({ embeds: [embed], components: rows });

        // Button interaction handler
        const collector = messageInstance.createMessageComponentCollector({ time: 30000 });

        collector.on('collect', async (interaction) => {
            if (!interaction.isButton()) return;

            if (interaction.customId === 'first' && currentPage > 1) {
                currentPage = 1;
            } else if (interaction.customId === 'prev' && currentPage > 1) {
                currentPage--;
            } else if (interaction.customId === 'next' && currentPage < totalPages) {
                currentPage++;
            }  if (interaction.customId === 'last' && currentPage < totalPages) {
                currentPage = totalPages;
            }

            if (interaction.customId !== 'jump') {
                const updatedEmbed = createEmbed(currentPage, perPage, reactions);
                const updatedRows = [createActionRow(currentPage, totalPages)];
                await interaction.update({ embeds: [updatedEmbed], components: updatedRows });
            }
        });

        client.on('interactionCreate', async (interaction) => {
            if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'jumpModal') {
                const selectedPage = parseInt(interaction.fields.getTextInputValue('pageNumberInput'), 10);

                if (!isNaN(selectedPage) && selectedPage >= 1 && selectedPage <= totalPages) {
                    currentPage = selectedPage;
                    await interaction.deferUpdate();

                    const updatedEmbed = createEmbed(currentPage, perPage, reactions);
                    const updatedRows = [createActionRow(currentPage, totalPages)];
                    await interaction.editReply({ embeds: [updatedEmbed], components: updatedRows });
                } else {
                    await interaction.reply({
                        content: `❌ Invalid page number. Enter a number between 1 and ${totalPages}.`,
                        ephemeral: true,
                    });
                }
            }
        });

        collector.on('end', async () => {
            const disabledRows = [createActionRow(currentPage, totalPages, true)];
            await messageInstance.edit({ components: disabledRows });
        });
    },
};
