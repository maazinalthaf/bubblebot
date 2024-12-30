const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { snipes } = require('./snipe.js'); // Import the snipes map from snipe.js

module.exports = {
    name: 'clearsnipe',
    aliases: ['cs', 'clearsnipes'],
    async execute(client, message, args) {
        // Check if the user has permission to use the command
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            const embed = new EmbedBuilder()
                .setColor('#C83636')
                .setDescription('<:cross:1283228336666968114> You do not have permission to use this command.');
            return message.channel.send({ embeds: [embed] });
        }

        // Check if there are any snipes to clear
        if (!snipes.has(message.channel.id) || snipes.get(message.channel.id).length === 0) {
            const embed = new EmbedBuilder()
                .setColor('#FFCC32')
                .setDescription('<:hazard:1283227908491710505> There are no sniped messages to clear!');
            return message.channel.send({ embeds: [embed] });
        }

        // Clear snipes for the current channel
        snipes.delete(message.channel.id);

        // Send success message
        const embed = new EmbedBuilder()
            .setColor('#01b700')
            .setDescription('<:tick:1321937653708492850> Successfully cleared all sniped messages in this channel.')

        message.channel.send({ embeds: [embed] });
    }
};