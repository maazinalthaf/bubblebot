const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { emojis, embed_color, red, green, yellow } = require('../../utils/constants.js');
const filteredChannels = new Set();


function isValidMessage(content) {
    // Detect any URL in the message
    const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
    const urls = content.match(urlRegex);

    // If no URLs at all, reject (only links allowed)
    if (!urls || urls.length === 0) return false;

    // Regex patterns for YouTube and Instagram links
    const youtubeRegex = /(youtube\.com|youtu\.be)/i;
    const instagramRegex = /instagram\.com/i;

    // Check if all URLs are YouTube or Instagram
    return urls.every(url => youtubeRegex.test(url) || instagramRegex.test(url));
}

module.exports = {
    name: 'linkfilter',
    aliases: ['lf'],
    description: 'Filter a channel to only allow YouTube and Instagram links',
    async execute(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            const embed = new EmbedBuilder()
                .setColor(yellow)
                .setDescription(`${emojis.error} You don't have permission to use this command.`);
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }

        const channelId = message.channel.id;
        const action = args[0]?.toLowerCase();

        try {
            if (action === 'enable') {
                if (filteredChannels.has(channelId)) {
                    const embed = new EmbedBuilder()
                        .setColor(yellow)
                        .setDescription(`${emojis.error} Link filter is already enabled in ${message.channel}.`);
                    return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
                }

                filteredChannels.add(channelId);

                const embed = new EmbedBuilder()
                    .setColor(green)
                    .setDescription(`${emojis.tick} Link filter enabled! ${message.channel} will now only allow YouTube and Instagram links.`);
                return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });

            } else if (action === 'disable') {
                if (!filteredChannels.has(channelId)) {
                    const embed = new EmbedBuilder()
                        .setColor(yellow)
                        .setDescription(`${emojis.error} Link filter is not enabled in ${message.channel}.`);
                    return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
                }

                filteredChannels.delete(channelId);

                const embed = new EmbedBuilder()
                    .setColor(green)
                    .setDescription(`${emojis.tick} Link filter disabled in ${message.channel}.`);
                return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });

            }
        } catch (error) {
            console.error('Error with link filter:', error);
            const embed = new EmbedBuilder()
                .setColor(yellow)
                .setDescription(`${emojis.cross} An error occurred while processing the filter.`);
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }
    },


    checkMessage: async (message) => {
        if (message.author.bot) return;
        if (!filteredChannels.has(message.channel.id)) return;
        if (message.member?.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;

        if (!isValidMessage(message.content)) {
            try {           
                const embed = new EmbedBuilder()
                    .setColor(yellow)
                    .setDescription(`${emojis.error} ${message.author} this channel only allows YouTube and Instagram links.`);

                await message.delete();
                const reply = await message.channel.send({ embeds: [embed] });
                
                // Auto-delete the notification after 5 seconds
                setTimeout(() => reply.delete().catch(() => {}), 5000);
            } catch (error) {
                console.error('Error deleting message:', error);
            }
        }
    },

    getFilteredChannels: () => filteredChannels
};
