const { EmbedBuilder } = require('discord.js');
const { embed_color, emojis, red, green, yellow } = require('../../utils/constants');
const { getPrefix } = require('../../utils/prefix');

const ERROR_RESPONSES = {
    divisionByZero: [
        "Dividing by zero? The universe just called, it wants its paradox back! 🌌",
        "Even Chuck Norris can't divide by zero... and he can count to infinity twice! 💪",
        "Error 42: Universe.exe has stopped working due to division by zero 🌍💥",
        "My calculator just had an existential crisis. Thanks for that! 🤯",
        "Congratulations! You just created a black hole in my math processor! 🕳️"
    ],
    invalidExpression: [
        "I speak fluent math, but that's like... ancient Klingon to me! 👽",
        "My math translator is broken, can you try speaking in numbers? 🔢",
        "Is this some sort of mathematical interpretive dance? 💃",
        "Even Einstein would need a coffee break before tackling this one! ☕",
        "404: Math Logic Not Found! Have you tried turning it off and on again? 🔄"
    ],
    tooComplex: [
        "I'm just a humble calculator, not a quantum computer! 🤖",
        "Brain.exe has stopped working... Need more RAM to process this! 💾",
        "That's some big brain math you got there! Too big for my small circuits... 🧠",
        "I failed this level in Calculator School! Maybe try something simpler? 📚",
        "Error: Math too powerful! Please nerf! 🎮"
    ]
};

module.exports = {
    name: 'calculator',
    aliases: ['calc', 'math'],
    description: 'Calculate mathematical expressions',
    async execute(client, message, args) {
        const prefix = getPrefix(message.guild?.id);
        if (!args.length) {
            const embed = new EmbedBuilder()
                .setColor(embed_color)
                .setDescription(`What am I supposed to calculate? Try \`${prefix}calc 2 + 2\`\nI promise I won't get it wrong... probably 😅`);
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }

        const expression = args.join(' ');
        const cleanExpression = expression.replace(/`/g, '').replace(/```/g, '');
        
        if (cleanExpression.includes('/0')) {
            const response = ERROR_RESPONSES.divisionByZero[Math.floor(Math.random() * ERROR_RESPONSES.divisionByZero.length)];
            const embed = new EmbedBuilder()
                .setColor(embed_color)
                .setDescription(response);
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }

        try {
            if (!/^[0-9+\-*/(). ]+$/.test(cleanExpression)) {
                const response = ERROR_RESPONSES.invalidExpression[Math.floor(Math.random() * ERROR_RESPONSES.invalidExpression.length)];
                const embed = new EmbedBuilder()
                    .setColor(embed_color)
                    .setDescription(`${response}\n\nTip: I only understand basic math (numbers and +-*/()). Let's keep it simple! 🎯`);
                return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
            }

            const result = eval('(function() { return ' + cleanExpression + '; })()');

            if (typeof result !== 'number' || !isFinite(result)) {
                const response = ERROR_RESPONSES.tooComplex[Math.floor(Math.random() * ERROR_RESPONSES.tooComplex.length)];
                const embed = new EmbedBuilder()
                    .setColor(red)
                    .setDescription(response);
                return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
            }

            const embed = new EmbedBuilder()
                .setColor(embed_color)
                .setDescription(`${cleanExpression} = **${result}**`);
            
            message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        } catch (error) {
            const response = ERROR_RESPONSES.invalidExpression[Math.floor(Math.random() * ERROR_RESPONSES.invalidExpression.length)];
            const embed = new EmbedBuilder()
                .setColor(embed_color)
                .setDescription(`${response}`);
            message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }
    },
}; 
