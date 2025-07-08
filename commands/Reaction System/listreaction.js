const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');
const reactionsPath = path.join(__dirname, '../../reactions.json');
const {embed_color, emojis } = require('../../utils/constants');

module.exports = {
    name: 'listreaction',
    aliases: ['lr'],
    async execute(client, message, args) {
        // Check if the user has permission
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuildExpressions)) {
            const embed = new EmbedBuilder()
                .setColor('#C83636')
                .setDescription(`${emojis.cross} You do not have permission to use this command.`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        // Load reactions
        let reactions = {};
        try {
            reactions = JSON.parse(fs.readFileSync(reactionsPath, 'utf8'));
        } catch (error) {
            console.error('Error reading reactions.json:', error);
            const embed = new EmbedBuilder()
                .setColor('#C83636')
                .setDescription(`${emojis.cross} Failed to load reactions.`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        const guildId = message.guild.id;
        const serverReactions = reactions[guildId] || {};

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
                .setColor(embed_color)
                .addFields(
                    { name: 'Page Info', value: `📄 Page **${page}** of **${totalPages}**`, inline: true },
                    { name: 'Total Reactions', value: `🗂️ **${reactionEntries.length}**`, inline: true }
                )
                .setThumbnail(message.guild.iconURL({ dynamic: true }))
                .setFooter({ 
                    text: `Reactions for ${message.guild.name}`, 
                    iconURL: client.user.displayAvatarURL()
                });
        };

        // Pagination variables
        const perPage = 7;
        let currentPage = 1;
        const reactionEntries = Object.entries(serverReactions);
        const totalPages = Math.ceil(reactionEntries.length / perPage);

        // Handle the case where no reactions are defined
        if (reactionEntries.length === 0) {
            const noReactionsEmbed = new EmbedBuilder()
                .setTitle('<:roles:1332417540810342532> Reaction List')
                .setDescription('🚫 There are currently no reactions configured for this server.')
                .setColor('#c83636');
            return message.channel.send({ embeds: [noReactionsEmbed] });
        }

        // Initial embed
        const embed = createEmbed(currentPage, perPage, serverReactions);

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

            if (interaction.user.id !== message.author.id) {
                return interaction.reply({
                    content: 'Only the command user can control this menu.',
                    ephemeral: true
                });
            }

            if (interaction.customId === 'first' && currentPage > 1) {
                currentPage = 1;
            } else if (interaction.customId === 'prev' && currentPage > 1) {
                currentPage--;
            } else if (interaction.customId === 'next' && currentPage < totalPages) {
                currentPage++;
            } else if (interaction.customId === 'last' && currentPage < totalPages) {
                currentPage = totalPages;
            }

            const updatedEmbed = createEmbed(currentPage, perPage, serverReactions);
            const updatedRows = [createActionRow(currentPage, totalPages)];
            await interaction.update({ embeds: [updatedEmbed], components: updatedRows });
        });

        collector.on('end', async () => {
            const disabledRows = [createActionRow(currentPage, totalPages, true)];
            await messageInstance.edit({ components: disabledRows }).catch(console.error);
        });
    },
};