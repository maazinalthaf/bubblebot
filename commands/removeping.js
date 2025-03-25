const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');
const botPingPath = path.join(__dirname, '../botping.json');

module.exports = {
    name: 'removeping',
    aliases: ['rp'],
    async execute(client, message, args) {
        // Check if the message starts with the command (after prefix)
        if (!message.content.toLowerCase().startsWith('.removeping')) {
            return; // Ignore if not the full command
        }

        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            const embed = new EmbedBuilder()
                .setColor('#C83636')
                .setDescription(`<:cross:1332418251849732206> You do not have permission to use this command.`);
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }

        // Remove the command part and get just the arguments
        const fullMessage = message.content.slice('.removeping'.length).trim();
        
        if (!fullMessage) {
            const embed = new EmbedBuilder()
                .setColor('#ffcc32')
                .setDescription(`<:error:1332418281675558963> Usage: \`.removeping <message>\`\nPlease provide the message to remove.`);
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }

        let botPingMessages;
        try {
            botPingMessages = JSON.parse(fs.readFileSync(botPingPath, 'utf8')) || [];
        } catch (error) {
            console.log('Failed to load botping.json.');
            const embed = new EmbedBuilder()
                .setColor('#C83636')
                .setDescription(`<:cross:1332418251849732206> Failed to load triggers list.`);
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }

        // Find index of trigger message (case insensitive, trimmed)
        const index = botPingMessages.findIndex(msg => 
            msg.message.toLowerCase().trim() === fullMessage.toLowerCase().trim()
        );

        if (index === -1) {
            const embed = new EmbedBuilder()
                .setColor('#C83636')
                .setDescription(`<:cross:1332418251849732206> Trigger "${fullMessage}" not found.`);
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }

        // Remove trigger
        botPingMessages.splice(index, 1);
        fs.writeFileSync(botPingPath, JSON.stringify(botPingMessages, null, 2), 'utf8');

        const embed = new EmbedBuilder()
            .setColor('#77b255')
            .setDescription(`<:tick:1332418339372273684> Trigger "${fullMessage}" removed.`);
        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }
};