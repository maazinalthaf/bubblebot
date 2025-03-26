require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Collection, Partials } = require('discord.js');
const fs = require('fs');
const botPingMessages = require('./botping.json');
const reactions = require('./reactions.json');
const { performance } = require('perf_hooks');
const triggersPath = './triggers.json';

// Initialize triggers - create empty object if file doesn't exist
let triggers = {};
try {
  if (fs.existsSync(triggersPath)) {
    triggers = JSON.parse(fs.readFileSync(triggersPath, 'utf8'));
  } else {
    fs.writeFileSync(triggersPath, JSON.stringify({}, null, 2));
  }
} catch (error) {
  console.error('Error loading triggers:', error);
}

// Creates new client
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers, GatewayIntentBits.DirectMessages],
    partials: [
      Partials.Channel,
      Partials.Message,
      Partials.User,
      Partials.GuildMember,
      Partials.Reaction
  ]
});

// Initialize commands collection
client.commands = new Collection(); 

// Load command files
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);

  // Ensure each command has a name and execute function
  if (command.name && typeof command.execute === 'function'){
    client.commands.set(command.name, command); 
  } else {
    console.error(`Command file ${file} is missing a name or execute function.`);
  }
}

const PREFIX = '?';
let startTime;

// Trigger Load
client.triggerManager = {
  reloadTriggers: (newTriggers) => {
      triggers = newTriggers;
      console.log('Triggers hot-reloaded');
  }
};

// Bot online confirmation message
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);

  // Log all registered commands
  console.log('Registered Commands:');
  client.commands.forEach(command => {
    console.log(`- ${command.name}`);
  });

  startTime = new Date(); // Initialize bot start time
});

// Checks for new messages sent
client.on('messageCreate', async (message) => {
  // Skip if message is from a bot
  if (message.author.bot) return;

  // Handle bot mentions (botping responses)
  if (message.mentions.has(client.user)) {
    const totalWeight = botPingMessages.reduce((sum, msg) => sum + msg.weight, 0);

    if (totalWeight === 0) {
      console.error('❌ No valid triggers available.');
    }

    let randomWeight = Math.random() * totalWeight;
    let selectedMessage = null;

    for (const msg of botPingMessages) {
      randomWeight -= msg.weight;
      if (randomWeight <= 0) {
        selectedMessage = msg.message;
        break;
      }
    }

    // Fallback if no message was selected
    if (!selectedMessage || selectedMessage.trim() === '') {
      selectedMessage = 'Sorry, I could not find a valid message.';
    }

    try {
      await message.reply(selectedMessage);
    } catch (error) {
      if (error.code === 50013) {
        console.log('Missing Permissions: Cannot send message in this channel.');
      } else {
        console.error('Error replying to message:', error);
      }
    }
  }

  const content = message.content.toLowerCase();
  const words = content.split(' ');

  // Auto reactor mechanism
  for (const word of words) {
    if (reactions[word]) {
      try {
        for (const emoji of reactions[word]) {
          await message.react(emoji);
        }
      } catch (error) {
        console.error('Error adding reaction:', error);
      }
    }
  }

// Trigger response mechanism (only if message doesn't start with prefix)
if (!message.content.startsWith(PREFIX)) {
  const content = message.content.toLowerCase().trim();
  
  // 1. Check for exact match first
  if (triggers[content]) {
      try {
          await message.reply(triggers[content]);
          return;
      } catch (error) {
          console.error('Failed to reply:', error);
      }
  }

  // 2. Check for multi-word triggers
  const multiWordTriggers = Object.keys(triggers).filter(t => t.includes(' '));
  for (const trigger of multiWordTriggers) {
      if (content.includes(trigger.toLowerCase())) {
          try {
              await message.reply(triggers[trigger]);
              return;
          } catch (error) {
              console.error('Failed to reply:', error);
          }
      }
  }

  // 3. Check for single word triggers
  const words = content.split(/\s+/);
  for (const word of words) {
      if (triggers[word]) {
          try {
              await message.reply(triggers[word]);
              return;
          } catch (error) {
              console.error('Failed to reply:', error);
          }
      }
  }
}

  // Command handler
  if (!message.content.startsWith(PREFIX)) return;
  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  // Retrieve the command or an alias
  const command = client.commands.get(commandName) 
  || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

  if (command) {
    try {
      await command.execute(client, message, args);
    } catch (error) {
      console.error(`Error executing ${commandName}:`, error);
      message.reply('There was an error executing that command.');
    }
  } else {
    console.log(`Command '${commandName}' not found.`);
  }
});

client.login(process.env.token);

// Functions //

// ms to time converter
function msToTime(duration) {
  if (Math.abs(duration) < 1000) { // Consider durations less than 1 second as 0
    return '0 seconds';
  }

  const milliseconds = Math.floor((duration % 1000) / 100);
  const seconds = Math.floor((duration / 1000) % 60);
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  const days = Math.floor(duration / (1000 * 60 * 60 * 24));

  const timeComponents = [];
  if (days > 0) {
    timeComponents.push(`${days} ${days === 1 ? 'day' : 'days'}`);
  }
  if (hours > 0) {
    timeComponents.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
  }
  if (minutes > 0) {
    timeComponents.push(`${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`);
  }
  if (seconds > 0) {
    timeComponents.push(`${seconds} ${seconds === 1 ? 'second' : 'seconds'}`);
  }

  let formattedTime = timeComponents.join(', ');
  if (timeComponents.length > 1) {
    const lastCommaIndex = formattedTime.lastIndexOf(',');
    formattedTime = formattedTime.slice(0, lastCommaIndex) + ' and' + formattedTime.slice(lastCommaIndex + 1);
  }

  return formattedTime;
}

function reloadTriggers() {
  try {
    if (fs.existsSync(triggersPath)) {
      triggers = JSON.parse(fs.readFileSync(triggersPath, 'utf8'));
      console.log('Triggers reloaded successfully');
    }
  } catch (error) {
    console.error('Error reloading triggers:', error);
  }
}