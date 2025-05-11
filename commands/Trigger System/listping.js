const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');
const botPingPath = path.join(__dirname, '../botping.json');
const {embed_color, emojis, prefix } = require('../../constants');

module.exports = {
    name: 'listping',
    aliases: ['lp'],
    async execute(client, message) {
        // Check if user has Manage Messages permission
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            const embed = new EmbedBuilder()
                .setColor('#ffcc32')
                .setDescription(`${emojis.error} You need the \`Manage Messages\` permission to use this command.`);
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }

        let botPingMessages;
        try {
            botPingMessages = JSON.parse(fs.readFileSync(botPingPath, 'utf8'));
        } catch (error) {
            console.log('Failed to load triggers from botping.json.');
        }

        if (!botPingMessages || !botPingMessages.length) {
            const embed = new EmbedBuilder()
                .setColor('#ffcc32')
                .setDescription(`${emojis.error} There are currently no triggers configured.`);
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }

        const pageSize = 5; // Number of triggers per page
        let currentPage = 0;
        const totalPages = Math.ceil(botPingMessages.length / pageSize);

        // Function to generate the embed for a specific page
        const generateEmbed = (page) => {
            const embed = new EmbedBuilder()
                .setColor('#89CFF0') // Choose a color for the embed
                .setTitle('📋 Bot Trigger List')
                .setDescription('Here are the current bot triggers along with their weights:')
                .setFooter({
                    text: `Page ${page + 1} of ${totalPages}`,
                    iconURL: client.user.displayAvatarURL(),
                })
                .setTimestamp();

            const start = page * pageSize;
            const end = start + pageSize;
            const triggers = botPingMessages.slice(start, end);

            triggers.forEach((trigger, index) => {
                embed.addFields({
                    name: `Trigger #${start + index + 1}`,
                    value: `**Message:** ${trigger.message}\n**Weight:** ${trigger.weight}`,
                    inline: false,
                });
            });

            return embed;
        };

        // Create navigation buttons
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('prev')
                .setLabel('Previous')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true),
            new ButtonBuilder()
                .setCustomId('next')
                .setLabel('Next')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(totalPages <= 1)
        );

        // Send the initial embed with buttons
        const embedMessage = await message.channel.send({
            embeds: [generateEmbed(currentPage)],
            components: [row],
        });

        // Create a collector for button interactions
        const collector = embedMessage.createMessageComponentCollector({
            time: 60000, // 1 minute collector duration
        });

        collector.on('collect', async (interaction) => {
            if (interaction.user.id !== message.author.id) {
                return interaction.reply({
                    content: `${emojis.cross} You are not authorized to interact with these buttons.`,
                    ephemeral: true,
                });
            }

            if (interaction.customId === 'prev') {
                currentPage = Math.max(0, currentPage - 1);
            } else if (interaction.customId === 'next') {
                currentPage = Math.min(totalPages - 1, currentPage + 1);
            }

            // Update buttons' disabled state
            row.components[0].setDisabled(currentPage === 0);
            row.components[1].setDisabled(currentPage === totalPages - 1);

            // Update the embed
            await interaction.update({
                embeds: [generateEmbed(currentPage)],
                components: [row],
            });
        });

        collector.on('end', () => {
            // Disable buttons after the collector ends
            row.components.forEach((button) => button.setDisabled(true));
            embedMessage.edit({ components: [row] }).catch(console.error);
        });
    },
};
