const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const { format } = require('date-fns');
const {emojis, embed_color} = require('../../constants')

module.exports = {
    name: 'countrytrivia',
    description: 'Test your knowledge about countries with this trivia game!',
    aliases: ['geotrivia', 'ct', 'gt'],

    async execute(client, message, args) {
        try {
            const loadingMsg = await message.channel.send('🌍 Fetching country data...');
            const response = await axios.get('https://restcountries.com/v3.1/all');
            const countries = response.data;
            await loadingMsg.delete().catch(() => {});
            
            const validCountries = countries.filter(
                country => country.capital && country.name && country.flags && country.population > 0
            );

            if (validCountries.length === 0) {
                return message.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#c83636')
                            .setDescription(`${emojis.cross} Could not fetch country data. Please try again later.`)
                    ]
                });
            }

            const randomCountry = validCountries[Math.floor(Math.random() * validCountries.length)];

            // Question types
            const questionTypes = [
                {
                    question: `What is the capital of **${randomCountry.name.common}**?`,
                    answer: randomCountry.capital[0],
                    options: getRandomOptions(validCountries, 'capital', randomCountry.capital[0]),
                    color: '#3498DB'
                },
                {
                    question: `Which continent is **${randomCountry.name.common}** located in?`,
                    answer: randomCountry.region,
                    options: getRandomOptions(validCountries, 'region', randomCountry.region),
                    color: '#2ECC71'
                },
                {
                    question: `What is the approximate population of **${randomCountry.name.common}**?`,
                    answer: formatPopulation(randomCountry.population),
                    options: getPopulationOptions(randomCountry.population),
                    color: '#E74C3C'
                },
                {
                    question: `Which country does this flag belong to?`,
                    answer: randomCountry.name.common,
                    options: getRandomOptions(validCountries, 'name', randomCountry.name.common),
                    flag: randomCountry.flags.png,
                    color: '#F1C40F'
                }
            ];

            const selectedQuestion = questionTypes[Math.floor(Math.random() * questionTypes.length)];
            const shuffledOptions = shuffleArray([...selectedQuestion.options]);

            // Create buttons with alternating styles
            const row = new ActionRowBuilder();
            const buttonStyles = [ButtonStyle.Primary, ButtonStyle.Secondary, ButtonStyle.Success, ButtonStyle.Danger];
            
            shuffledOptions.forEach((option, index) => {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`trivia_${index}`)
                        .setLabel(option.length > 80 ? `${option.substring(0, 77)}...` : option)
                        .setStyle(buttonStyles[index % buttonStyles.length])
                );
            });

            const embed = new EmbedBuilder()
                .setColor(selectedQuestion.color)
                .setTitle('Country Trivia')
                .setDescription(`**${selectedQuestion.question}**\n\nYou have 20 seconds to answer!`)
                .setFooter({ 
                    text: `Requested by ${message.author.username} • ${format(new Date(), 'MMM d, yyyy h:mm a')}`,
                    iconURL: message.author.displayAvatarURL()
                });

            if (selectedQuestion.flag) {
                embed.setThumbnail(selectedQuestion.flag);
            }

            const triviaMessage = await message.channel.send({ 
                embeds: [embed], 
                components: [row] 
            });

            const filter = i => i.user.id === message.author.id;
            const collector = triviaMessage.createMessageComponentCollector({ 
                filter, 
                time: 20000 
            });

            collector.on('collect', async i => {
                const selectedIndex = parseInt(i.customId.split('_')[1]);
                const selectedOption = shuffledOptions[selectedIndex];
                const isCorrect = selectedOption === selectedQuestion.answer;

                // Disable all buttons after selection
                row.components.forEach(btn => btn.setDisabled(true));
                await i.update({ components: [row] });

                const resultEmbed = new EmbedBuilder()
                    .setColor(isCorrect ? '#2ECC71' : '#E74C3C')
                    .setTitle(isCorrect ? '✅ Correct!' : '❌ Incorrect')
                    .setDescription(isCorrect 
                        ? `You guessed correctly! The answer was:\n**${selectedQuestion.answer}**`
                        : `Sorry, the correct answer was:\n**${selectedQuestion.answer}**`)
                    .setFooter({ text: 'Run the command again to play more!' });

                if (selectedQuestion.flag && !selectedQuestion.question.includes('flag')) {
                    resultEmbed.setImage(randomCountry.flags.png);
                }

                await message.channel.send({ embeds: [resultEmbed] });
                collector.stop();
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    row.components.forEach(btn => btn.setDisabled(true));
                    triviaMessage.edit({ components: [row] }).catch(() => {});
                    
                    message.channel.send({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('#F39C12')
                                .setTitle('⏰ Time\'s Up!')
                                .setDescription(`The correct answer was:\n**${selectedQuestion.answer}**`)
                        ]
                    });
                }
            });

        } catch (error) {
            console.error('Error in trivia command:', error);
            message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FFcc32')
                        .setDescription(`${emojis.error} An error occurred. Please try again later.`)
                ]
            });
        }
    }
};

// Helper functions
function getRandomOptions(countries, property, correctAnswer) {
    const options = new Set([correctAnswer]);
    while (options.size < 4) {
        const randomCountry = countries[Math.floor(Math.random() * countries.length)];
        let option;
        if (property === 'name') option = randomCountry.name.common;
        else if (property === 'capital') option = randomCountry.capital?.[0] || 'N/A';
        else if (property === 'region') option = randomCountry.region;
        if (option && option !== correctAnswer) options.add(option);
    }
    return Array.from(options);
}

function getPopulationOptions(correctPopulation) {
    const correctFormatted = formatPopulation(correctPopulation);
    const options = new Set([correctFormatted]);
    while (options.size < 4) {
        const variation = 0.5 + Math.random() * 1.5;
        options.add(formatPopulation(Math.round(correctPopulation * variation)));
    }
    return Array.from(options);
}

function formatPopulation(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}