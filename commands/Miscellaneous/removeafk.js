const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const { execute } = require('../Reaction System/removereaction');
const afkDataFile = './afkData.json';
let afkData = {};
const {embed_color, emojis } = require('../../utils/constants');

// Load AFK data from file if it exists
function loadAfkData() {
    try {
        if (fs.existsSync(afkDataFile)) {
            const data = fs.readFileSync(afkDataFile, 'utf8');
            afkData = JSON.parse(data); // Load the data from the file
        } else {
            afkData = {}; // Initialize empty if no data file exists
        }
    } catch (error) {
        console.error("Error loading AFK data:", error);
        afkData = {}; // In case of an error, reset to an empty object
    }
}

// Save AFK data to the file
function saveAfkData() {
    try {
        fs.writeFileSync(afkDataFile, JSON.stringify(afkData, null, 4), 'utf8');
    } catch (error) {
        console.error("Error saving AFK data:", error);
    }
}

module.exports = {
    name: 'removeafk',
    aliases: ['rafk'],
    async execute(client, message, args) {
        // Load AFK data before executing the command
        loadAfkData();

        // Check if the user has Administrator permission
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const embed = new EmbedBuilder()
                .setColor('#C83636')
                .setDescription(`${emojis.cross} You do not have permission to use this command.`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        const mention = message.mentions.users.first();

        if (!mention) {
            const embed = new EmbedBuilder()
                .setColor('#FFCC32')
                .setDescription(`${emojis.error} Please mention a user to remove their AFK status.`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        const userId = mention.id;

        if (afkData[userId]) {
            delete afkData[userId]; // Remove the user's AFK status
            saveAfkData(); // Save the updated AFK data

            const embed = new EmbedBuilder()
                .setColor('#77B255')
                .setDescription(`${emojis.tick} AFK status removed for ${mention}.`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        } else {
            const embed = new EmbedBuilder()
                .setColor('#C83636')
                .setDescription(`${emojis.cross} ${mention} is not AFK.`);
            return message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }
    }
};
