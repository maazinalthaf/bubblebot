require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Collection, Partials } = require('discord.js');
const fs = require('fs');
const botPingMessages = require('./botping.json');
const { performance } = require('perf_hooks');
const { snipes } = require('./commands/snipe.js'); // Import the snipes map
const { editsnipes } = require('./commands/editsnipe.js'); // Import the editsnipes map
let afkData = {};

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

//Load command files
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
const reactions = require('./reactions.json');
const afkDataFile = './afkData.json';

// Load stored AFK data from file if it exists
if (fs.existsSync(afkDataFile)) {
    const data = fs.readFileSync(afkDataFile, 'utf8');
    afkData = JSON.parse(data);
  }
  
  let startTime;

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
  // Reload AFK data from file before processing each message
  if (fs.existsSync(afkDataFile)) {
    const data = fs.readFileSync(afkDataFile, 'utf8');
    afkData = JSON.parse(data);
}  
  
  // Bot messages filter
    if (message.author.bot) return;
  
    // Random replier on bot ping , @here or @everyone ping 
    if (message.mentions.has(client.user)) {
      const totalWeight = botPingMessages.reduce((sum, msg) => sum + msg.weight, 0);
      let randomWeight = Math.random() * totalWeight;
  
      let selectedMessage;
      for (const msg of botPingMessages) {
        randomWeight -= msg.weight;
        if (randomWeight <= 0) {
          selectedMessage = msg.message;
          break;
        }
      }
  
      message.reply(selectedMessage);
      return; // Don't proceed with command processing for bot mentions
    }
    
    // When afk user comes back from afk status
    if (afkData[message.author.id]) {
      const { timestamp } = afkData[message.author.id];
      const timeSinceAfk = Date.now() - timestamp;
      delete afkData[message.author.id];
  
      const embed = new EmbedBuilder()
        .setColor('#FFCC32')
        .setDescription(`👋 **${message.author}**: Welcome back, you were AFK for **${msToTime(timeSinceAfk)}**.`);
  
      message.channel.send({ embeds: [embed] });
  
      // Save the updated AFK data without the deleted entry
      saveAfkData();
    }
  
    const mentionedUser = message.mentions.users.first();
    
    // Displays afk user status
    if (mentionedUser && afkData[mentionedUser.id]) {
      const { afkMessage, timestamp } = afkData[mentionedUser.id];
      const timeSinceAfk = Date.now() - timestamp;
  
      const embed = new EmbedBuilder()
        .setColor('#4289C1')
        .setDescription(`💤 ${mentionedUser} is AFK: ${afkMessage || ''} - **${msToTime(timeSinceAfk)} ago**.`);
  
      message.channel.send({ embeds: [embed] });
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

client.on('messageDelete', (message) => {
  if (!message.partial) {
      const attachment = message.attachments.first()?.url || null;

      // Store the deleted message in the snipes map
      const channelSnipes = snipes.get(message.channel.id) || [];

      channelSnipes.unshift({
          content: message.content,
          author: message.author,
          createdAt: message.createdTimestamp,
          attachment, // Save the attachment URL if present
      });

      // Keep only the last 20 sniped messages per channel
      if (channelSnipes.length > 20) channelSnipes.pop();

      snipes.set(message.channel.id, channelSnipes);
  }
});

// Add a messageUpdate listener
client.on('messageUpdate', (oldMessage, newMessage) => {
  if (!oldMessage.partial && !newMessage.partial) {
      // Ensure the message wasn't just a bot's edit or identical content
      if (oldMessage.content === newMessage.content || oldMessage.author.bot) return;

      const channelEditsnipes = editsnipes.get(oldMessage.channel.id) || [];

      channelEditsnipes.unshift({
          oldContent: oldMessage.content,
          newContent: newMessage.content,
          author: oldMessage.author,
          editedAt: newMessage.editedTimestamp,
      });

      // Keep only the last 20 editsniped messages per channel
      if (channelEditsnipes.length > 20) channelEditsnipes.pop();

      editsnipes.set(oldMessage.channel.id, channelEditsnipes);
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

// Save AFK data function
function saveAfkData() {
  fs.writeFileSync(afkDataFile, JSON.stringify(afkData, null, 2), 'utf8');
}