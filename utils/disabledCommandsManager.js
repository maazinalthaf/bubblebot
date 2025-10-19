const fs = require('fs');
const path = require('path');

const disabledCommandsPath = path.join(__dirname, '../disabledCommands.json');

// Load or initialize disabled commands
let disabledCommands = {};
try {
  if (fs.existsSync(disabledCommandsPath)) {
    const data = fs.readFileSync(disabledCommandsPath, 'utf8');
    disabledCommands = JSON.parse(data);
  } else {
    fs.writeFileSync(disabledCommandsPath, JSON.stringify({}, null, 2));
  }
} catch (error) {
  console.error('Error loading disabled commands:', error);
}

function checkCommandDisabled(guildId, commandName) {
  if (!disabledCommands[guildId]) return false;
  return disabledCommands[guildId].includes(commandName);
}

function reloadDisabledCommands() {
  try {
    if (fs.existsSync(disabledCommandsPath)) {
      const data = fs.readFileSync(disabledCommandsPath, 'utf8');
      disabledCommands = JSON.parse(data);
      return true;
    }
  } catch (error) {
    console.error('Error reloading disabled commands:', error);
  }
  return false;
}

function saveDisabledCommands() {
  try {
    fs.writeFileSync(disabledCommandsPath, JSON.stringify(disabledCommands, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving disabled commands:', error);
    return false;
  }
}

module.exports = {
  checkCommandDisabled,
  reloadDisabledCommands,
  saveDisabledCommands,
  disabledCommands
};