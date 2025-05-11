const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');
const { format } = require('date-fns');

module.exports = {

    name: 'countrytrivia',

    description: 'Test your knowledge about countries with this colorful trivia game!',

    aliases: ['geotrivia', 'ct','gt'],

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

            // Create question types (removed currency question)
            const questionTypes = [
                {
                    question: `🏙️ What is the capital of **${randomCountry.name.common}**?`,
                    answer: randomCountry.capital[0],
                    options: getRandomOptions(validCountries, 'capital', randomCountry.capital[0]),
                    color: '#3498db'
                },
                {
                    question: `🌎 Which continent is **${randomCountry.name.common}** located in?`,
                    answer: randomCountry.region,
                    options: getRandomOptions(validCountries, 'region', randomCountry.region),
                    color: '#2ecc71'
                },
                {
                    question: `🧑‍🤝‍🧑 What is the population of **${randomCountry.name.common}**?`,
                    answer: formatPopulation(randomCountry.population),
                    options: getPopulationOptions(randomCountry.population),
                    color: '#e74c3c'
                },
                {
                    question: `🏳️ Which country does this flag belong to?`,
                    answer: randomCountry.name.common,
                    options: getRandomOptions(validCountries, 'name', randomCountry.name.common),
                    flag: randomCountry.flags.png,
                    color: '#f1c40f'
                }
            ];

            // Select a random question type
            const selectedQuestion = questionTypes[Math.floor(Math.random() * questionTypes.length)];

            // Shuffle options
            const shuffledOptions = shuffleArray([...selectedQuestion.options]);

            // Create action row with buttons
            const row = new ActionRowBuilder();

            for (let i = 0; i < 4; i++) {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`trivia_${i}`)
                        .setLabel(shuffledOptions[i].length > 80 ? shuffledOptions[i].substring(0, 77) + '...' : shuffledOptions[i])
                        .setStyle(ButtonStyle.Primary)
                );
            }

            const embed = new EmbedBuilder()
                .setColor(selectedQuestion.color)
                .setTitle('🌍 Country Trivia Challenge')
                .setDescription(`**${selectedQuestion.question}**\n\nYou have 20 seconds to answer!`);

            // Add fields for each option (without emoji indicators)
            shuffledOptions.forEach((option, index) => {
                embed.addFields({
                    name: `Option ${index + 1}`,
                    value: option,
                    inline: true
                });
            });

            embed.setFooter({ 
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

                row.components.forEach(component => 
                    component.setDisabled(true)
                );

                await i.update({ components: [row] });

                // Create result embed
                const resultEmbed = new EmbedBuilder()
                    .setColor(isCorrect ? '#2ecc71' : '#e74c3c')
                    .setTitle(isCorrect ? '🎉 Correct Answer!' : '❌ Incorrect Answer!')
                    .setDescription(
                        isCorrect 
                            ? `**${message.author.username}**, you got it right! 🎊\n\nThe answer was indeed:\n**${selectedQuestion.answer}**`
                            : `**${message.author.username}**, that's not correct. 😢\n\nThe right answer was:\n**${selectedQuestion.answer}**`
                    )
                    .setThumbnail(isCorrect ? 'https://emojicdn.elk.sh/🎯' : 'https://emojicdn.elk.sh/💔')
                    .setFooter({ text: 'Want to play again? Run the command again!' });

                if (selectedQuestion.flag && !selectedQuestion.question.includes('flag')) {
                    resultEmbed.setImage(randomCountry.flags.png);
                }

                message.channel.send({ embeds: [resultEmbed] });
                collector.stop();
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    row.components.forEach(component => 
                        component.setDisabled(true)
                    );
                
                    triviaMessage.edit({ components: [row] }).catch(() => {});                
                    message.channel.send({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('#f39c12')
                                .setTitle('⏰ Time\'s Up!')
                                .setDescription(`You didn't answer in time!\n\nThe correct answer was:\n**${selectedQuestion.answer}**`)
                                .setFooter({ text: 'Too slow! Try again with .trivia' })
                        ]
                    });
                }
            });

        } catch (error) {
            console.error('Error in trivia command:', error);
            message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#ffcc32')
                        .setDescription(`${emojis.error}An error occurred while fetching country data. Please try again later.`)
                 ]
            });
        }
    }
};

// Helper functions (removed currency-related functions)
function getRandomOptions(countries, property, correctAnswer) {
    const options = new Set([correctAnswer]);
    while (options.size < 4) {
        const randomCountry = countries[Math.floor(Math.random() * countries.length)];
        let option;
        if (property === 'name') {
            option = randomCountry.name.common;
        } else if (property === 'capital') {
            option = randomCountry.capital ? randomCountry.capital[0] : 'N/A';
        } else if (property === 'region') {
            option = randomCountry.region;
        }
        if (option && option !== correctAnswer) {
            options.add(option);
        }
    }
    return Array.from(options);
}

function getPopulationOptions(correctPopulation) {
    const correctFormatted = formatPopulation(correctPopulation);
    const options = new Set([correctFormatted]);

    while (options.size < 4) {
        // Generate random variations (50% to 200% of actual population)
        const variation = 0.5 + Math.random() * 1.5;
        const randomPopulation = Math.round(correctPopulation * variation);
        options.add(formatPopulation(randomPopulation));
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