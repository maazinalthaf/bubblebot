const { EmbedBuilder } = require('discord.js');
const { performance } = require('perf_hooks');
const { EMBED_COLORS, EMOJIS } = require('../../config/constants');

module.exports = {
  name: 'ping',
  description: 'Replies with pong and latency info',
  async execute(client, message, args) {
    if (!message.guild) {
      return message.reply(
        `${EMOJIS.ERROR} this command can only be used in a server!`,
      );
    }

    if (
      !message.guild.members.me.permissions.has(['SendMessages', 'EmbedLinks'])
    ) {
      return message.reply(
        `${EMOJIS.ERROR} I don't have permission to send messages or embeds here!`,
      );
    }

    try {
      const startTime = performance.now();

      // Initial reply with "latency"
      const initialReply = await message.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(EMBED_COLORS.INFO)
            .setDescription(`checking ping...`),
        ],
        allowedMentions: { repliedUser: false },
      });

      const latency = Math.round(performance.now() - startTime);

      // Minimal embed with only latency
      const pingEmbed = new EmbedBuilder()
        .setColor(EMBED_COLORS.DEFAULT)
        .setDescription(`latency: **\`${latency}\`** ms`);

      // Edit the initial reply to include the embed
      await initialReply.edit({
        content: '',
        embeds: [pingEmbed],
        allowedMentions: { repliedUser: false },
      });
    } catch (error) {
      console.error('Error executing ping command:', error);
      return message.channel.send(`${EMOJIS.ERROR} something went wrong!`);
    }
  },
};