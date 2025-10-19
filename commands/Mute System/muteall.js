const { PermissionsBitField } = require('discord.js');
const { embed_color, emojis } = require('../../utils/constants');

module.exports = {
  name: 'muteall',
  description: 'Mute all members in your voice channel (Among Us style)',
  aliases: ['ma', 'muteall'],
  async execute(client, message, args) {
    // Check if user is in a voice channel
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return message.reply(`${emojis.error} You need to be in a voice channel to use this command!`);
    }

    // Check if user has permission to mute members
    if (!message.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
      return message.reply(`${emojis.error} You need the \`Mute Members\` permission to use this command!`);
    }

    // Check if bot has permission to mute members
    if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
      return message.reply(`${emojis.error} I need the \`Mute Members\` permission to execute this command!`);
    }

    try {
      const members = voiceChannel.members.filter(member => !member.user.bot && !member.voice.serverMute);
      
      if (members.size === 0) {
        return message.reply(`${emojis.tick} Everyone in ${voiceChannel} is already muted!`);
      }

      let mutedCount = 0;
      const mutePromises = [];

      for (const [id, member] of members) {
        mutePromises.push(
          member.voice.setMute(true).then(() => {
            mutedCount++;
          }).catch(error => {
            console.error(`Failed to mute ${member.user.tag}:`, error);
          })
        );
      }

      await Promise.all(mutePromises);

      const embed = {
        color: parseInt(embed_color, 16),
        title: '🔇 Mute All',
        description: `${emojis.tick} Successfully muted **${mutedCount}** members in ${voiceChannel}`,
        timestamp: new Date().toISOString(),
        footer: { text: `Requested by ${message.author.tag}`, icon_url: message.author.displayAvatarURL() }
      };

      return message.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Error in muteall command:', error);
      return message.reply(`${emojis.error} An error occurred while trying to mute members!`);
    }
  }
};