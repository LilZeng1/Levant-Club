// Dashboard.js

// Variables for Discord OAuth2
const clientId = '1454693732799611042';
const redirectUri = 'https://lilzeng1.github.io/Levant/dashboard.html';
const scope = 'identify guilds guilds.members.read guilds.join';
const discordAuthUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;
const guildId = '1452829028267327511';
const roleId = '1456104633234886666';
const dotenv = require('dotenv').config();

// Function to get the access token from URL hash
function getAccessToken() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    return params.get('access_token');
}

// Function to fetch user info
async function fetchUserInfo(token) {
    const response = await fetch('https://discord.com/api/users/@me', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.json();
}

// Function to fetch guilds the user is in
async function fetchUserGuilds(token) {
    const response = await fetch('https://discord.com/api/users/@me/guilds', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    return response.json();
}

// Function to add role to user in guild
async function addRoleToUser(token, userId) {
    await fetch(`https://discord.com/api/guilds/${guildId}/members/${userId}/roles/${roleId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bot ${process.env.BOT_TOKEN}`
        }
    });
}

// Main function to handle the dashboard logic
async function main() {
    const token = getAccessToken();
    if (!token) {
        window.location.href = discordAuthUrl;
        return;
    }
    const userInfo = await fetchUserInfo(token);
    document.getElementById('user-info').innerText = `Logged in as ${userInfo.username}#${userInfo.discriminator}`;
    const userGuilds = await fetchUserGuilds(token);
    const isInGuild = userGuilds.some(guild => guild.id === guildId);
    if (isInGuild) {
        await addRoleToUser(token, userInfo.id);
        document.getElementById('status').innerText = 'You have been given the Ascendant role in the guild!';
    } else {
        document.getElementById('status').innerText = 'You are not in the guild. Please join the guild first.';
    }
}

// Run the main function on page load
window.onload = main;
