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
        if(!userId) { window.location.href = '../index.html'; return; }
    } else {
        localStorage.setItem('levant_uid', userId);
        localStorage.setItem('levant_name', userName);
        localStorage.setItem('levant_av', userAvatarHash);
        window.history.replaceState({}, document.title, "dashboard.html");
    }

    updateUI(userName, userId, userAvatarHash);
    await fetchStats(userId);

    if(loadingScreen) {
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => loadingScreen.style.display = 'none', 600);
        }, 800);
    }
};

function updateUI(name, uid, avatarHash) {
    const avatarUrl = avatarHash && avatarHash !== 'null' 
        ? `https://cdn.discordapp.com/avatars/${uid}/${avatarHash}.png`
        : 'https://cdn.discordapp.com/embed/avatars/0.png';
    
    const setEl = (id, val, attr='innerText') => { const el = document.getElementById(id); if(el) el[attr] = val; };

    setEl('nav-user-name', name);
    setEl('user-display-name', name);
    setEl('nav-avatar', avatarUrl, 'src');
    setEl('user-avatar', avatarUrl, 'src');
}

async function fetchStats(uid) {
    try {
        const res = await fetch(`${API_BASE_URL}/api/user-info/${uid}`);
        if(res.ok) {
            const data = await res.json();
            const levelEl = document.getElementById('calculated-level');
            if(levelEl) levelEl.innerText = data.level;

            const joinedEl = document.getElementById('joined-on');
            if(joinedEl) {
                const date = new Date(data.joinedAt);
                joinedEl.innerText = formatTimeAgo(date); 
            }
        }
    } catch(err) { console.error(err); }
}

async function loadLeaderboard() {
    const tbody = document.getElementById('leaderboard-body');
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center">Loading souls...</td></tr>';
    
    try {
        const res = await fetch(`${API_BASE_URL}/api/members/leaderboard`);
        const members = await res.json();
        
        tbody.innerHTML = '';
        members.forEach((m, index) => {
            const row = `
                <tr>
                    <td><div class="rank-badge">${index + 1}</div></td>
                    <td>
                        <div class="user-cell">
                            <img src="${m.avatar}" onerror="this.src='https://cdn.discordapp.com/embed/avatars/0.png'">
                            <span>${m.username}</span>
                        </div>
                    </td>
                    <td><span class="badge">LVL ${m.level}</span></td>
                    <td style="font-weight:700">${m.xp.toLocaleString()}</td>
                </tr>
            `;
            tbody.innerHTML += row;
        });
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="4">Error loading data.</td></tr>';
    }
}

function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " Y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " M";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " D";
    return "New";
}

function switchTab(tabName, btn) {
    document.querySelectorAll('.content-view').forEach(view => view.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

    const view = document.getElementById(`view-${tabName}`);
    if(view) view.style.display = 'block';
    if(btn) btn.classList.add('active');

    if(tabName === 'members') loadLeaderboard();

    // Close mobile sidebar after selection
    document.getElementById('sidebar').classList.remove('active');
}

function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('active');
}

async function updateNickname() {
    const newNick = document.getElementById('nickname-input').value;
    const uid = localStorage.getItem('levant_uid');
    if(!newNick) return alert("Enter a name.");
    
    try {
        const res = await fetch(`${API_BASE_URL}/api/user/update-nick`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: uid, nickname: newNick })
        });
        const data = await res.json();
        if(res.ok) {
            alert("Updated! (Discord might take a second)");
            localStorage.setItem('levant_name', newNick);
            location.reload();
        } else {
            alert("Error: " + (data.error || "Permission Denied. Check Bot Role Position."));
        }
    } catch (e) { alert("Server Error"); }
}

async function wipeData() {
    if(!confirm("Are you sure? All XP will be lost forever.")) return;
    const uid = localStorage.getItem('levant_uid');
    try {
        const res = await fetch(`${API_BASE_URL}/api/danger/wipe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: uid })
        });
        if(res.ok) logout();
    } catch (e) { alert("Wipe failed."); }
}

function logout() {
    localStorage.clear();
    window.location.href = '../index.html'; 
}
