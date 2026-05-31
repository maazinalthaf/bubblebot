const { EmbedBuilder } = require('discord.js');
const { embed_color, emojis, red, green, yellow } = require('../../utils/constants');
const axios = require('axios');
const { getPrefix } = require('../../utils/prefix');

function getAqiInfo(aqi) {
    if (aqi === null || aqi === undefined) return null;
    if (aqi <= 50)  return { label: 'Good',                   color: 0x00E400, emoji: '🟢' };
    if (aqi <= 100) return { label: 'Moderate',                color: 0xFFFF00, emoji: '🟡' };
    if (aqi <= 150) return { label: 'Unhealthy for Sensitive', color: 0xFF7E00, emoji: '🟠' };
    if (aqi <= 200) return { label: 'Unhealthy',               color: 0xFF0000, emoji: '🔴' };
    if (aqi <= 300) return { label: 'Very Unhealthy',          color: 0x8F3F97, emoji: '🟣' };
    return              { label: 'Hazardous',                  color: 0x7E0023, emoji: '🟤' };
}

async function fetchWaqiAqi(latitude, longitude) {
    const token = process.env.waqi_token;
    if (!token) return null; 

    try {
        const res = await axios.get(
            `https://api.waqi.info/feed/geo:${latitude};${longitude}/?token=${token}`
        );
        if (res.data?.status === 'ok') {
            return res.data.data.aqi ?? null;
        }
    } catch {}

    return null;
}

async function getTimezone(lat, lon) {
    try {
        const res = await axios.get(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&timezone=auto&forecast_days=0`
        );
        return res.data?.timezone || 'UTC';
    } catch {
        return 'UTC';
    }
}

module.exports = {
    name: 'weather',
    aliases: ['w'],
    description: 'Check weather for any location',
    async execute(client, message, args) {
        const prefix = getPrefix(message.guild?.id);

        if (!args.length) {
            const embed = new EmbedBuilder()
                .setColor(yellow)
                .setDescription(`${emojis.error} Please provide a location! Example: \`${prefix}weather London, UK\``);
            return message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
        }

        const location = args.join(' ');

        try {
            const geocodeResponse = await axios.get(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1&addressdetails=1`,
                { headers: { 'User-Agent': 'DiscordWeatherBot/1.0' } }
            );

            if (!geocodeResponse.data?.[0]) {
                return message.reply('Location not found! Try being more specific (e.g., "London, UK")');
            }

            const place     = geocodeResponse.data[0];
            const latitude  = parseFloat(place.lat);
            const longitude = parseFloat(place.lon);
            const addr      = place.address || {};

            const city    = addr.city || addr.town || addr.village || addr.county || place.display_name.split(',')[0];
            const country = addr.country || '';
            const tzName = await getTimezone(latitude, longitude);

            const [weatherResponse, usAqi] = await Promise.all([
                axios.get(
                    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,pressure_msl,visibility&timezone=${encodeURIComponent(tzName)}`
                ),
                fetchWaqiAqi(latitude, longitude),
            ]);

            const current = weatherResponse.data.current;
            const aqiInfo = getAqiInfo(usAqi);

            let weatherEmoji = '🌡️';
            const weatherCode = current.weather_code;
            if ([0, 1].includes(weatherCode))                                          weatherEmoji = '☀️';
            else if ([2, 3].includes(weatherCode))                                     weatherEmoji = '⛅';
            else if ([45, 48].includes(weatherCode))                                   weatherEmoji = '🌫️';
            else if ([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(weatherCode))  weatherEmoji = '🌧️';
            else if ([71, 73, 75, 77, 85, 86].includes(weatherCode))                  weatherEmoji = '🌨️';
            else if ([95, 96, 99].includes(weatherCode))                               weatherEmoji = '⛈️';
            else                                                                        weatherEmoji = '☁️';

            const fields = [
                {
                    name: '🌡️ Temperature',
                    value: `${Math.round(current.temperature_2m)}°C (${Math.round(current.temperature_2m * 9/5 + 32)}°F)`,
                    inline: true,
                },
                {
                    name: '💨 Wind',
                    value: `${Math.round(current.wind_speed_10m)} km/h`,
                    inline: true,
                },
                {
                    name: '💧 Humidity',
                    value: `${Math.round(current.relative_humidity_2m)}%`,
                    inline: true,
                },
                {
                    name: '🌪️ Pressure',
                    value: `${Math.round(current.pressure_msl)} hPa`,
                    inline: true,
                },
                {
                    name: '👁️ Visibility',
                    value: `${Math.round(current.visibility / 1000)} km`,
                    inline: true,
                },
            ];

            // Only add AQI field if token was set and data came back
            if (aqiInfo && usAqi !== null) {
                fields.push({
                    name: '🌬️ US Air Quality (AQI)',
                    value: `${aqiInfo.emoji} **${usAqi}** — ${aqiInfo.label}`,
                    inline: true,
                });
            }

            const embed = new EmbedBuilder()
                .setColor(embed_color)
                .setTitle(`${weatherEmoji} Weather in ${city}, ${country}`)
                .setDescription('Current weather conditions')
                .addFields(fields)
                .setTimestamp()
                .setFooter({ text: `Timezone: ${tzName.replace('/', ' / ')}` });

            message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });

        } catch (error) {
            console.error('Weather command error:', error);
            message.reply('Failed to fetch weather data. Please try again later.');
        }
    },
};