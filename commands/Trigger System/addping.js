const {embed_color, emojis, prefix } = require('../../constants');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');
const botPingPath = path.join(__dirname, '../../botping.json');

module.exports = {
    name: 'addping',
    aliases: ['ap'],
    async execute(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            const embed = new EmbedBuilder()
                .setColor('#C83636')
                .setDescription(`${emojis.cross} You do not have permission to use this command.`);
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }

        const triggerMessage = args.slice(0, args.length - 1).join(" ");
        const weight = parseFloat(args[args.length - 1]);

        if (!triggerMessage || isNaN(weight) || weight <= 0) {
            const embed = new EmbedBuilder()
                .setColor('#ffcc32')
                .setDescription(`${emojis.error} Please provide a valid message and a positive weight for the trigger.\n Usage: \`.addping <message> <weight>\` `);
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }

        let botPingMessages;
        try {
            botPingMessages = JSON.parse(fs.readFileSync(botPingPath, 'utf8')) || [];
        } catch (error) {
            console.log('Failed to load botping.json, creating new array.');
            botPingMessages = [];
        }

        // Add new trigger
        botPingMessages.push({ message: triggerMessage, weight });
        fs.writeFileSync(botPingPath, JSON.stringify(botPingMessages, null, 2), 'utf8');
        
        const embed = new EmbedBuilder()
            .setColor('#77b255')
            .setDescription(`${emojis.tick} Trigger "${triggerMessage}" with weight ${weight} added.`);
        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }
};
