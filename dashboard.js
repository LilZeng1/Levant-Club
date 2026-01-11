// BackendUrl
const BackendUrl = "https://levant-backend.onrender.com";
document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
        await exchangeToken(code);
    } else {
        const token = sessionStorage.getItem('access_token');
        if (!token) window.location.href = 'index.html';
        else initDashboard(token);
    }
});

// exchangeToken()
async function exchangeToken(code) {
    sessionStorage.setItem('access_token', code);
    initDashboard(code);
}

// initDashboard()
async function initDashboard(token) {
    try {
        const res = await fetch(`${BackendUrl}/userinfo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_token: token })
        });
        const data = await res.json();
        if (data.Error) throw new Error(data.Error);
        
        updateUI(data);
        checkLevelUp(data.level);
    } catch (err) {
        console.error("Dashboard Error:", err);
    }
}

// updateUI()
function updateUI(user) {
    document.getElementById('user-display-name').innerText = user.global_name || user.username;
    document.getElementById('user-avatar').src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
    document.getElementById('calculated-level').innerText = user.level || 0;
    
    // Days Joined
    const joined = new Date(user.joinedAt);
    const diff = Math.floor((new Date() - joined) / (1000 * 60 * 60 * 24));
    document.getElementById('joined-on').innerText = diff;
}

// checkLevelUp()
function checkLevelUp(currentLevel) {
    const lastLevel = localStorage.getItem('last_level') || 0;
    if (currentLevel > lastLevel) {
        showLevelPopup(currentLevel);
        localStorage.setItem('last_level', currentLevel);
    }
}

// showLevelPopup()
function showLevelPopup(lvl) {
    const win = document.getElementById('level-popup');
    document.getElementById('popup-text').innerText = `You've reached Level ${lvl}! Cosmic power increases.`;
    win.classList.add('show');
    
    setTimeout(() => closePopup(), 2500);
}

// closePopup()
function closePopup() {
    const win = document.getElementById('level-popup');
    win.classList.add('closing');
    setTimeout(() => {
        win.classList.remove('show', 'closing');
    }, 400);
}
