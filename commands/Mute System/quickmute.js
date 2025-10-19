const { PermissionsBitField } = require('discord.js');
const { embed_color, emojis } = require('../../utils/constants');

module.exports = {
  name: 'quickmute',
  description: 'Quickly toggle mute for all members in your voice channel',
  aliases: ['qm', 'togglemute'],
  async execute(client, message, args) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return message.reply(`${emojis.error} You need to be in a voice channel to use this command!`);
    }

    if (!message.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
      return message.reply(`${emojis.error} You need the \`Mute Members\` permission to use this command!`);
    }

    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
      return message.reply(`${emojis.error} I need the \`Mute Members\` permission to execute this command!`);
    }

    try {
      const members = voiceChannel.members.filter(member => !member.user.bot);
      const mutedMembers = members.filter(member => member.voice.serverMute);
      const unmutedMembers = members.filter(member => !member.voice.serverMute);

      // If more people are unmuted, mute everyone. Otherwise, unmute everyone.
      const shouldMute = unmutedMembers.size >= mutedMembers.size;
      let affectedCount = 0;

      const targetMembers = shouldMute ? unmutedMembers : mutedMembers;
      
      const mutePromises = [];
      for (const [id, member] of targetMembers) {
        mutePromises.push(
          member.voice.setMute(shouldMute).then(() => {
            affectedCount++;
          }).catch(console.error)
        );
      }

      await Promise.all(mutePromises);

      const embed = {
        color: parseInt(embed_color, 16),
        title: shouldMute ? '🔇 Quick Mute' : '🔊 Quick Unmute',
        description: `${emojis.tick} Successfully ${shouldMute ? 'muted' : 'unmuted'} **${affectedCount}** members in ${voiceChannel}`,
        timestamp: new Date().toISOString(),
        footer: { text: `Requested by ${message.author.tag}`, icon_url: message.author.displayAvatarURL() }
      };

      return message.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Error in quickmute command:', error);
      return message.reply(`${emojis.error} An error occurred!`);
    }
  }
};