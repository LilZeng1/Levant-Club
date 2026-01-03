// dashboard.js
document.addEventListener('DOMContentLoaded', function () {
    const clientId = '1454693732799611042';
    const redirectUri = 'https://lilzeng1.github.io/Levant/dashboard.html';
    const scope = 'identify guilds guilds.members.read guilds.join';
    const discordApiBase = 'https://discord.com/api';
    const levantGuildId = '1452829028267327511';

    // Function to get access token from URL hash
    function getAccessToken() {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        return params.get('access_token');
    }

    // Function to fetch user info from Discord API
    async function fetchUserInfo(token) {
        const response = await fetch(`${discordApiBase}/users/@me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.json();
    }

    // Function to fetch user's guilds from Discord API
    async function fetchUserGuilds(token) {
        const response = await fetch(`${discordApiBase}/users/@me/guilds`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.json();
    }

    // Function to check if user is in Levant guild
    function isUserInLevantGuild(guilds) {
        return guilds.some(guild => guild.id === levantGuildId);
    }

    // Function to join Levant guild
    async function joinLevantGuild(token) {
        await fetch(`${discordApiBase}/guilds/${levantGuildId}/members/@me`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                access_token: token
            })
        });
    }

    // Main function to handle dashboard logic
    async function initDashboard() {
        const token = getAccessToken();
        if (!token) {
            window.location.href = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}`;
            return;
        }
        const userInfo = await fetchUserInfo(token);
        const userGuilds = await fetchUserGuilds(token);
        const isMember = isUserInLevantGuild(userGuilds);
        document.getElementById('avatar').src = `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}.png`;
        document.getElementById('username').textContent = `${userInfo.username}#${userInfo.discriminator}`;
        document.getElementById('roles').textContent = isMember ? 'Member of Levant Guild' : 'Not a member of Levant Guild';
        if (!isMember) {
            const joinButton = document.getElementById('join-button');
            joinButton.style.display = 'block';
            joinButton.addEventListener('click', async () => {
                await joinLevantGuild(token);
                alert('You have joined the Levant guild!');
                window.location.reload();
            }
            );
        }
    }
    initDashboard();
});
