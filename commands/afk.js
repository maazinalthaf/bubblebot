const {EmbedBuilder} = require('discord.js');
const fs = require('fs');
const afkDataFile = './afkData.json';
const {embed_color, emojis, prefix } = require('../constants');
let afkData = {};

// Dependent Function(s)

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

// Save AFK data to file
function saveAfkData() {
    try {
        fs.writeFileSync(afkDataFile, JSON.stringify(afkData, null, 2), 'utf8');
    } catch (error) {
        console.error("Error saving AFK data:", error);
    }
}

module.exports = {
    name: 'afk',
    async execute(client, message, args) {
        // Load the existing AFK data before setting new status
        loadAfkData();

        const afkMessage = args.join(' ');

        if (afkMessage) {
            afkData[message.author.id] = {
                afkMessage,
                timestamp: Date.now(),
            };

            const embed = new EmbedBuilder()
            .setColor('#77B255')
            .setDescription(`${emoji.tick} **${message.author}** You're now AFK with the status: **${afkMessage}**`);

            message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });

        } else {
            afkData[message.author.id] = {
                timestamp: Date.now(),
            };

            const embed = new EmbedBuilder()
            .setColor('#77B255')
            .setDescription(`${emoji.tick} **${message.author}** You're now AFK with the status: **AFK**`);

            message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
        }

        // Save the updated AFK data
        saveAfkData();
    }
};
