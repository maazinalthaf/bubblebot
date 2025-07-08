const { EmbedBuilder } = require('discord.js');
const { embed_color, emojis } = require('../../utils/constants');
const axios = require('axios');
const { getPrefix } = require('../../utils/prefix');

module.exports = {
    name: 'weather',
    aliases: ['w'],
    description: 'Check weather for any location',
    async execute(client, message, args) {
        const prefix = getPrefix(message.guild?.id);
        if (!args.length) {
            const embed = new EmbedBuilder
            .setColor('#ffcc32')
            .setDescription(`${emojis.error} Please provide a location! Example: \`${prefix}weather London, UK\``)
            message.reply({ embeds: [embed] , AllowedMentions :{ repliedUser: false }});
        }

        const location = args.join(' ');

        try {
            // First, get coordinates using geocoding API
            const geocodeResponse = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`);
            
            if (!geocodeResponse.data.results?.[0]) {
                return message.reply('Location not found! Try being more specific (e.g., "London, UK")');
            }

            const locationData = geocodeResponse.data.results[0];
            const { latitude, longitude, name, country, timezone } = locationData;

            // Get weather data using coordinates
            const weatherResponse = await axios.get(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,pressure_msl,visibility&timezone=${timezone}`
            );

            const current = weatherResponse.data.current;

            // Get weather emoji based on WMO weather codes
            let weatherEmoji = '🌡️'; // default
            const weatherCode = current.weather_code;
            
            if ([0, 1].includes(weatherCode)) weatherEmoji = '☀️'; // Clear
            else if ([2, 3].includes(weatherCode)) weatherEmoji = '⛅'; // Partly cloudy
            else if ([45, 48].includes(weatherCode)) weatherEmoji = '🌫️'; // Foggy
            else if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) weatherEmoji = '🌧️'; // Rain
            else if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) weatherEmoji = '🌨️'; // Snow
            else if ([95, 96, 99].includes(weatherCode)) weatherEmoji = '⛈️'; // Thunderstorm
            else weatherEmoji = '☁️'; // Cloudy

            const embed = new EmbedBuilder()
                .setColor(embed_color)
                .setTitle(`${weatherEmoji} Weather in ${name}, ${country}`)
                .setDescription(`Current weather conditions`)
                .addFields([
                    { 
                        name: '🌡️ Temperature', 
                        value: `${Math.round(current.temperature_2m)}°C (${Math.round(current.temperature_2m * 9/5 + 32)}°F)`, 
                        inline: true 
                    },
                    { 
                        name: '💨 Wind', 
                        value: `${Math.round(current.wind_speed_10m)} km/h`, 
                        inline: true 
                    },
                    { 
                        name: '💧 Humidity', 
                        value: `${Math.round(current.relative_humidity_2m)}%`, 
                        inline: true 
                    },
                    { 
                        name: '🌪️ Pressure', 
                        value: `${Math.round(current.pressure_msl)} hPa`, 
                        inline: true 
                    },
                    {
                        name: '👁️ Visibility',
                        value: `${Math.round(current.visibility / 1000)} km`,
                        inline: true
                    }
                ])
                .setTimestamp()
                .setFooter({ text: `Timezone: ${timezone.replace('/', ' / ')}` });

            message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        } catch (error) {
            console.error('Weather API Error:', error);
            message.reply('Failed to fetch weather data. Please try again later.');
        }
    },
}; 