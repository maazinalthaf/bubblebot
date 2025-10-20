const { PermissionsBitField, EmbedBuilder, ChannelType } = require('discord.js');
const { embed_color, emojis, red, yellow, green } = require('../../utils/constants');

module.exports = {
  name: 'quickmute',
  description: 'Quickly toggle mute for all members in a voice channel',
  aliases: ['qm', 'togglemute'],
  async execute(client, message, args) {
    let targetChannel;

    // If user specified a channel
    if (args[0]) {
      const channelMention = args[0].match(/<#(\d+)>/);
      const channelId = channelMention ? channelMention[1] : args[0];
      
      targetChannel = message.guild.channels.cache.get(channelId);
      if (!targetChannel || (targetChannel.type !== ChannelType.GuildVoice && targetChannel.type !== ChannelType.GuildStageVoice)) {
        const embed = new EmbedBuilder()
          .setColor(yellow)
          .setDescription(`${emojis.error} Please provide a valid voice channel!`);
        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
      }
    } 
    // If user is in a voice channel
    else if (message.member.voice.channel) {
      targetChannel = message.member.voice.channel;
    } 
    // No channel specified and user not in VC
    else {
      const embed = new EmbedBuilder()
        .setColor(yellow)
        .setDescription(`${emojis.error} Please specify a voice channel or join one!\nUsage: \`.quickmute #channel\` or join a VC and use \`.quickmute\``);
      return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }

    try {
      // Check if there are any members in the channel
      if (targetChannel.members.size === 0) {
        const embed = new EmbedBuilder()
          .setColor(yellow)
          .setDescription(`${emojis.error} There are no members in ${targetChannel}!`);
        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
      }

      // Get all non-bot members in the channel
      const members = targetChannel.members.filter(member => !member.user.bot);

      if (members.size === 0) {
        const embed = new EmbedBuilder()
          .setColor(yellow)
          .setDescription(`${emojis.error} There are only bots in ${targetChannel}!`);
        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
      }

      const mutedMembers = members.filter(member => member.voice.serverMute);
      const unmutedMembers = members.filter(member => !member.voice.serverMute);

      console.log(`[DEBUG] Channel: ${targetChannel.name}`);
      console.log(`[DEBUG] Total members: ${targetChannel.members.size}`);
      console.log(`[DEBUG] Non-bot members: ${members.size}`);
      console.log(`[DEBUG] Muted: ${mutedMembers.size}, Unmuted: ${unmutedMembers.size}`);

      // If more people are unmuted, mute everyone. Otherwise, unmute everyone.
      const shouldMute = unmutedMembers.size >= mutedMembers.size;
      const targetMembers = shouldMute ? unmutedMembers : mutedMembers;

      if (targetMembers.size === 0) {
        const embed = new EmbedBuilder()
          .setColor(parseInt(embed_color))
          .setDescription(`${emojis.tick} Everyone is already ${shouldMute ? 'muted' : 'unmuted'} in ${targetChannel}!`);
        return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
      }

      let affectedCount = 0;
      let failedCount = 0;

      for (const [id, member] of targetMembers) {
        try {
          console.log(`[DEBUG] Attempting to ${shouldMute ? 'mute' : 'unmute'} ${member.user.tag}`);
          await member.voice.setMute(shouldMute);
          affectedCount++;
          console.log(`[DEBUG] Successfully ${shouldMute ? 'muted' : 'unmuted'} ${member.user.tag}`);
        } catch (error) {
          console.error(`[DEBUG] Failed to ${shouldMute ? 'mute' : 'unmute'} ${member.user.tag}:`, error);
          failedCount++;
        }
      }

      const embed = new EmbedBuilder()
        .setColor(green)
        .setDescription(`${emojis.tick} Successfully ${shouldMute ? 'muted' : 'unmuted'} **${affectedCount}** members in ${targetChannel}` +
                       (failedCount > 0 ? `\n${emojis.error} Failed to ${shouldMute ? 'mute' : 'unmute'} **${failedCount}** members` : ''))
        .addFields(
          { 
            name: 'Current Status', 
            value: `🔇 **Muted:** ${shouldMute ? mutedMembers.size + affectedCount : Math.max(0, mutedMembers.size - affectedCount)} members\n🔊 **Unmuted:** ${shouldMute ? Math.max(0, unmutedMembers.size - affectedCount) : unmutedMembers.size + affectedCount} members`, 
            inline: true 
          }
        )
        .setTimestamp()
        .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() });

      return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });

    } catch (error) {
      console.error('Error in quickmute command:', error);
      const embed = new EmbedBuilder()
        .setColor(parseInt(red))
        .setDescription(`${emojis.cross} An error occurred while trying to toggle mute!\nError: ${error.message}`);
      return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
    }
  }
};