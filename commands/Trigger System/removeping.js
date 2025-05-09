const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');
const botPingPath = path.join(__dirname, '../botping.json');
const {embed_color, emojis, prefix } = require('../../constants');

module.exports = {
    name: 'removeping',
    aliases: ['rp'],
    async execute(client, message, args) {
        // Get the prefix and command/alias used
        const prefix = '.'; // Assuming your prefix is '.'
        const commandUsed = message.content.toLowerCase().split(' ')[0].slice(prefix.length);
        
        // Check if the command used is either 'removeping' or 'rp'
        if (!['removeping', 'rp'].includes(commandUsed)) {
            return;
        }

        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            const embed = new EmbedBuilder()
                .setColor('#C83636')
                .setDescription(`${emojis.cross} You do not have permission to use this command.`);
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }

        // Remove the command part (using the actual command used) and get just the arguments
        const fullMessage = message.content.slice(prefix.length + commandUsed.length).trim();
        
        if (!fullMessage) {
            const embed = new EmbedBuilder()
                .setColor('#ffcc32')
                .setDescription(`${emojis.error} Usage: \`.removeping <message>\`\nPlease provide the message to remove.`);
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }

        let botPingMessages;
        try {
            botPingMessages = JSON.parse(fs.readFileSync(botPingPath, 'utf8')) || [];
        } catch (error) {
            console.log('Failed to load botping.json.');
            const embed = new EmbedBuilder()
                .setColor('#C83636')
                .setDescription(`${emojis.cross} Failed to load triggers list.`);
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }

        // Find index of trigger message (case insensitive, trimmed)
        const index = botPingMessages.findIndex(msg => 
            msg.message.toLowerCase().trim() === fullMessage.toLowerCase().trim()
        );

        if (index === -1) {
            const embed = new EmbedBuilder()
                .setColor('#C83636')
                .setDescription(`${emojis.cross} Trigger "${fullMessage}" not found.`);
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }

        // Remove trigger
        botPingMessages.splice(index, 1);
        fs.writeFileSync(botPingPath, JSON.stringify(botPingMessages, null, 2), 'utf8');

        const embed = new EmbedBuilder()
            .setColor('#77b255')
            .setDescription(`${emojis.tick} Trigger "${fullMessage}" removed.`);
        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }
};
