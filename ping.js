const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'ping',
  description: 'Displays bot and API latency.',
  async execute(client, message) {
    const initialEmbed = new EmbedBuilder()
      .setColor('#3498db')
      .setDescription('🏓 Pinging...');

    // Send the initial embed and wait for it to be sent
    const sentMessage = await message.channel.send({ embeds: [initialEmbed] });

    // Calculate latencies
    const botLatency = sentMessage.createdTimestamp - message.createdTimestamp;
    const apiLatency = Math.round(client.ws.ping);

    // Create the final embed with the calculated latencies
    const pingEmbed = new EmbedBuilder()
      .setColor('#2ecc71')
      .setTitle('🏓 Pong!')
      .addFields(
        { name: 'Bot Latency', value: `${botLatency}ms`, inline: true },
        { name: 'API Latency', value: `${apiLatency}ms`, inline: true }
      )
      .setFooter({ text: 'Ping Command', iconURL: client.user.displayAvatarURL() })
      .setTimestamp();

    // Edit the original message to display the latencies
    await sentMessage.edit({ embeds: [pingEmbed] });
  },
};
