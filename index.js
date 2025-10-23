require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Collection, Partials, PresenceUpdateStatus, ActivityType } = require('discord.js');
const fs = require('fs');
const { performance } = require('perf_hooks');
const { snipes } = require('./commands/Moderation/snipe.js');
const { editsnipes } = require('./commands/Moderation/editsnipe.js');
const triggersPath = './triggers.json';
const afkDataFile = './afkData.json';
const prefixesPath = './prefixes.json';
const wordStatsPath = './wordStats.json';
const disabledCommandsManager = require('./utils/disabledCommandsManager');
const {embed_color, emojis, red, green, yellow } = require('./utils/constants');


let prefixes = {};
let afkData = {};
let triggers = {};
let reactions = {};
let wordStats = {};

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

try {
  if (fs.existsSync(prefixesPath)) {
    prefixes = JSON.parse(fs.readFileSync(prefixesPath, 'utf8'));
  } else {
    fs.writeFileSync(prefixesPath, JSON.stringify({}, null, 2));
  }
} catch (error) {
  console.error('Error loading prefixes:', error);
}

// Load word statistics
try {
  if (fs.existsSync(wordStatsPath)) {
    wordStats = JSON.parse(fs.readFileSync(wordStatsPath, 'utf8'));
  } else {
    fs.writeFileSync(wordStatsPath, JSON.stringify({}, null, 2));
  }
} catch (error) {
  console.error('Error loading word stats:', error);
}

// Create new client
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers, GatewayIntentBits.DirectMessages,GatewayIntentBits.GuildVoiceStates],
    partials: [
      Partials.Channel,
      Partials.Message,
      Partials.User,
      Partials.GuildMember,
      Partials.Reaction,
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

function getPrefix(guildId) {
  // Reload prefixes from file each time
  try {
    if (fs.existsSync(prefixesPath)) {
      prefixes = JSON.parse(fs.readFileSync(prefixesPath, 'utf8'));
    }
  } catch (error) {
    console.error('Error reloading prefixes:', error);
  }
  
  return prefixes[guildId] || '.';
}

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

// Command Manager for hot-reloading
client.commandManager = {
  loadCommand: (filePath) => {
    try {
      delete require.cache[require.resolve(filePath)];
      const command = require(filePath);
      client.commands.set(command.name, command);
      return { success: true, message: `Command '${command.name}' loaded successfully.` };
    } catch (error) {
      return { success: false, message: `Error loading command: ${error.message}` };
    }
  },

  reloadCommand: (commandName) => {
    const command = client.commands.get(commandName);
    if (!command) {
      return { success: false, message: `Command '${commandName}' not found.` };
    }

    const commandFiles = getAllCommandFiles('./commands');
    let filePath = null;

    for (const file of commandFiles) {
      try {
        delete require.cache[require.resolve(file)];
        const cmd = require(file);
        if (cmd.name === commandName) {
          filePath = file;
          break;
        }
      } catch (error) {
        continue;
      }
    }

    if (!filePath) {
      return { success: false, message: `Could not locate file for command '${commandName}'.` };
    }

    return client.commandManager.loadCommand(filePath);
  },

  reloadAll: () => {
    try {
      const commandFiles = getAllCommandFiles('./commands');
      let loadedCount = 0;
      const errors = [];

      for (const file of commandFiles) {
        try {
          delete require.cache[require.resolve(file)];
          const command = require(file);
          if (command.name) {
            client.commands.set(command.name, command);
            loadedCount++;
          }
        } catch (error) {
          errors.push(`${file}: ${error.message}`);
        }
      }

      return {
        success: true,
        loaded: loadedCount,
        errors: errors.length > 0 ? errors : null,
        message: `Reloaded ${loadedCount} commands${errors.length > 0 ? ` with ${errors.length} errors` : ''}.`
      };
    } catch (error) {
      return { success: false, message: `Error reloading commands: ${error.message}` };
    }
  }
};

// Load initial commands
function loadInitialCommands() {
  const commandFiles = getAllCommandFiles('./commands');
  let count = 0;
  for (const file of commandFiles) {
    try {
      delete require.cache[require.resolve(file)];
      const command = require(file);
      if (command.name) {
        client.commands.set(command.name, command);
        count++;
      }
    } catch (error) {
      console.error(`Error loading command from ${file}:`, error);
    }
  }
  return count;
}

// Bot online confirmation message - FIXED EVENT NAME
client.on('clientReady', () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setPresence({ 
    activities: [{ 
      name: '.help', 
      type: ActivityType.Playing 
    }], 
    status: PresenceUpdateStatus.DoNotDisturb 
  });

  startTime = new Date();
  
  // Load all commands on bot startup
  const loadedCount = loadInitialCommands();
  console.log(`Loaded ${loadedCount} commands`);
});

// Word tracking function
function trackWords(message) {
  if (!message.guild || message.author.bot) return;
  
  const guildId = message.guild.id;
  let content = message.content.toLowerCase().trim();
  
  // Skip commands and very short messages
  if (content.startsWith(getPrefix(guildId))) return;
  if (content.length < 3) return;
  
  // Remove user mentions (@username, @123456789)
  content = content.replace(/<@!?\d+>/g, '');
  
  // Remove role mentions (@role)
  content = content.replace(/<@&\d+>/g, '');
  
  // Remove channel mentions (#channel)
  content = content.replace(/<#\d+>/g, '');
  
  // Remove everyone and here mentions
  content = content.replace(/@everyone/g, '');
  content = content.replace(/@here/g, '');
  
  // Trim again after removing mentions
  content = content.trim();
  
  if (content.length < 3) return;
  
  // Common words to exclude
  const excludedWords = new Set([
    'the', 'and', 'you', 'for', 'are', 'but', 'not', 'your', 'all', 'can', 
    'her', 'was', 'one', 'our', 'out', 'who', 'get', 'has', 'him', 'how', 
    'its', 'let', 'put', 'say', 'she', 'too', 'use', 'that', 'with', 'this',
    'have', 'will', 'would', 'could', 'should', 'what', 'when', 'where', 'why',
    'which', 'there', 'their', 'they', 'them', 'then', 'than', 'from', 'were',
    'been', 'being', 'some', 'such', 'than', 'just', 'like', 'more', 'most',
    'also', 'only', 'very', 'well', 'even', 'back', 'much', 'any', 'now', 'way'
  ]);
  
  // Extract words (alphanumeric characters only, minimum 3 characters)
  const words = content.split(/\s+/)
    .map(word => word.replace(/[^a-z0-9]/g, ''))
    .filter(word => word.length >= 3 && !excludedWords.has(word));
  
  if (words.length === 0) return;
  
  // Initialize guild word stats if not exists
  if (!wordStats[guildId]) {
    wordStats[guildId] = {
      wordCounts: {},
      userWordCounts: {}
    };
  }
  
  // Ensure userWordCounts structure exists
  if (!wordStats[guildId].userWordCounts) {
    wordStats[guildId].userWordCounts = {};
  }
  
  const userId = message.author.id;
  
  // Update word counts
  words.forEach(word => {
    // Update overall word counts
    if (!wordStats[guildId].wordCounts[word]) {
      wordStats[guildId].wordCounts[word] = 0;
    }
    wordStats[guildId].wordCounts[word]++;
    
    // Update user-specific word counts
    if (!wordStats[guildId].userWordCounts[word]) {
      wordStats[guildId].userWordCounts[word] = {};
    }
    
    if (!wordStats[guildId].userWordCounts[word][userId]) {
      wordStats[guildId].userWordCounts[word][userId] = 0;
    }
    wordStats[guildId].userWordCounts[word][userId]++;
  });
  
  // Save to file
  saveWordStats();
}

// Function to get top words for a guild
function getTopWords(guildId, limit = 10) {
  if (!wordStats[guildId] || !wordStats[guildId].wordCounts) {
    return [];
  }
  
  const words = Object.entries(wordStats[guildId].wordCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
    .map(([word, count], index) => ({ rank: index + 1, word, count }));
  
  return words;
}

// Function to get top users for a specific word
function getTopUsersForWord(guildId, word, limit = 10) {
  if (!wordStats[guildId] || 
      !wordStats[guildId].userWordCounts || 
      !wordStats[guildId].userWordCounts[word]) {
    return [];
  }
  
  const userCounts = wordStats[guildId].userWordCounts[word];
  const topUsers = Object.entries(userCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
    .map(([userId, count], index) => ({ rank: index + 1, userId, count }));
  
  return topUsers;
}

// Function to reset word stats for a guild
function resetWordStats(guildId) {
  if (wordStats[guildId]) {
    delete wordStats[guildId];
    saveWordStats();
    return true;
  }
  return false;
}


// Checks for new messages sent
client.on('messageCreate', async (message) => {
    // Reload AFK data from file before processing each message
    if (fs.existsSync(afkDataFile)) {
      const data = fs.readFileSync(afkDataFile, 'utf8');
      afkData = JSON.parse(data);
    }  
   
    // Skip if message is from a bot or not in a guild
    if (message.author.bot || !message.guild) return;

    // Track words for statistics
    trackWords(message);

    // Get the prefix for this server at the start
    const prefix = getPrefix(message.guild?.id);
 
    // When afk user comes back from afk status
    if (afkData[message.author.id]) {
      const { timestamp } = afkData[message.author.id];
      const timeSinceAfk = Date.now() - timestamp;
      delete afkData[message.author.id];
      const embed = new EmbedBuilder()
        .setColor('ffcc32')
        .setDescription(`👋 **${message.author}**: Welcome back, you were AFK for **${msToTime(timeSinceAfk)}**.`);
      message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
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
    if (!message.content.startsWith(prefix)) {
      const serverTriggers = triggers[message.guild.id] || {};
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
    if (!message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Retrieve the command or an alias
    const command = client.commands.get(commandName) 
      || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (command) {
      // Check if command is disabled in this server
      if (message.guild && disabledCommandsManager.checkCommandDisabled(message.guild.id, command.name)) {
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

    if (channelEditsnipes.length > 20) channelEditsnipes.pop();
    editsnipes.set(oldMessage.channel.id, channelEditsnipes);
  }
});

client.login(process.env.token);

// Other Functions //

// ms to time converter
function msToTime(duration) {
  if (Math.abs(duration) < 1000) {
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

// Save word statistics function
function saveWordStats() {
  fs.writeFileSync(wordStatsPath, JSON.stringify(wordStats, null, 2), 'utf8');
}
