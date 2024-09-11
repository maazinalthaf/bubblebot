const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const { aliases, execute } = require('./removereaction');
const afkDataFile = './afkData.json';
let afkData = {};

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
                .setDescription(`<:cross:1283228336666968114> You do not have permission to use this command.`);
            return message.channel.send({ embeds: [embed] });
        }

        const mention = message.mentions.users.first();

        if (!mention) {
            const embed = new EmbedBuilder()
                .setColor('#FFCC32')
                .setDescription(`<:hazard:1283227908491710505> Please mention a user to remove their AFK status.`);
            return message.channel.send({ embeds: [embed] });
        }

        const userId = mention.id;

        if (afkData[userId]) {
            delete afkData[userId]; // Remove the user's AFK status
            saveAfkData(); // Save the updated AFK data

            const embed = new EmbedBuilder()
                .setColor('#46DC01')
                .setDescription(`<:tick:1283246758356451432> AFK status removed for ${mention}.`);
            return message.channel.send({ embeds: [embed] });
        } else {
            const embed = new EmbedBuilder()
                .setColor('#C83636')
                .setDescription(`❌ ${mention} is not AFK.`);
            return message.channel.send({ embeds: [embed] });
        }
    }
};
