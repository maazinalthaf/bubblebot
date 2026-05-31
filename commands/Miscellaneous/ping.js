const { EmbedBuilder } = require('discord.js');
const { embed_color, emojis } = require('../../utils/constants');

module.exports = {
  name: 'ping',
  description: 'Displays bot and API latency.',
  async execute(client, message) {
    const initialEmbed = new EmbedBuilder()
      .setColor('#89cff0')
      .setDescription('🏓 Pinging...');

    const sentMessage = await message.channel.send({ embeds: [initialEmbed] });
    const botLatency = sentMessage.createdTimestamp - message.createdTimestamp;
    const apiLatency = Math.round(client.ws.ping);

    const pingEmbed = new EmbedBuilder()
      .setColor(embed_color)
      .setTitle('🏓 Pong!')
      .addFields(
        { name: 'Bot Latency', value: `${botLatency}ms`, inline: true },
        { name: 'API Latency', value: `${apiLatency}ms`, inline: true }
      )
      .setFooter({ text: 'Ping Command', iconURL: client.user.displayAvatarURL() })
      .setTimestamp();

    await sentMessage.edit({ embeds: [pingEmbed] });
  },
};
