// BackendUrl
const BackendUrl = "https://levant-backend.onrender.com";
let CurrentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const storedToken = sessionStorage.getItem('access_token');

    if (code) {
        window.history.replaceState({}, document.title, "/dashboard.html");
        await fetchData({ code: code });
    } 
    else if (storedToken) {
        await fetchData({ access_token: storedToken });
    } 
    else {
        window.location.href = 'index.html';
    }
});

// Main Data Fetch
async function fetchData(payload) {
    const loadingScreen = document.getElementById('loading-screen');
    
    try {
        const res = await fetch(`${BackendUrl}/userinfo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // Handle 401 (Unauthorized)
        if (res.status === 401) {
            console.error("Session expired or invalid token.");
            sessionStorage.clear();
            window.location.href = 'index.html';
            return;
        }

        const data = await res.json();
        if (data.Error) throw new Error(data.Error);

        // Save new token if provided
        if (data.new_access_token) {
            sessionStorage.setItem('access_token', data.new_access_token);
        }

        CurrentUser = data;
        updateUI(data);
        checkLevelUp(data.level);

    } catch (err) {
        console.error("Dashboard Error:", err);
    } finally {
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => loadingScreen.remove(), 500);
        }
    }
}

function updateUI(user) {
    // Identity
    const displayName = user.global_name || user.username;
    document.getElementById('user-display-name').innerText = displayName;
    document.getElementById('nav-user-name').innerText = user.username;
    
    // Avatar
    const avatarUrl = user.avatar 
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` 
        : `https://cdn.discordapp.com/embed/avatars/0.png`;
    document.getElementById('user-avatar').src = avatarUrl;
    document.getElementById('nav-avatar').src = avatarUrl;
    
    // Stats
    document.getElementById('calculated-level').innerText = user.level || 1;
    
    const joined = new Date(user.joinedAt);
    const now = new Date();
    const diffDays = Math.ceil(Math.abs(now - joined) / (1000 * 60 * 60 * 24)); 
    document.getElementById('joined-on').innerText = diffDays;

    // Prefill settings
    if(user.guildNickname) {
        document.getElementById('nickname-input').value = user.guildNickname;
    }
}

// Tabs Logic
window.switchTab = function(tabName, element) {
    // Update Sidebar
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    element.classList.add('active');

    // Hide all views
    document.querySelectorAll('.content-view').forEach(el => el.style.display = 'none');

    // Show target view
    const target = document.getElementById(`view-${tabName}`);
    if(target) {
        target.style.display = 'block';
        // Fade in effect
        target.style.opacity = '0';
        setTimeout(() => target.style.opacity = '1', 50);
    }
}

// SETTINGS ACTIONS
window.changeNickname = async function() {
    const newNick = document.getElementById('nickname-input').value;
    if (!newNick || !CurrentUser) return;

    try {
        const res = await fetch(`${BackendUrl}/change-nickname`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                access_token: sessionStorage.getItem('access_token'),
                discordId: CurrentUser.id,
                newNickname: newNick
            })
        });

        if (res.ok) alert('Nickname updated!');
        else alert('Failed. Bot may lack permissions.');
    } catch (e) { console.error(e); }
}

window.deleteData = async function() {
    if (!confirm("Are you sure? This deletes your Level/XP forever.")) return;

    try {
        const res = await fetch(`${BackendUrl}/delete-data`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                access_token: sessionStorage.getItem('access_token'),
                discordId: CurrentUser.id
            })
        });

        if (res.ok) {
            alert('Data deleted.');
            logout();
        }
    } catch (e) { console.error(e); }
}

// UTILS
function checkLevelUp(currentLevel) {
    const lastLevel = localStorage.getItem('last_level');
    if (lastLevel && parseInt(currentLevel) > parseInt(lastLevel)) {
        showLevelPopup(currentLevel);
    }
    localStorage.setItem('last_level', currentLevel);
}

function showLevelPopup(lvl) {
    const win = document.getElementById('level-popup');
    document.getElementById('popup-text').innerText = `You have ascended to Level ${lvl}.`;
    win.style.display = 'flex';
    void win.offsetWidth; 
    win.classList.add('active');
    setTimeout(() => closePopup(), 4000);
}

function closePopup() {
    const win = document.getElementById('level-popup');
    win.classList.remove('active');
    win.classList.add('closing');
    setTimeout(() => {
        win.style.display = 'none';
        win.classList.remove('closing');
    }, 500);
}

window.logout = function() {
    sessionStorage.clear();
    window.location.href = 'index.html';
}
