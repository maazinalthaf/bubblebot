const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');
const {embed_color, emojis, prefix } = require('../../constants');
const triggersPath = path.join(__dirname, '../triggers.json');
const TRIGGERS_PER_PAGE = 5;

module.exports = {
    name: 'listtrigger',
    aliases: ['lt'],
    description: 'List all auto-response triggers with pagination',
    usage: '.listtrigger OR .lt',
    permissions: ['ManageMessages'],
    async execute(client, message, args) {
        if (!message.member.permissions.has('ManageMessages')) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FFCC32')
                        .setDescription(`${emojis.error} You need the **Manage Messages** permission to use this command.`)
                ]
            });
        }

        let triggers = {};
        try {
            triggers = JSON.parse(fs.readFileSync(triggersPath, 'utf8'));
        } catch (error) {
            console.error('Error reading triggers.json:', error);
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#C83636')
                        .setDescription(`${emojis.cross} Failed to load triggers.`)
                ]
            });
        }

        if (Object.keys(triggers).length === 0) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#C83636')
                        .setDescription(`${emojis.cross} No triggers have been set up yet.`)
                ]
            });
        }

        
        const triggerEntries = Object.entries(triggers);
        const totalPages = Math.ceil(triggerEntries.length / TRIGGERS_PER_PAGE);
        let currentPage = 1;

        
        const createEmbed = (page) => {
            const startIdx = (page - 1) * TRIGGERS_PER_PAGE;
            const endIdx = Math.min(startIdx + TRIGGERS_PER_PAGE, triggerEntries.length);
            const pageTriggers = triggerEntries.slice(startIdx, endIdx);

            return new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle('📎 Trigger List')
                .setDescription(
                    pageTriggers.map(([word, response], idx) => 
                        `**${startIdx + idx + 1}.** \`${word}\`\n↳ ${response}`
                    ).join('\n\n')
                )
                .setFooter({ 
                    text: `Page ${page}/${totalPages} • Total triggers: ${triggerEntries.length}` 
                })
                .setTimestamp();
        };

    
        const createButtons = (page) => {
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('first')
                        .setLabel('First')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(page <= 1),
                    new ButtonBuilder()
                        .setCustomId('prev')
                        .setLabel('Previous')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page <= 1),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('Next')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page >= totalPages),
                    new ButtonBuilder()
                        .setCustomId('last')
                        .setLabel('Last')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(page >= totalPages)
                );
            return row;
        };

        
        const embed = createEmbed(currentPage);
        const buttons = createButtons(currentPage);
        const response = await message.reply({ 
            embeds: [embed], 
            components: [buttons] 
        });

        
        const collector = response.createMessageComponentCollector({ 
            time: 300000 // 5 minutes
        });

        collector.on('collect', async (interaction) => {
            if (interaction.user.id !== message.author.id) {
                return interaction.reply({ 
                    content: 'Only the command user can control this menu.', 
                    ephemeral: true 
                });
            }

            if (interaction.customId === 'first') {
                currentPage = 1;
            } else if (interaction.customId === 'prev') {
                currentPage--;
            } else if (interaction.customId === 'next') {
                currentPage++;
            } else if (interaction.customId === 'last') {
                currentPage = totalPages;
            }

            const updatedEmbed = createEmbed(currentPage);
            const updatedButtons = createButtons(currentPage);
            
            await interaction.update({ 
                embeds: [updatedEmbed], 
                components: [updatedButtons] 
            });
        });

        collector.on('end', () => {
            response.edit({ 
                components: [] 
            }).catch(console.error);
        });
    }
};
