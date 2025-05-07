const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const {embed_color, emojis, prefix } = require('../constants');

module.exports = {
    name: 'help',
    description: 'Shows all available commands or details about a specific command',
    async execute(client, message, args) {
        // Command details including usage, aliases
        const commandDetails = {
            timeout: {
                category: 'Moderation',
                desc: 'Timeout a user',
                usage: '.timeout @user <duration> <reason>',
                example: '.timeout @user 1h Spamming',
                perms: 'Moderate Members',
                aliases: []
            },
            untimeout: {
                category: 'Moderation',
                desc: 'Remove timeout from a user',
                usage: '.untimeout @user',
                example: '.untimeout @user',
                perms: 'Moderate Members',
                aliases: []
            },
            dm: {
                category: 'Miscellaneous',
                desc: 'Send a DM to a user',
                usage: '.dm @user <message>',
                example: '.dm @user Hello!',
                perms: 'Moderate Members',
                aliases: []
            },
            say: {
                category: 'Miscellaneous',
                desc: 'Make the bot say something',
                usage: '.say <message>',
                example: '.say Hello everyone!',
                perms: 'Manage Messages',
                aliases: []
            },
            reply: {
                category: 'Miscellaneous',
                desc: 'Reply to a message using the bot',
                usage: '.reply <message_id> <message>',
                example: '.reply 123456789 This is a reply',
                perms: 'Manage Messages',
                aliases: []
            },
            snipe: {
                category: 'Moderation',
                desc: 'See recently deleted messages',
                usage: '.snipe [number]',
                example: '.snipe 1',
                perms: 'Manage Messages',
                aliases: ['s']
            },
            editsnipe: {
                category: 'Moderation',
                desc: 'See recently edited messages',
                usage: '.editsnipe [number]',
                example: '.editsnipe 1',
                perms: 'Manage Messages',
                aliases: ['es']
            },
            clearsnipe: {
                category: 'Moderation',
                desc: 'Clear snipe index',
                usage: '.clearsnipe',
                example: '.clearsnipe',
                perms: 'Manage Messages',
                aliases: ['cs']
            },
            nick: {
                category: 'Moderation',
                desc: 'Modify nickname of the user',
                usage: '.nick @user <nickname>',
                example: '.nick @user spongebob',
                perms: 'Manage Nicknames',
                aliases: []
            },
            clear: {
                category: 'Moderation',
                desc: 'Purge messages from a channel',
                usage: '.clear <number>',
                example: '.clear 20',
                perms: 'Manage Messages',
                aliases: ['c']
            },
            addrole: {
                category: 'Role Management',
                desc: 'Add a role to a user',
                usage: '.addrole @user <role_name>',
                example: '.addrole @user Member',
                perms: 'Manage Server',
                aliases: ['arole', 'grole', 'giverole']
            },
            removerole: {
                category: 'Role Management',
                desc: 'Remove a role from a user',
                usage: '.removerole @user <role_name>',
                example: '.removerole @user Member',
                perms: 'Manage Server',
                aliases: ['rrole']
            },
            roles: {
                category: 'Role Management',
                desc: 'List all roles of a user',
                usage: '.roles @user',
                example: '.roles @user',
                perms: 'Manage Roles',
                aliases: []
            },
            addreaction: {
                category: 'Reaction System',
                desc: 'Add an auto reaction word',
                usage: '.addreaction <word> <emoji1> [emoji2] [emoji3]...',
                example: '.addreaction hello 👋 ❤️',
                perms: 'Manage Guild Expressions',
                aliases: ['areaction']
            },
            removereaction: {
                category: 'Reaction System',
                desc: 'Remove an auto reaction word',
                usage: '.removereaction <word>',
                example: '.removereaction hello',
                perms: 'Manage Guild Expressions',
                aliases: ['rreaction']
            },
            listreaction: {
                category: 'Reaction System',
                desc: 'List all reaction words',
                usage: '.listreaction',
                example: '.listreaction',
                perms: 'Manage Guild Expressions',
                aliases: ['lr']
            },
            afk: {
                category: 'Miscellaneous',
                desc: 'Set your AFK status',
                usage: '.afk [message]',
                example: '.afk Be right back!',
                perms: 'None',
                aliases: []
            },
            removeafk: {
                category: 'Miscellaneous',
                desc: 'Remove AFK status from a user',
                usage: '.removeafk @user',
                example: '.removeafk @user',
                perms: 'Administrator',
                aliases: ['rafk']
            },
            ping: {
                category: 'Miscellaneous',
                desc: 'Check bot latency',
                usage: '.ping',
                example: '.ping',
                perms: 'None',
                aliases: []
            },
            botinfo: {
                category: 'Miscellaneous',
                desc: 'Fetches bot info',
                usage: '.botinfo',
                example: '.botinfo',
                perms: 'None',
                aliases: []
            },
            kanye: {
                category: 'Miscellaneous',
                desc: 'Fetches random kanye quote',
                usage: '.kanye',
                example: '.kanye',
                perms: 'None',
                aliases: ['ye']
            },
            listping: {
                category: 'Trigger System',
                desc: 'List all bot triggers',
                usage: '.listping',
                example: '.listping',
                perms: 'Manage Messages',
                aliases: ['lp']
            },
            addping: {
                category: 'Trigger System',
                desc: 'Add bot ping triggers',
                usage: '.botping add <message> <weight>',
                example: '.botping add hello 1.5',
                perms: 'Manage Messages',
                aliases: ['ap']
            },
            removeping: {
                category: 'Trigger System',
                desc: 'Remove bot ping triggers',
                usage: '.botping remove <message>',
                example: '.botping remove hello',
                perms: 'Manage Messages',
                aliases: ['rp']      
            },
            addtrigger: {
                category: 'Trigger System',
                desc: 'Add an auto-response trigger (supports multi-word phrases)',
                usage: '.addtrigger "<word/phrase>" <response>',
                example: '.addtrigger "good morning" Good morning! Have a great day!',
                perms: 'Manage Messages',
                aliases: ['at']
            },
            removetrigger: {
                category: 'Trigger System',
                desc: 'Remove an auto-response trigger',
                usage: '.removetrigger "<word/phrase>"',
                example: '.removetrigger "good morning"',
                perms: 'Manage Messages',
                aliases: ['rt']
            },
            listtrigger: {
                category: 'Trigger System',
                desc: 'Lists all preset auto-response triggers',
                usage: '.listtrigger',
                example: '.listtrigger',
                perms: 'Manage Messages',
                aliases: ['lt']
            },
            togglecommand: {
                category: 'Server Configuration',
                desc: 'Enable or disable a command in a server',
                usage: '.togglecommand <command_name>',
                example: '.togglecommand afk',
                perms: 'Manage Server',
                aliases: ['tc']
            },
            listcommand: {
                category: 'Server Configuration',
                desc: 'List all enabled and disabled commands in the server',
                usage: '.listcommand',
                example: '.listcommand',
                perms: 'None',
                aliases: ['lc']
            }
        };

        // If a specific command is specified
        if (args.length > 0) {
            const commandName = args[0].toLowerCase();
            const command = commandDetails[commandName];

            if (command) {
                const commandEmbed = new EmbedBuilder()
                    .setTitle(`Command: .${commandName}`)
                    .setColor('#5865F2')
                    .setDescription(command.desc)
                    .addFields(
                        { name: '📁 Category', value: command.category, inline: true },
                        { name: '🔒 Permission', value: command.perms, inline: true },
                        { name: '📝 Usage', value: `\`${command.usage}\``, inline: false },
                        { name: '💡 Example', value: `\`${command.example}\``, inline: false },
                    )
                    .setFooter({ 
                        text: 'Tip: Use .help to see all commands',
                        iconURL: message.author.displayAvatarURL()
                    })
                    .setTimestamp();

                // Add aliases field only if the command has aliases
                if (command.aliases && command.aliases.length > 0) {
                    commandEmbed.addFields({
                        name: '🔄 Aliases',
                        value: command.aliases.map(alias => `\`.${alias}\``).join(', '),
                        inline: false
                    });
                }

                return message.channel.send({ embeds: [commandEmbed] });
            } else {
                // Check if it's an alias
                const commandEntry = Object.entries(commandDetails).find(([_, cmd]) => 
                    cmd.aliases.includes(commandName)
                );

                if (commandEntry) {
                    const [mainCommand, commandData] = commandEntry;
                    const aliasEmbed = new EmbedBuilder()
                        .setTitle(`Command: .${mainCommand}`)
                        .setColor('#5865F2')
                        .setDescription(commandData.desc)
                        .addFields(
                            { name: '📁 Category', value: commandData.category, inline: true },
                            { name: '🔒 Permission', value: commandData.perms, inline: true },
                            { name: '📝 Usage', value: `\`${commandData.usage}\``, inline: false },
                            { name: '💡 Example', value: `\`${commandData.example}\``, inline: false },
                            { name: '🔄 Aliases', value: commandData.aliases.map(alias => `\`.${alias}\``).join(', '), inline: false }
                        )
                        .setFooter({ 
                            text: 'Tip: Use .help to see all commands',
                            iconURL: message.author.displayAvatarURL()
                        })
                        .setTimestamp();

                    return message.channel.send({ embeds: [aliasEmbed] });
                }

                const errorEmbed = new EmbedBuilder()
                    .setColor('#c83636')
                    .setDescription(`${emoji.cross} Command \`${commandName}\` not found. Use \`.help\` to see all commands.`);
                return message.channel.send({ embeds: [errorEmbed] });
            }
        }

        // Categories for the main help menu
        const categories = {
            'Moderation': {
                color: '#5865F2',
                commands: Object.entries(commandDetails)
                    .filter(([_, cmd]) => cmd.category === 'Moderation')
                    .map(([name, cmd]) => ({name, desc: cmd.desc, perms: cmd.perms }))
            },
            'Role Management': {
                color: '#5865F2',
                commands: Object.entries(commandDetails)
                    .filter(([_, cmd]) => cmd.category === 'Role Management')
                    .map(([name, cmd]) => ({ name, desc: cmd.desc, perms: cmd.perms }))
            },
            'Reaction System': {
                color: '#5865F2',
                commands: Object.entries(commandDetails)
                    .filter(([_, cmd]) => cmd.category === 'Reaction System')
                    .map(([name, cmd]) => ({name, desc: cmd.desc, perms: cmd.perms }))
            },
            'Trigger System': {
                color: '#5865F2',
                commands: Object.entries(commandDetails)
                    .filter(([_, cmd]) => cmd.category === 'Trigger System')
                    .map(([name, cmd]) => ({ name, desc: cmd.desc, perms: cmd.perms }))
            },
            'Server Configuration': {
                color: '#5865F2',
                commands: Object.entries(commandDetails)
                    .filter(([_, cmd]) => cmd.category === 'Server Configuration')
                    .map(([name, cmd]) => ({ name, desc: cmd.desc, perms: cmd.perms }))
            },
            'Miscellaneous': {
                color: '#5865F2',
                commands: Object.entries(commandDetails)
                    .filter(([_, cmd]) => cmd.category === 'Miscellaneous')
                    .map(([name, cmd]) => ({ name, desc: cmd.desc, perms: cmd.perms }))
            }
        };

        // Function to create category embed
        const createCategoryEmbed = (categoryName) => {
            const category = categories[categoryName];
            const embed = new EmbedBuilder()
                .setTitle(`📖 Help Menu - ${categoryName}`)
                .setDescription('Use `.help <command>` for detailed information about a specific command.')
                .setColor(category.color)
                .setThumbnail(client.user.displayAvatarURL())
                .setFooter({ 
                    text: `Category: ${categoryName}`,
                    iconURL: message.author.displayAvatarURL()
                })
                .setTimestamp();

            // Add commands for this category
            category.commands.forEach(cmd => {
                embed.addFields({
                    name: `.${cmd.name}`,
                    value: `📝 Description: ${cmd.desc}\n🔒 Permission: ${cmd.perms}`,
                    inline: false
                });
            });

            return embed;
        };

        const categorySelect = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('help_category')
                .setPlaceholder('Select a category...')
                .addOptions(
                    Object.keys(categories).map(category => ({
                        label: category,
                        value: category,
                    }))
                )
        );

        const initialCategory = Object.keys(categories)[0];
        const helpMsg = await message.channel.send({
            embeds: [createCategoryEmbed(initialCategory)],
            components: [categorySelect]
        });

        const collector = helpMsg.createMessageComponentCollector({
            filter: i => i.user.id === message.author.id,
            time: 300000 
        });

        collector.on('collect', async interaction => {
            if (interaction.customId === 'help_category') {
                const selectedCategory = interaction.values[0];
                await interaction.update({
                    embeds: [createCategoryEmbed(selectedCategory)],
                    components: [categorySelect]
                });
            }
        });

        collector.on('end', () => {
            const disabledSelect = new ActionRowBuilder().addComponents(
                categorySelect.components[0].setDisabled(true)
            );
            helpMsg.edit({ components: [disabledSelect] }).catch(console.error);
        });
    }
};