const database = require('./database');

const manager = {
  checkCommandDisabled(guildId, commandName) {
    return database.getDisabledCommands()[guildId]?.includes(commandName) || false;
  },

  reloadDisabledCommands() {
    return true;
  },

  saveDisabledCommands() {
    for (const [guildId, commands] of Object.entries(manager.disabledCommands)) {
      database.setDisabledCommands(guildId, commands);
    }
    return true;
  }
};

Object.defineProperty(manager, 'disabledCommands', {
  enumerable: true,
  get: () => database.getDisabledCommands()
});

module.exports = manager;
