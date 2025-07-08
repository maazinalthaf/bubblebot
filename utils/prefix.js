const fs = require('fs');
const path = require('path');

const prefixesPath = path.join(__dirname, '../prefixes.json'); 


let prefixCache = {};
let lastUpdated = 0;

function loadPrefixes() {
    try {
        // Only reload if file changed (every 60 seconds max)
        const stats = fs.statSync(prefixesPath);
        if (stats.mtimeMs > lastUpdated) {
            prefixCache = fs.existsSync(prefixesPath) 
                ? JSON.parse(fs.readFileSync(prefixesPath, 'utf8'))
                : {};
            lastUpdated = stats.mtimeMs;
        }
    } catch (error) {
        console.error('[PREFIX] Load error:', error);
        prefixCache = {};
    }
    return prefixCache;
}

module.exports = {
    getPrefix: (guildId) => {
        const prefixes = loadPrefixes();
        return prefixes[guildId] || '.';
    }
};