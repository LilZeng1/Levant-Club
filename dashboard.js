const BackendUrl = "https://levant-backend.onrender.com";

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const token = localStorage.getItem('access_token');

    if (code) {
        await handleLogin(code);
    } else if (token) {
        await syncSession(token);
    } else {
        console.warn("No token or code found, redirecting...");
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
        
        if (!res.ok) throw new Error("Backend Error");
        
        const data = await res.json();
        
        if (data.id && data.access_token) {
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('user_data', JSON.stringify(data));
            window.history.replaceState({}, document.title, window.location.pathname);
            updateUI(data);
        } else {
            logout();
        }
    } catch (err) {
        console.error("Login Error:", err);
        logout();
    }
}

async function syncSession(token) {
    const cachedData = localStorage.getItem('user_data');
    if (cachedData) {
        try {
            const user = JSON.parse(cachedData);
            updateUI(user);
        } catch (e) {
            logout();
        }
    } else {
        logout();
    }
}

function updateUI(user) {
    const loader = document.getElementById('loading-screen');
    if(loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 500);
    }

    const navName = document.getElementById('nav-user-name');
    const displayName = document.getElementById('user-display-name');
    const navAvatar = document.getElementById('nav-avatar');
    const userAvatar = document.getElementById('user-avatar');
    const levelEl = document.getElementById('calculated-level');

    if(navName) navName.innerText = user.global_name || user.username;
    if(displayName) displayName.innerText = user.global_name || user.username;
    
    const avatarUrl = user.avatar 
        ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
        : `https://cdn.discordapp.com/embed/avatars/0.png`;
        
    if(navAvatar) navAvatar.src = avatarUrl;
    if(userAvatar) userAvatar.src = avatarUrl;
    if(levelEl) levelEl.innerText = user.level || 1;
}

function logout() {
    localStorage.clear();
    window.location.href = 'index.html';
}
