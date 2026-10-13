const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const dataDirectory = path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDirectory, { recursive: true });

const database = new DatabaseSync(path.join(dataDirectory, 'bubblebot.sqlite'));
const AFK_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
database.exec(`
  PRAGMA foreign_keys = ON;
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS guild_settings (
    guild_id TEXT PRIMARY KEY,
    prefix TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS triggers (
    guild_id TEXT NOT NULL,
    trigger TEXT NOT NULL,
    response TEXT NOT NULL,
    PRIMARY KEY (guild_id, trigger)
  );
  CREATE TABLE IF NOT EXISTS reactions (
    guild_id TEXT NOT NULL,
    word TEXT NOT NULL,
    emoji TEXT NOT NULL,
    PRIMARY KEY (guild_id, word, emoji)
  );
  CREATE TABLE IF NOT EXISTS afk_status (
    user_id TEXT PRIMARY KEY,
    message TEXT,
    timestamp INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS disabled_commands (
    guild_id TEXT NOT NULL,
    command_name TEXT NOT NULL,
    PRIMARY KEY (guild_id, command_name)
  );
  CREATE TABLE IF NOT EXISTS claimable_roles (
    guild_id TEXT NOT NULL,
    role_id TEXT NOT NULL,
    PRIMARY KEY (guild_id, role_id)
  );
  CREATE TABLE IF NOT EXISTS mention_permissions (
    guild_id TEXT NOT NULL,
    role_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    PRIMARY KEY (guild_id, role_id, user_id)
  );
`);



//  Legacy  Data Migration (remove after migration is complete)
function readLegacyJson(fileName) {
  const filePath = path.join(__dirname, '..', fileName);
  if (!fs.existsSync(filePath)) return {};

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`Unable to migrate ${fileName}: ${error.message}`);
  }
}

// Migrate legacy JSON data to SQLite database  (remove after migration is complete)
function migrateLegacyData() {
  database.exec('CREATE TABLE IF NOT EXISTS migration_state (key TEXT PRIMARY KEY, value TEXT NOT NULL)');
  const importData = database.prepare('SELECT value FROM migration_state WHERE key = ?');
  if (importData.get('json-imported')) return;

  const transaction = database.prepare('INSERT OR IGNORE INTO guild_settings (guild_id, prefix) VALUES (?, ?)');
  for (const [guildId, prefix] of Object.entries(readLegacyJson('prefixes.json'))) {
    transaction.run(guildId, prefix);
  }

  const triggerInsert = database.prepare('INSERT OR IGNORE INTO triggers (guild_id, trigger, response) VALUES (?, ?, ?)');
  for (const [guildId, guildTriggers] of Object.entries(readLegacyJson('triggers.json'))) {
    for (const [trigger, response] of Object.entries(guildTriggers)) {
      triggerInsert.run(guildId, trigger, response);
    }
  }

  const reactionInsert = database.prepare('INSERT OR IGNORE INTO reactions (guild_id, word, emoji) VALUES (?, ?, ?)');
  for (const [guildId, guildReactions] of Object.entries(readLegacyJson('reactions.json'))) {
    for (const [word, emojis] of Object.entries(guildReactions)) {
      for (const emoji of emojis) reactionInsert.run(guildId, word, emoji);
    }
  }

  const afkInsert = database.prepare('INSERT OR IGNORE INTO afk_status (user_id, message, timestamp) VALUES (?, ?, ?)');
  for (const [userId, status] of Object.entries(readLegacyJson('afkData.json'))) {
    afkInsert.run(userId, status.afkMessage || null, status.timestamp);
  }

  const disabledInsert = database.prepare('INSERT OR IGNORE INTO disabled_commands (guild_id, command_name) VALUES (?, ?)');
  for (const [guildId, commands] of Object.entries(readLegacyJson('disabledCommands.json'))) {
    for (const command of commands) disabledInsert.run(guildId, command);
  }

  const rolesInsert = database.prepare('INSERT OR IGNORE INTO claimable_roles (guild_id, role_id) VALUES (?, ?)');
  for (const [guildId, roles] of Object.entries(readLegacyJson('claimableRoles.json'))) {
    for (const roleId of roles) rolesInsert.run(guildId, roleId);
  }

  const mentionInsert = database.prepare('INSERT OR IGNORE INTO mention_permissions (guild_id, role_id, user_id) VALUES (?, ?, ?)');
  for (const [guildId, roles] of Object.entries(readLegacyJson('mentionData.json'))) {
    for (const [roleId, users] of Object.entries(roles)) {
      for (const userId of users) mentionInsert.run(guildId, roleId, userId);
    }
  }

  database.prepare('INSERT INTO migration_state (key, value) VALUES (?, ?)').run('json-imported', new Date().toISOString());
}

migrateLegacyData();


//  Database Access Functions 
function getPrefix(guildId) {
  return database.prepare('SELECT prefix FROM guild_settings WHERE guild_id = ?').get(guildId)?.prefix || '.';
}

function setPrefix(guildId, prefix) {
  database.prepare(`
    INSERT INTO guild_settings (guild_id, prefix) VALUES (?, ?)
    ON CONFLICT(guild_id) DO UPDATE SET prefix = excluded.prefix
  `).run(guildId, prefix);
}

function getTriggers() {
  const result = {};
  for (const row of database.prepare('SELECT guild_id, trigger, response FROM triggers').all()) {
    (result[row.guild_id] ||= {})[row.trigger] = row.response;
  }
  return result;
}

function setTrigger(guildId, trigger, response) {
  database.prepare(`
    INSERT INTO triggers (guild_id, trigger, response) VALUES (?, ?, ?)
    ON CONFLICT(guild_id, trigger) DO UPDATE SET response = excluded.response
  `).run(guildId, trigger, response);
}

function deleteTrigger(guildId, trigger) {
  database.prepare('DELETE FROM triggers WHERE guild_id = ? AND trigger = ?').run(guildId, trigger);
}

function getReactions() {
  const result = {};
  for (const row of database.prepare('SELECT guild_id, word, emoji FROM reactions ORDER BY rowid').all()) {
    ((result[row.guild_id] ||= {})[row.word] ||= []).push(row.emoji);
  }
  return result;
}

function setReaction(guildId, word, emojis) {
  database.prepare('DELETE FROM reactions WHERE guild_id = ? AND word = ?').run(guildId, word);
  const insert = database.prepare('INSERT INTO reactions (guild_id, word, emoji) VALUES (?, ?, ?)');
  for (const emoji of emojis) insert.run(guildId, word, emoji);
}

function deleteReaction(guildId, word) {
  database.prepare('DELETE FROM reactions WHERE guild_id = ? AND word = ?').run(guildId, word);
}

function getAfk(userId) {
  const status = database.prepare('SELECT message AS afkMessage, timestamp FROM afk_status WHERE user_id = ?').get(userId);
  if (status && Date.now() - status.timestamp > AFK_RETENTION_MS) {
    deleteAfk(userId);
    return undefined;
  }
  return status;
}

function setAfk(userId, afkMessage, timestamp = Date.now()) {
  database.prepare(`
    INSERT INTO afk_status (user_id, message, timestamp) VALUES (?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET message = excluded.message, timestamp = excluded.timestamp
  `).run(userId, afkMessage || null, timestamp);
}

function deleteAfk(userId) {
  database.prepare('DELETE FROM afk_status WHERE user_id = ?').run(userId);
}

function getDisabledCommands() {
  const result = {};
  for (const row of database.prepare('SELECT guild_id, command_name FROM disabled_commands').all()) {
    (result[row.guild_id] ||= []).push(row.command_name);
  }
  return result;
}

function setDisabledCommands(guildId, commands) {
  database.prepare('DELETE FROM disabled_commands WHERE guild_id = ?').run(guildId);
  const insert = database.prepare('INSERT INTO disabled_commands (guild_id, command_name) VALUES (?, ?)');
  for (const command of commands) insert.run(guildId, command);
}

function getClaimableRoles(guildId) {
  return database.prepare('SELECT role_id FROM claimable_roles WHERE guild_id = ? ORDER BY rowid')
    .all(guildId).map(row => row.role_id);
}

function setClaimableRoles(guildId, roles) {
  database.prepare('DELETE FROM claimable_roles WHERE guild_id = ?').run(guildId);
  const insert = database.prepare('INSERT INTO claimable_roles (guild_id, role_id) VALUES (?, ?)');
  for (const roleId of roles) insert.run(guildId, roleId);
}

function getMentionPermissions(guildId) {
  const result = {};
  for (const row of database.prepare('SELECT role_id, user_id FROM mention_permissions WHERE guild_id = ?').all(guildId)) {
    (result[row.role_id] ||= []).push(row.user_id);
  }
  return result;
}

function setMentionPermissions(guildId, permissions) {
  database.prepare('DELETE FROM mention_permissions WHERE guild_id = ?').run(guildId);
  const insert = database.prepare('INSERT INTO mention_permissions (guild_id, role_id, user_id) VALUES (?, ?, ?)');
  for (const [roleId, users] of Object.entries(permissions)) {
    for (const userId of users) insert.run(guildId, roleId, userId);
  }
}

function deleteGuildData(guildId) {
  try {
    database.exec('BEGIN');
    for (const table of ['guild_settings', 'triggers', 'reactions', 'disabled_commands', 'claimable_roles', 'mention_permissions']) {
      database.prepare(`DELETE FROM ${table} WHERE guild_id = ?`).run(guildId);
    }
    database.exec('COMMIT');
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
}

function deleteUserData(userId) {
  database.prepare('DELETE FROM afk_status WHERE user_id = ?').run(userId);
  database.prepare('DELETE FROM mention_permissions WHERE user_id = ?').run(userId);
}

module.exports = {
  getPrefix, setPrefix,
  getTriggers, setTrigger, deleteTrigger,
  getReactions, setReaction, deleteReaction,
  getAfk, setAfk, deleteAfk,
  getDisabledCommands, setDisabledCommands,
  getClaimableRoles, setClaimableRoles,
  getMentionPermissions, setMentionPermissions,
  deleteGuildData, deleteUserData
};
