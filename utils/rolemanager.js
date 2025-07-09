const fs = require('fs');
const path = require('path');

const CLAIMABLE_ROLES_FILE = path.join(__dirname, '../../claimableRoles.json');

// Initialize file if it doesn't exist
if (!fs.existsSync(CLAIMABLE_ROLES_FILE)) {
    fs.writeFileSync(CLAIMABLE_ROLES_FILE, JSON.stringify({}, null, 2));
}

function getClaimableRoles(guildId) {
    const data = fs.readFileSync(CLAIMABLE_ROLES_FILE, 'utf8');
    const allRoles = JSON.parse(data);
    return allRoles[guildId] || [];
}

function saveClaimableRoles(guildId, roles) {
    const data = fs.readFileSync(CLAIMABLE_ROLES_FILE, 'utf8');
    const allRoles = JSON.parse(data);
    allRoles[guildId] = roles;
    fs.writeFileSync(CLAIMABLE_ROLES_FILE, JSON.stringify(allRoles, null, 2));
}

function addClaimableRole(guildId, roleId) {
    const roles = getClaimableRoles(guildId);
    if (!roles.includes(roleId)) {
        roles.push(roleId);
        saveClaimableRoles(guildId, roles);
        return true;
    }
    return false;
}

function removeClaimableRole(guildId, roleId) {
    const roles = getClaimableRoles(guildId);
    const index = roles.indexOf(roleId);
    if (index !== -1) {
        roles.splice(index, 1);
        saveClaimableRoles(guildId, roles);
        return true;
    }
    return false;
}

module.exports = {
    getClaimableRoles,
    saveClaimableRoles,
    addClaimableRole,
    removeClaimableRole
};