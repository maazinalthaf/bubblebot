const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { EMBED_COLORS, EMOJIS, PREFIX } = require('../../config/constants');
const botPingPath = path.join(__dirname, '../botping.json');

module.exports = {
    name: 'removeping',
    aliases: ['rp'],
    async execute(client, message, args) {
        // Get the prefix and command/alias used
        const prefix = PREFIX;
        const commandUsed = message.content.toLowerCase().split(' ')[0].slice(prefix.length);
        
        // Check if the command used is either 'removeping' or 'rp'
        if (!['removeping', 'rp'].includes(commandUsed)) {
            return;
        }

        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            const embed = new EmbedBuilder()
                .setColor(EMBED_COLORS.ERROR)
                .setDescription(`${EMOJIS.CROSS} You do not have permission to use this command.`);
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }

        // Remove the command part (using the actual command used) and get just the arguments
        const fullMessage = message.content.slice(prefix.length + commandUsed.length).trim();
        
        if (!fullMessage) {
            const embed = new EmbedBuilder()
                .setColor(EMBED_COLORS.WARNING)
                .setDescription(`${EMOJIS.ERROR} Usage: \`${prefix}removeping <message>\`\nPlease provide the message to remove.`);
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }

        let botPingMessages;
        try {
            botPingMessages = JSON.parse(fs.readFileSync(botPingPath, 'utf8')) || [];
        } catch (error) {
            console.log('Failed to load botping.json.');
            const embed = new EmbedBuilder()
                .setColor(EMBED_COLORS.ERROR)
                .setDescription(`${EMOJIS.CROSS} Failed to load triggers list.`);
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }

        // Find index of trigger message (case insensitive, trimmed)
        const index = botPingMessages.findIndex(msg => 
            msg.message.toLowerCase().trim() === fullMessage.toLowerCase().trim()
        );

        if (index === -1) {
            const embed = new EmbedBuilder()
                .setColor(EMBED_COLORS.ERROR)
                .setDescription(`${EMOJIS.CROSS} Trigger "${fullMessage}" not found.`);
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }

        // Remove trigger
        botPingMessages.splice(index, 1);
        fs.writeFileSync(botPingPath, JSON.stringify(botPingMessages, null, 2), 'utf8');

        const embed = new EmbedBuilder()
            .setColor(EMBED_COLORS.SUCCESS)
            .setDescription(`${EMOJIS.TICK} Trigger "${fullMessage}" removed.`);
        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }
};