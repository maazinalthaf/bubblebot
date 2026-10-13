require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Collection, Partials, PresenceUpdateStatus, ActivityType } = require('discord.js');
const fs = require('fs');
const { performance } = require('perf_hooks');
const database = require('./utils/database');
const disabledCommandsManager = require('./utils/disabledCommandsManager');
const {embed_color, emojis, red, green, yellow } = require('./utils/constants');


let triggers = database.getTriggers();
let reactions = database.getReactions();

const snipes = new Map();
const editsnipes = new Map();
const SNIPE_RETENTION_MS = 15 * 60 * 1000;
const MAX_SNIPE_ENTRIES_PER_CHANNEL = 20;

// Create new client
const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages
    ],
    partials: [
      Partials.Channel,
      Partials.Message,
      Partials.User,
      Partials.GuildMember,
      Partials.Reaction,
  ]
});

client.commands = new Collection(); 
client.snipes = snipes;
client.editsnipes = editsnipes;
client.snipeRetentionMs = SNIPE_RETENTION_MS;

function clearSnipeEntries(predicate) {
  for (const [channelId, entries] of snipes) {
    const remaining = entries.filter(entry => !predicate(entry));
    if (remaining.length === 0) snipes.delete(channelId);
    else snipes.set(channelId, remaining);
  }
  for (const [channelId, entries] of editsnipes) {
    const remaining = entries.filter(entry => !predicate(entry));
    if (remaining.length === 0) editsnipes.delete(channelId);
    else editsnipes.set(channelId, remaining);
  }
}

function clearExpiredSnipes() {
  const cutoff = Date.now() - SNIPE_RETENTION_MS;
  clearSnipeEntries(entry => entry.createdAt < cutoff || entry.editedAt < cutoff);
}

client.clearUserSnipeData = (userId) => {
  clearSnipeEntries(entry => entry.authorId === userId);
};

client.clearGuildSnipeData = (guildId) => {
  clearSnipeEntries(entry => entry.guildId === guildId);
};

setInterval(clearExpiredSnipes, 60 * 1000).unref();

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
  return database.getPrefix(guildId);
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

client.on('guildDelete', (guild) => {
  try {
    database.deleteGuildData(guild.id);
    client.clearGuildSnipeData(guild.id);
    console.log(`Deleted stored data for guild ${guild.id}`);
  } catch (error) {
    console.error(`Failed to delete stored data for guild ${guild.id}:`, error);
  }
});


// Checks for new messages sent
client.on('messageCreate', async (message) => {
    // Skip if message is from a bot or not in a guild
    if (message.author.bot || !message.guild) return;

    // Check link filter first
    try {
      const linkFilter = client.commands.get('linkfilter');
      if (linkFilter && linkFilter.checkMessage) {
        await linkFilter.checkMessage(message);
      }
    } catch (error) {
      console.error('Error checking link filter:', error);
    }


    // Get the prefix for this server at the start
    const prefix = getPrefix(message.guild?.id);
 
    // When afk user comes back from afk status
    const authorAfk = database.getAfk(message.author.id);
    if (authorAfk) {
      const { timestamp } = authorAfk;
      const timeSinceAfk = Date.now() - timestamp;
      database.deleteAfk(message.author.id);
      const embed = new EmbedBuilder()
        .setColor('ffcc32')
        .setDescription(`👋 **${message.author}**: Welcome back, you were AFK for **${msToTime(timeSinceAfk)}**.`);
      message.reply({ embeds: [embed], allowedMentions: {repliedUser: false} });
    }

    const mentionedUser = message.mentions.users.first();

    // Displays afk user status
    const mentionedUserAfk = mentionedUser && database.getAfk(mentionedUser.id);
    if (mentionedUserAfk) {
      const { afkMessage, timestamp } = mentionedUserAfk;
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
  if (!message.partial && message.guild && !message.author?.bot) {
    clearExpiredSnipes();
    const attachment = message.attachments.first()?.url || null;
    const channelSnipes = snipes.get(message.channel.id) || [];
    channelSnipes.unshift({
      guildId: message.guild.id,
      channelId: message.channel.id,
      messageId: message.id,
      authorId: message.author.id,
      content: message.content,
      createdAt: message.createdTimestamp,
      attachment,
    });

    if (channelSnipes.length > MAX_SNIPE_ENTRIES_PER_CHANNEL) channelSnipes.pop();
    snipes.set(message.channel.id, channelSnipes);
  }
});

// Message Update Listner
client.on('messageUpdate', (oldMessage, newMessage) => {
  if (!oldMessage.partial && !newMessage.partial && oldMessage.guild && !oldMessage.author?.bot) {
    if (oldMessage.content === newMessage.content) return;
    clearExpiredSnipes();
    const channelEditsnipes = editsnipes.get(oldMessage.channel.id) || [];
    channelEditsnipes.unshift({
      guildId: oldMessage.guild.id,
      channelId: oldMessage.channel.id,
      messageId: oldMessage.id,
      authorId: oldMessage.author.id,
      oldContent: oldMessage.content,
      newContent: newMessage.content,
      editedAt: newMessage.editedTimestamp,
    });

    if (channelEditsnipes.length > MAX_SNIPE_ENTRIES_PER_CHANNEL) channelEditsnipes.pop();
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
