const API_BASE_URL = "https://levant-backend.onrender.com";

window.onload = async () => {
    const loadingScreen = document.getElementById('loading-screen');
    const urlParams = new URLSearchParams(window.location.search);
    let userId = urlParams.get('uid');
    let userName = urlParams.get('name');
    let userAvatarHash = urlParams.get('avatar');

    if (!userId) {
        userId = localStorage.getItem('levant_uid');
        userName = localStorage.getItem('levant_name');
        userAvatarHash = localStorage.getItem('levant_av');
        if (!userId) { window.location.href = '../index.html'; return; }
    } else {
        localStorage.setItem('levant_uid', userId);
        localStorage.setItem('levant_name', userName);
        localStorage.setItem('levant_av', userAvatarHash);
        window.history.replaceState({}, document.title, "dashboard.html");
    }

    updateUI(userName, userId, userAvatarHash);
    await fetchStats(userId);

    setTimeout(() => {
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => loadingScreen.style.display = 'none', 800);
        }
    }, 1200);
};

function updateUI(name, uid, avatarHash) {
    const avatarUrl = avatarHash && avatarHash !== 'null'
        ? `https://cdn.discordapp.com/avatars/${uid}/${avatarHash}.png`
        : 'https://cdn.discordapp.com/embed/avatars/0.png';

    const setEl = (id, val, attr = 'innerText') => {
        const el = document.getElementById(id);
        if (el) el[attr] = val;
    };

    setEl('nav-user-name', name);
    setEl('user-display-name', name);
    setEl('nav-avatar', avatarUrl, 'src');
    setEl('user-avatar', avatarUrl, 'src');
}

async function fetchStats(uid) {
    try {
        const res = await fetch(`${API_BASE_URL}/api/user-info/${uid}`);
        if (res.ok) {
            const data = await res.json();

            // UpdatingLevelStats()
            const levelEl = document.getElementById('calculated-level');
            if (levelEl) levelEl.innerText = data.level || 0;

            const joinedEl = document.getElementById('joined-on');
            if (joinedEl && data.joinedAt) {
                const date = new Date(data.joinedAt);
                joinedEl.innerText = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            }

            if (data.xp !== undefined) {
                const nextLevelXP = (data.level + 1) * 1000;
                const currentLevelXP = data.level * 1000;
                const progress = ((data.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

                const progressBar = document.querySelector('.progress-bar-fill');
                if (progressBar) progressBar.style.width = `${Math.min(Math.max(progress, 5), 100)}%`;
            }
        }
    } catch (err) {
        console.error("Stats Fetch Error:", err);
    }
}

async function loadLeaderboard() {
    const container = document.getElementById('leaderboard-body');
    container.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--text-dim);">Fetching global ranks...</div>';

    try {
        const res = await fetch(`${API_BASE_URL}/api/members/leaderboard`);
        const members = await res.json();

        container.innerHTML = '';
        members.forEach((m, index) => {
            const isTop = index === 0 ? 'top-1' : '';
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            item.style.animationDelay = `${index * 0.05}s`;
            item.innerHTML = `
                <div class="lb-col rank-slot ${isTop}">#${index + 1}</div>
                <div class="lb-col flex-2 user-slot">
                    <img src="${m.avatar}" onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png'">
                    <span>${m.username}</span>
                </div>
                <div class="lb-col"><span class="badge">LVL ${m.level}</span></div>
                <div class="lb-col" style="font-weight:800; color:var(--accent)">${m.xp.toLocaleString()}</div>
            `;
            container.appendChild(item);
        });
    } catch (e) {
        container.innerHTML = '<div style="padding: 40px; text-align: center; color: var(--danger);">Failed to sync leaderboard.</div>';
    }
}

function switchTab(tabName, btn) {
    document.querySelectorAll('.content-view').forEach(view => {
        view.style.display = 'none';
        view.style.animation = 'none';
    });
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

    const view = document.getElementById(`view-${tabName}`);
    if (view) {
        view.style.display = 'block';
        view.style.animation = 'view-in 0.6s ease';
    }
    if (btn) btn.classList.add('active');

    if (tabName === 'members') loadLeaderboard();
    document.getElementById('sidebar').classList.remove('active');
}

function toggleMobileMenu() {
    document.getElementById('sidebar').classList.toggle('active');
}

async function updateNickname() {
    const newNick = document.getElementById('nickname-input').value;
    const uid = localStorage.getItem('levant_uid');
    if (!newNick) return;

    try {
        const res = await fetch(`${API_BASE_URL}/api/user/update-nick`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: uid, nickname: newNick })
        });
        if (res.ok) {
            localStorage.setItem('levant_name', newNick);
            alert("Identity synced successfully!");
            location.reload();
        } else {
            const errorData = await res.json();
            alert(`Error: ${errorData.message || "Bot cannot change this user's nickname (Higher Role or Owner)."}`);
        }
    } catch (e) { alert("Server connection failed."); }
}

async function wipeData() {
    if (!confirm("DANGER: This will permanently delete your stats. Continue?")) return;
    const uid = localStorage.getItem('levant_uid');
    try {
        const res = await fetch(`${API_BASE_URL}/api/danger/wipe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: uid })
        });
        if (res.ok) logout();
    } catch (e) { alert("Wipe failed."); }
}

function logout() {
    localStorage.clear();
    window.location.href = '../index.html';
}
