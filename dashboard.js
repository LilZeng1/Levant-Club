// BackendURL
const BackendUrl = "https://levant-backend.onrender.com";

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const token = localStorage.getItem('access_token');

    if (code) {
        await handleLogin(code);
    } else if (token) {
        await fetchUserData(token);
    } else {
        window.location.href = 'index.html';
    }
});

async function handleLogin(code) {
    try {
        const res = await fetch(`${BackendUrl}/userinfo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
        });
        const data = await res.json();
        
        if (data.access_token) {
            localStorage.setItem('access_token', data.access_token);
            window.history.replaceState({}, document.title, "/dashboard.html");
            updateUI(data);
        }
    } catch (err) {
        showToast("Login Failed", "error");
    }
}

function updateUI(user) {
    document.getElementById('loading-screen').style.opacity = '0';
    setTimeout(() => document.getElementById('loading-screen').style.display = 'none', 500);

    document.getElementById('nav-user-name').innerText = user.username;
    document.getElementById('user-display-name').innerText = user.username;
    document.getElementById('nav-avatar').src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
    document.getElementById('user-avatar').src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
    document.getElementById('calculated-level').innerText = user.level || 1;
}

function switchTab(tabId, el) {
    document.querySelectorAll('.content-view').forEach(v => v.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    
    document.getElementById(`view-${tabId}`).style.display = 'block';
    el.classList.add('active');
    
    if(tabId === 'leaderboard') loadLeaderboard();
}

async function loadLeaderboard() {
    const res = await fetch(`${BackendUrl}/leaderboard`);
    const data = await res.json();
    const container = document.querySelector('#view-leaderboard .card');
    
    let html = '<table style="width:100%; text-align:left;"><tr><th>User</th><th>XP</th><th>Level</th></tr>';
    data.forEach(u => {
        html += `<tr><td>${u.username}</td><td>${u.xp}</td><td>${u.level}</td></tr>`;
    });
    container.innerHTML = html + '</table>';
}

function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'mac-popup active';
    toast.innerHTML = `<div class="popup-body"><h3>${msg}</h3></div>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}
