# Setup Instructions for New Commands

## Weather Command Setup
1. Get an API key from Visual Crossing Weather (Free and Easy):
   - Go to https://www.visualcrossing.com/weather-api
   - Sign up for a free account
   - Get your API key from the dashboard
   - Free tier includes 1000 calls per day
   - No credit card required!

2. Add your API key to the `.env` file:
```env
WEATHER_API_KEY=your_api_key_here
```

## Package Installation
Run the following command to install required packages:
```bash
npm install axios
```

## Usage Examples

### Weather Command
```
.weather London, UK
.weather Tokyo, Japan
.weather New York, US
.w Paris, France
```

### Calculator Command
```
.calc 2 + 2
.calc 5 * 10
.calc (10 + 5) * 2
.math 100 / 5
```

## Features

### Weather Command
- Check weather for any location worldwide
- Shows temperature in both °C and °F
- Displays wind speed and humidity
- Dynamic weather emojis based on conditions:
  - 🌧️ Rain
  - 🌨️ Snow
  - ☀️ Clear skies
  - ☁️ Cloudy
  - ⛈️ Thunderstorm
  - 🌫️ Fog/Mist
  - 💨 High winds
- Shows local time of location
- Error handling for invalid locations
- Minimal embed design

### Calculator Command
- Basic arithmetic operations
- Parentheses support
- Humorous responses for invalid expressions
- Safe expression evaluation
- Clean embed display 