require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Collection, Partials } = require('discord.js');
const fs = require('fs');
const { performance } = require('perf_hooks');
const { snipes } = require('./commands/Moderation/snipe.js');
const { editsnipes } = require('./commands/Moderation/editsnipe.js');
const triggersPath = './triggers.json';
const afkDataFile = './afkData.json';
const disabledCommandsPath = './disabledCommands.json';
const { checkCommandDisabled } = require('./commands/Server Configuration/togglecommand');
let afkData = {};

let triggers = {};
let reactions = {};

try {
  if (fs.existsSync(triggersPath)) {
    triggers = JSON.parse(fs.readFileSync(triggersPath, 'utf8'));
  } else {
    fs.writeFileSync(triggersPath, JSON.stringify({}, null, 2));
  }
  
  if (fs.existsSync('./reactions.json')) {
    reactions = JSON.parse(fs.readFileSync('./reactions.json', 'utf8'));
  } else {
    fs.writeFileSync('./reactions.json', JSON.stringify({}, null, 2));
  }
} catch (error) {
  console.error('Error loading triggers/reactions:', error);
}

// Create new client
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

// Helper function to recursively get all .js files in a directory
function getAllCommandFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of list) {
    const filePath = `${dir}/${file.name}`;
    if (file.isDirectory()) {
      results = results.concat(getAllCommandFiles(filePath));
    } else if (file.isFile() && file.name.endsWith('.js')) {
      results.push(filePath);
    }
  }
  return results;
}

// Load command files from /commands and all subfolders
const commandFiles = getAllCommandFiles('./commands');
for (const file of commandFiles) {
  const command = require(file);
  // Ensure each command has a name and execute function
  if (command.name && typeof command.execute === 'function'){
    client.commands.set(command.name, command); 
  } else {
    console.error(`Command file ${file} is missing a name or execute function.`);
  }
}

const PREFIX = '.';

// Load stored AFK data from file if it exists
if (fs.existsSync(afkDataFile)) {
  const data = fs.readFileSync(afkDataFile, 'utf8');
  afkData = JSON.parse(data);

}



let startTime;

// Reload Manager
client.triggerManager = {
  reloadTriggers: (newTriggers) => {
    triggers = newTriggers;
    console.log('Triggers hot-reloaded');
  },
  reloadReactions: (newReactions) => {
    reactions = newReactions;
    console.log('Reactions hot-reloaded');
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
    // Reload AFK data from file before processing each message

    if (fs.existsSync(afkDataFile)) {
      const data = fs.readFileSync(afkDataFile, 'utf8');
      afkData = JSON.parse(data);
  }  
   
 // Skip if message is from a bot or not in a guild
  if (message.author.bot || !message.guild) return;

  
// When afk user comes back from afk status

if (afkData[message.author.id]) {
  const { timestamp } = afkData[message.author.id];
  const timeSinceAfk = Date.now() - timestamp;
  delete afkData[message.author.id];
  const embed = new EmbedBuilder()
    .setColor('#FFCC32')
    .setDescription(`👋 **${message.author}**: Welcome back, you were AFK for **${msToTime(timeSinceAfk)}**.`);
  message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });

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
  message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });

}

  const guildId = message.guild.id;
  const content = message.content.toLowerCase();
  const words = content.split(' ');

  // Auto reactor mechanism
  const serverReactions = reactions[guildId] || {};
  for (const word of words) {
    if (serverReactions[word]) {
      try {
        for (const emoji of serverReactions[word]) {
          await message.react(emoji).catch(console.error);
        }
      } catch (error) {
        console.error('Error adding reaction:', error);
      }
    }
  }

// Trigger response mechanism 
 if (!message.content.startsWith(PREFIX)) {
    const serverTriggers = triggers[guildId] || {};
    const content = message.content.toLowerCase().trim();
    
    // Check for exact match first
    if (serverTriggers[content]) {
      try {
        await message.reply(serverTriggers[content]);
        return;
      } catch (error) {
        console.error('Failed to reply:', error);
      }
    }

    // Check for multi-word triggers
    const multiWordTriggers = Object.keys(serverTriggers).filter(t => t.includes(' '));
    for (const trigger of multiWordTriggers) {
      if (content.includes(trigger.toLowerCase())) {
        try {
          await message.reply(serverTriggers[trigger]);
          return;
        } catch (error) {
          console.error('Failed to reply:', error);
        }
      }
    }

    // Check for single word triggers
    const words = content.split(/\s+/);
    for (const word of words) {
      if (serverTriggers[word]) {
        try {
          await message.reply(serverTriggers[word]);
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
    // Check if command is disabled in this server
    if (message.guild && checkCommandDisabled(message.guild.id, command.name)) {
     return;
    }
    try {
      await command.execute(client, message, args);
    } catch (error) {
      console.error(`Error executing ${commandName}:`, error);
    }
  } else {
    console.log(`Command '${commandName}' not found.`);
  }
});



// Message Delete Listner
client.on('messageDelete', (message) => {

  if (!message.partial) {

      const attachment = message.attachments.first()?.url || null;
      // Store the deleted message in the snipes map

      const channelSnipes = snipes.get(message.channel.id) || [];
      channelSnipes.unshift({
          content: message.content,
          author: message.author,
          createdAt: message.createdTimestamp,
          attachment,
      });

      if (channelSnipes.length > 20) channelSnipes.pop();
      snipes.set(message.channel.id, channelSnipes);
  }

});



// Message Update Listner
client.on('messageUpdate', (oldMessage, newMessage) => {

  if (!oldMessage.partial && !newMessage.partial) {
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

// Trigger Reload 
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

// Save AFK data function
function saveAfkData() {
  fs.writeFileSync(afkDataFile, JSON.stringify(afkData, null, 2), 'utf8');
}