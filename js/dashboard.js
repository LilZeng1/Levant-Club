const API_BASE_URL = "https://levant-backend.onrender.com"; 

window.onload = async () => {
    const loadingScreen = document.getElementById('loading-screen');
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('uid');
    const userName = urlParams.get('name');
    const userAvatarHash = urlParams.get('avatar');

    if (!userId) {
        const storedId = localStorage.getItem('levant_uid');
        if(storedId) {
            fetchUserData(storedId, localStorage.getItem('levant_name'), localStorage.getItem('levant_av'));
        } else {
            // If there's nothing sg
            window.location.href = '../index.html';
            return;
        }
    } else {
        // New SignIn(): Save data in browser.
        localStorage.setItem('levant_uid', userId);
        localStorage.setItem('levant_name', userName);
        localStorage.setItem('levant_av', userAvatarHash);
        
        window.history.replaceState({}, document.title, "dashboard.html");
        
        fetchUserData(userId, userName, userAvatarHash);
    }

    // Removing Loading Screen
    if(loadingScreen) {
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 600);
        }, 800);
    }
};

async function fetchUserData(uid, name, avatarHash) {
    // UI (username/avatar) showin' up
    const avatarUrl = avatarHash && avatarHash !== 'null' 
        ? `https://cdn.discordapp.com/avatars/${uid}/${avatarHash}.png`
        : 'https://cdn.discordapp.com/embed/avatars/0.png';
    
    const navName = document.getElementById('nav-user-name');
    const navAvatar = document.getElementById('nav-avatar');
    const dispName = document.getElementById('user-display-name');
    const dispAvatar = document.getElementById('user-avatar');

    if (navName) navName.innerText = name;
    if (dispName) dispName.innerText = name;
    if (navAvatar) navAvatar.src = avatarUrl;
    if (dispAvatar) dispAvatar.src = avatarUrl;

    // Grab user's information from backend
    try {
        const response = await fetch(`${API_BASE_URL}/api/user-info/${uid}`);
        if (response.ok) {
            const data = await response.json();
            updateStats(data);
        }
    } catch (error) {
        console.error("Backend bağlantı hatası:", error);
    }
}

function updateStats(data) {
    // Leveling Up()
    const levelEl = document.getElementById('calculated-level');
    if (levelEl) levelEl.innerText = data.level || 1;

    // Loyalty()
    const joinedEl = document.getElementById('joined-on');
    if (joinedEl) {
        const joinedDate = new Date(data.joinedAt);
        const today = new Date();
        const diffTime = Math.abs(today - joinedDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        joinedEl.innerText = diffDays;
    }
}

// Sekme (Dashboard / Members / Settings)
function switchTab(tabName, btn) {
    document.querySelectorAll('.content-view').forEach(view => {
        view.style.display = 'none';
    });
    
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });

    const selectedView = document.getElementById(`view-${tabName}`);
    if(selectedView) selectedView.style.display = 'block';
    if(btn) btn.classList.add('active');
}

// LogOut()
function logout() {
    localStorage.removeItem('levant_uid');
    localStorage.removeItem('levant_name');
    localStorage.removeItem('levant_av');
    window.location.href = '../index.html'; 
}

// Danger Zone: DELETING DATA & INFORMATION
const wipeBtn = document.querySelector('.danger-btn');
if(wipeBtn) {
    wipeBtn.onclick = async () => {
        const uid = localStorage.getItem('levant_uid');
        if(!uid) return;

        if(confirm("Emin misin? Tüm XP, Seviye verilerin silinecek ve Discord rolün alınacak.")) {
            try {
                const res = await fetch(`${API_BASE_URL}/api/danger/wipe`, { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: uid })
                });
                
                if(res.ok) {
                    alert("Veriler sıfırlandı.");
                    logout();
                }
            } catch (err) {
                alert("İşlem başarısız oldu.");
            }
        }
    }
}
