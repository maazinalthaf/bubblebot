const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'nick',
    async execute(client, message, args) {
        // Check if the user has permission to use the command
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
            const embed = new EmbedBuilder()
                .setColor('#C83636')
                .setDescription('<:cross:1283228336666968114> You do not have permission to use this command.');
            return message.channel.send({ embeds: [embed] });
        }

        // Check if args are provided
        const userInput = args[0];
        const newNickname = args.slice(1).join(' ');

        if (!userInput) {
            const embed = new EmbedBuilder()
                .setColor('#ffcc32')
                .setDescription('<:hazard:1283227908491710505> Please provide a user mention/ID and the new nickname.');
            return message.channel.send({ embeds: [embed] });
        }

        try {
            // Extract user ID from mention if necessary
            const userId = userInput.replace(/[<@!>]/g, '');
            const user = await client.users.fetch(userId);
            const member = await message.guild.members.fetch(user.id);

            // Check if the bot can manage the target user's nickname
            if (member.roles.highest.position >= message.guild.members.me.roles.highest.position) {
                const embed = new EmbedBuilder()
                    .setColor('#C83636')
                    .setDescription('<:cross:1283228336666968114> I cannot modify this user\'s nickname due to role hierarchy.');
                return message.channel.send({ embeds: [embed] });
            }

            // Check if the command user can manage the target user's nickname
            if (member.roles.highest.position >= message.member.roles.highest.position && message.member.id !== message.guild.ownerId) {
                const embed = new EmbedBuilder()
                    .setColor('#C83636')
                    .setDescription('<:cross:1283228336666968114> You cannot modify this user\'s nickname due to role hierarchy.');
                return message.channel.send({ embeds: [embed] });
            }

            // If no new nickname is provided, reset it
            if (!newNickname) {
                await member.setNickname(null);
                const embed = new EmbedBuilder()
                    .setColor('#01b700')
                    .setDescription(`<:tick:1321937653708492850> Successfully reset nickname for ${user}.`);
                return message.channel.send({ embeds: [embed] });
            }

            // Check nickname length
            if (newNickname.length > 32) {
                const embed = new EmbedBuilder()
                    .setColor('#ffcc32')
                    .setDescription('<:hazard:1283227908491710505> Nickname cannot be longer than 32 characters.');
                return message.channel.send({ embeds: [embed] });
            }

            // Set the new nickname
            await member.setNickname(newNickname);
            
            const embed = new EmbedBuilder()
                .setColor('#01b700')
                .setDescription(`<:tick:1321937653708492850> Successfully changed ${user}'s nickname to: ${newNickname}`);
            return message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error(error);
            const embed = new EmbedBuilder()
                .setColor('#ffcc32')
                .setDescription('<:hazard:1283227908491710505> An error occurred while trying to change the nickname.');
            return message.channel.send({ embeds: [embed] });
        }
    },
};