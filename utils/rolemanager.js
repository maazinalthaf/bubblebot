const database = require('./database');

function getClaimableRoles(guildId) {
    return database.getClaimableRoles(guildId);
}

function saveClaimableRoles(guildId, roles) {
    database.setClaimableRoles(guildId, roles);
}

function addClaimableRole(guildId, roleId) {
    const roles = getClaimableRoles(guildId);
    if (roles.includes(roleId)) return false;
    saveClaimableRoles(guildId, [...roles, roleId]);
    return true;
}

function removeClaimableRole(guildId, roleId) {
    const roles = getClaimableRoles(guildId);
    if (!roles.includes(roleId)) return false;
    saveClaimableRoles(guildId, roles.filter(id => id !== roleId));
    return true;
}

module.exports = {
    getClaimableRoles,
    saveClaimableRoles,
    addClaimableRole,
    removeClaimableRole
};
