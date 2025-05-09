const { EmbedBuilder } = require('discord.js');
const { embed_color: EMBED_COLOR } = require('../../constants');

// Funny responses for invalid expressions
const HUMOR_RESPONSES = [
    "I'm good at math, but not *that* good! 🤔",
    "Even Einstein would scratch his head at this one! 🧐",
    "My calculator just ran away screaming! 😱",
    "Did you just try to divide by zero? You monster! 😅",
    "I think we need a bigger calculator for this... 📱",
    "Error 404: Math logic not found! 🤖",
    "That's beyond my pay grade! 💸",
    "I skipped that lesson in calculator school! 🎓",
    "Is this some kind of advanced math joke? 🃏",
    "My brain.exe has stopped working... 🔧"
];

module.exports = {
    name: 'calculator',
    aliases: ['calc', 'math'],
    description: 'Calculate mathematical expressions',
    async execute(client, message, args) {
        if (!args.length) {
            const embed = new EmbedBuilder()
                .setColor('#FF6B6B')
                .setDescription('❌ What am I supposed to calculate? Try `.calc 2 + 2`');
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }

        const expression = args.join(' ');
        
        // Remove any backticks or code blocks if present
        const cleanExpression = expression.replace(/`/g, '').replace(/```/g, '');
        
        try {
            // Validate expression contains only safe characters
            if (!/^[0-9+\-*/(). ]+$/.test(cleanExpression)) {
                const embed = new EmbedBuilder()
                    .setColor('#FF6B6B')
                    .setDescription('❌ Nice try! But I only understand basic math. Keep it simple with numbers and +-*/()');
                return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
            }

            // Evaluate the expression safely
            const result = eval('(function() { return ' + cleanExpression + '; })()');

            if (typeof result !== 'number' || !isFinite(result)) {
                const embed = new EmbedBuilder()
                    .setColor('#FF6B6B')
                    .setDescription('❌ That\'s beyond my math skills! Try something that gives a normal number.');
                return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
            }

            const embed = new EmbedBuilder()
                .setColor(EMBED_COLOR)
                .setDescription(`\`${cleanExpression}\` = **${result}**`);
            
            message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        } catch (error) {
            const embed = new EmbedBuilder()
                .setColor('#FF6B6B')
                .setDescription('❌ Oops! That math doesn\'t add up. Check your expression and try again.');
            message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }
    },
}; 