require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Collection, Partials } = require('discord.js');
const fs = require('fs');
const botPingMessages = require('./databases/botping.json');
const reactions = require('./databases/reactions.json');
const { performance } = require('perf_hooks');
const { snipes } = require('./commands/admin/snipe.js');
const { editsnipes } = require('./commands/admin/editsnipe.js');
const triggersPath = './databases/triggers.json';
const afkDataFile = './databases/afkData.json';
const disabledCommandsPath = './databases/disabledCommands.json';
const { checkCommandDisabled } = require('./commands/admin/togglecommand');
let afkData = {};

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

// Recursively load command files from all subfolders
function getAllCommandFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = `${dir}/${file}`;
    if (fs.statSync(filePath).isDirectory()) {
      getAllCommandFiles(filePath, fileList);
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const commandFiles = getAllCommandFiles('./commands');
for (const file of commandFiles) {
  const command = require(file);
  if (command.name && typeof command.execute === 'function') {
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
    // Reload AFK data from file before processing each message

    if (fs.existsSync(afkDataFile)) {

      const data = fs.readFileSync(afkDataFile, 'utf8');
  
      afkData = JSON.parse(data);
  
  }  
  
    
  
  const botPingPath = './databases/botping.json';
  
  let botPingMessages;
  
  
  
  try {
  
      botPingMessages = JSON.parse(fs.readFileSync(botPingPath, 'utf8'));
  
  } catch (error) {
  
      console.error('❌ Error reading botping.json:', error);
  
      return;
  
  }

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