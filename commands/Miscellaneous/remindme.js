const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { embed_color, emojis, prefix } = require('../../constants');
const ms = require('ms');

// Store active reminders
const userReminders = new Map();

module.exports = {
    name: 'remindme',
    aliases: ['alarm', 'remind'],
    description: 'Set a reminder with a specific time (supports seconds, minutes, hours, days)',
    async execute(client, message, args) {
        if (!args.length) {
            const helpEmbed = new EmbedBuilder()
                .setColor(embed_color)
                .setTitle(`${emojis.info} Reminder Help`)
                .setDescription('Set a reminder for yourself with a specific duration and reason.')
                .addFields(
                    { name: 'Usage', value: `${PREFIX}remindme <time> <reason>` },
                    { name: 'Time Format', value: '`10s` (seconds)\n`10m` (minutes)\n`1h` (hours)\n`1d` (days)' },
                    { name: 'Example', value: `${PREFIX}remindme 1h Check discord` }
                )
                .setFooter({ text: 'Minimum: 10 seconds • Maximum: 7 days' });
            return message.reply({ embeds: [helpEmbed], allowedMentions: { repliedUser: false } });
        }

        const time = args[0];
        const reason = args.slice(1).join(' ') || 'No reason provided';
        const reminderDuration = ms(time);

        // Check for valid time
        if (!reminderDuration || reminderDuration < 10000 || reminderDuration > 604800000) { // 10s to 7d
            return message.reply({ 
                content: `${EMOJIS.error} Invalid time format! Please use a format like '10s', '10m', '1h', '1d'. Minimum duration is 10 seconds and maximum is 7 days.`,
                allowedMentions: { repliedUser: false }
            });
        }

        // Manage user reminders
        if (!userReminders.has(message.author.id)) {
            userReminders.set(message.author.id, []);
        }
        const userReminderList = userReminders.get(message.author.id);

        if (userReminderList.length >= 5) {
            return message.reply({
                content: `${emojis.error} You can only have up to 5 active reminders at a time.`,
                allowedMentions: { repliedUser: false }
            });
        }

        // Create the reminder embed
        const reminderEmbed = new EmbedBuilder()
            .setColor(embed_color)
            .setAuthor({ 
                name: 'Reminder Set',
                iconURL: message.author.displayAvatarURL({ dynamic: true })
            })
            .setDescription(`${emojis.bell} I will remind you in **${time}**`)
            .addFields({ 
                name: 'Reason',
                value: `\`\`\`${reason}\`\`\``
            })
            .setFooter({ text: 'You can cancel the reminder with the button below' })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('cancelReminder')
                    .setLabel('Cancel Reminder')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🗑️')
            );

        const reminderMessage = await message.reply({
            embeds: [reminderEmbed],
            components: [row],
            allowedMentions: { repliedUser: false }
        });

        // Store the reminder
        const reminder = {
            message: reminderMessage,
            timeout: null,
            reason: reason
        };
        userReminderList.push(reminder);

        // Setup the reminder timeout
        reminder.timeout = setTimeout(async () => {
            const dmEmbed = new EmbedBuilder()
                .setColor(embed_color)
                .setTitle(`${emojis.bell} Reminder`)
                .setDescription('It\'s time!')
                .addFields({ 
                    name: 'Reason',
                    value: `\`\`\`${reason}\`\`\``
                })
                .setTimestamp();

            try {
                await message.author.send({ embeds: [dmEmbed] });
                reminderMessage.edit({
                    content: `${emojis.tick} Reminder complete! You have been notified via DM.`,
                    components: [],
                });
            } catch (err) {
                console.error(`Failed to send reminder to ${message.author.tag}: ${err.message}`);
                reminderMessage.edit({
                    content: `${emojis.error} I was unable to send you a DM. Please check your privacy settings.`,
                    components: [],
                });
            }

            // Remove the reminder from user's list
            const reminderIndex = userReminderList.findIndex(r => r.message.id === reminderMessage.id);
            if (reminderIndex > -1) userReminderList.splice(reminderIndex, 1);
        }, reminderDuration);

        // Handle the cancel button
        const collector = reminderMessage.createMessageComponentCollector({
            filter: i => i.customId === 'cancelReminder' && i.user.id === message.author.id,
            time: reminderDuration
        });

        collector.on('collect', async interaction => {
            clearTimeout(reminder.timeout);
            await interaction.update({
                content: `${emojis.trash} Reminder has been canceled.`,
                components: [],
            });
            const reminderIndex = userReminderList.findIndex(r => r.message.id === reminderMessage.id);
            if (reminderIndex > -1) userReminderList.splice(reminderIndex, 1);
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                reminderMessage.edit({
                    content: `${emojis.bell} Reminder is now inactive.`,
                    components: [],
                });
            }
        });
    },
}; 
