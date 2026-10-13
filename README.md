# bubblebot

## Prerequisites: 
> You must have `nodejs24` and `npm` installed


## Disclaimer:
> This bot is intended for a limited number of servers and is **not recommended** for widespread deployment. Widespread deployment can severely impact bot performance.
> While this bot was built with individual large servers, maximum customization, and minimal setup in mind, results may vary depending on server size and configuration.

## Installation: 
1. Clone this repository `git clone https://github.com/maazinalthaf/bubblebot/`
2. Open the terminal and cd into the bot directory
3. Rename `example.env` to `.env` and insert your bot token
4. Upload emojis from `/assets` in developer portal and change emoji ids in `/utils/constants.js` 
5. Install dependencies `npm install`
6. Initialize the bot `npm start`
7. Default prefix is `.` which can be changed using `.setprefix <new prefix>` for example `.setprefix ?`

## Data storage and Discord policy

Bubblebot stores its configuration in `data/bubblebot.sqlite`, using SQLite
provided by Node.js 24. The database contains only data required for bot
features: guild settings, triggers, reactions, role configuration, command
toggles, mention permissions, and temporary AFK status. Message history and
Discord profile data are not collected.

On the first startup after upgrading, the bot imports existing JSON
configuration files into SQLite. After confirming the migration succeeded,
the old JSON files can be archived or deleted. They are no longer read or
written by the bot. The SQLite directory is ignored by Git and must be backed
up securely by the operator.

The host filesystem or volume containing `data/bubblebot.sqlite` must use
encryption at rest. SQLite itself is not encrypted by Node.js. Use the hosting
provider's encrypted disk/volume feature, or an encrypted filesystem such as
LUKS on Linux. Restrict the database directory to the bot service account and
encrypt backups; the SQLite WAL and SHM files must be protected too.

The bot deletes guild configuration when it leaves a guild and provides
`.deletedata` for a user to request deletion of their stored data. AFK records
expire after 30 days. Deleted and edited message content used by the
moderation `snipe` and `editsnipe` commands is held only in memory for
15 minutes, is limited to 20 entries per channel, is never captured from
direct messages, and is available only to members with Manage Messages.
`.clearsnipe` removes both moderation caches. An administrator using
`.deletedata` in a server deletes that server's stored configuration and
moderation cache, while a user can use it to delete their own stored data.

The bot uses the privileged Message Content intent because trigger,
reaction, moderation, and command processing inspect message content. Enable
that intent only in the Discord Developer Portal after reviewing and
documenting this use in the privacy policy.

These controls do not replace a privacy policy. Before public deployment,
publish an accurate, up-to-date privacy policy in the Developer Portal and
make it accessible from the bot. The policy must describe what data is
collected, how it is accessed, stored, retained, transmitted, and deleted,
including any hosting provider or other service provider. Maintain an incident
response process for unauthorized access and promptly notify Discord and
affected users as required by applicable law.
