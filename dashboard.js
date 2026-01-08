// Configuration
const clientId = "1454693732799611042";
const guildId = "1452829028267327511";
const redirectUri = "https://lilzeng1.github.io/Levant/dashboard.html";
const backendUrl = "https://levant-backend.onrender.com";

// Mouse Glow Effect
const cards = document.querySelectorAll(".bento-card");
document.addEventListener("mousemove", (e) => {
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
    });
});

// Level Up Modal Functions
function showLevelUp(newLevel) {
    const modal = document.getElementById('levelup-modal');
    const levelNum = document.getElementById('modal-level-num');
    const icon = document.getElementById('new-level-icon');
    
    // Dynamic Icon based on level
    if(newLevel >= 10) icon.className = "ph-duotone ph-crown-simple";
    else if(newLevel >= 5) icon.className = "ph-duotone ph-star";
    else icon.className = "ph-duotone ph-trophy";

    levelNum.innerText = newLevel;
    
    modal.classList.add('active');
}

window.closeLevelUp = function() {
    const modal = document.getElementById('levelup-modal');
    modal.classList.remove('active');
}

// Daily Claim
window.claimDaily = function() {
    const btn = document.getElementById('claim-btn');
    const streakEl = document.getElementById('streak-count');
    const today = new Date().toDateString();
    let streak = parseInt(localStorage.getItem('streak') || '0');
    const isAr = document.body.classList.contains('rtl-mode');
    
    // Update Logic
    streak++;
    localStorage.setItem('streak', streak);
    localStorage.setItem('lastClaimDate', today);

    // Button Animation
    btn.innerHTML = `<i class="ph-bold ph-spinner spin-slow"></i>`;
    
    setTimeout(() => {
        btn.disabled = true;
        btn.innerHTML = `<i class="ph-fill ph-check-circle"></i> +200 XP`;
        if(streakEl) streakEl.innerText = streak;
        
        // Fill Bar
        const bar = document.querySelector('.xp-bar-fill');
        if(bar) bar.style.width = "100%";

        // Trigger Level 0 -> 2
        const currentLvl = parseInt(document.getElementById('calculated-level').innerText);
        if(currentLvl === 0) {
            document.getElementById('calculated-level').innerText = "2";
            setTimeout(() => {
                showLevelUp(2);
            }, 800);
        } else {
             showToast(isAr ? "تم إضافة نقاط الخبرة!" : "+200 XP Added!");
        }

    }, 1000);
}

// Data Handling & Auth
async function main() {
    // Language Init
    const savedLang = localStorage.getItem('levant_lang') || 'en';
    setLang(savedLang);

    let token = new URLSearchParams(window.location.hash.substring(1)).get("access_token");
    if (token) {
        sessionStorage.setItem("discord_token", token);
        window.history.replaceState({}, document.title, window.location.pathname);
    } else {
        token = sessionStorage.getItem("discord_token");
    }

    if (!token) {
        window.location.href = `https://discord.com/oauth2/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=identify`;
        return;
    }

    try {
        const infoRes = await fetch(`${backendUrl}/userinfo`, {
            method: "POST", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ access_token: token })
        });

        if (!infoRes.ok) throw new Error("Auth Failed");
        const data = await infoRes.json();

        // Populate User Info
        document.getElementById("user-display-name").innerText = data.username || "Agent";
        
        const avatarUrl = data.avatar 
            ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png?size=256` 
            : "https://placehold.co/120/101010/FFF";
        document.getElementById("user-avatar").src = avatarUrl;

        if(data.banner_color) {
            document.getElementById("user-banner").style.background = data.banner_color;
        }

        // Stats
        const daysJoined = daysAgoCalc(data.joinedAt); // Assumes helper exists
        document.getElementById("joined-on").innerText = daysJoined;
        
        // Initial Level
        const userStats = calculateLevel(daysJoined);
        document.getElementById('calculated-level').innerText = userStats.level;
        document.querySelector('.xp-bar-fill').style.width = `${userStats.progress}%`;

        // Check Daily
        const lastClaim = localStorage.getItem('lastClaimDate');
        const today = new Date().toDateString();
        const streakEl = document.getElementById('streak-count');
        const streak = localStorage.getItem('streak') || 0;
        if(streakEl) streakEl.innerText = streak;
        
        if(lastClaim === today) {
            const btn = document.getElementById('claim-btn');
            btn.disabled = true;
            btn.innerHTML = `<i class="ph-fill ph-check-circle"></i> Claimed`;
        }

        applyRoleUI(data.role || "Visitor");

        // Server Count
        try {
            const guildRes = await fetch(`https://discord.com/api/guilds/${guildId}/widget.json`);
            const guildData = await guildRes.json();
            document.getElementById('server-online-count').innerText = guildData.presence_count || "200+";
        } catch {
             document.getElementById('server-online-count').innerText = "200+";
        }

        // Animation In
        setTimeout(() => {
            document.getElementById("loading-screen").style.display = 'none';
            const dash = document.getElementById("dashboard-content");
            dash.style.display = 'grid';
            void dash.offsetWidth; 
            dash.classList.remove("hidden");

            const allCards = dash.querySelectorAll('.bento-card');
            allCards.forEach((c, i) => {
                c.style.opacity = '0';
                c.style.transform = 'translateY(20px)';
                c.style.transition = `all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${i * 0.1}s`;
                requestAnimationFrame(() => {
                    c.style.opacity = '1';
                    c.style.transform = 'translateY(0)';
                });
            });

        }, 1200);

    } catch (e) {
        console.error(e);
        sessionStorage.removeItem("discord_token");
        window.location.href = "index.html";
    }
}

// settLang()
function setLang(lang) {
    localStorage.setItem('levant_lang', lang);
    const isAr = lang === 'ar';
    const translations = document.querySelectorAll('.translate');
    const btnEn = document.getElementById('btn-en');
    const btnAr = document.getElementById('btn-ar');

    if(isAr) {
        document.body.classList.add('rtl-mode');
        document.body.setAttribute('dir', 'rtl');
        btnAr.classList.add('active');
        if(btnEn) btnEn.classList.remove('active');
    } else {
        document.body.classList.remove('rtl-mode');
        document.body.setAttribute('dir', 'ltr');
        if(btnEn) btnEn.classList.add('active');
        btnAr.classList.remove('active');
    }

    translations.forEach(el => {
        const text = el.getAttribute(`data-${lang}`);
        if(text) el.innerText = text;
    });
    
    const role = sessionStorage.getItem('user_role_name');
    if(role) applyRoleUI(role);
}

// RoleUI[]
const ROLE_UI = {
  "Founder": { color: "#FFD700", icon: "ph-crown", ar: "البيغ بوس" },
  "Moderator": { color: "#FF4757", icon: "ph-shield-check", ar: "مشرف" },
  "Member": { color: "#95A5A6", icon: "ph-user", ar: "واحد منا" },
  "Visitor": { color: "#666", icon: "ph-ghost", ar: "ضيف" }
};

// applyRoleUI
function applyRoleUI(roleName) {
    const config = ROLE_UI[roleName] || ROLE_UI["Member"];
    const isAr = document.body.classList.contains('rtl-mode');
    const container = document.getElementById('role-badge-container');
    sessionStorage.setItem('user_role_name', roleName);

    container.innerHTML = `
        <div class="role-badge" style="color: ${config.color}; border: 1px solid ${config.color}; background: ${config.color}20;">
            <i class="ph-fill ${config.icon}"></i>
            <span>${isAr && config.ar ? config.ar : roleName}</span>
        </div>
    `;
}

// showToast()
function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.style.cssText = `
        background: rgba(20,20,20,0.95); border: 1px solid rgba(255,255,255,0.1); 
        color: white; padding: 12px 24px; border-radius: 12px; margin-top: 10px;
        backdrop-filter: blur(10px); animation: float 0.3s ease; display: flex; align-items: center; gap: 10px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    `;
    toast.innerHTML = `<i class="ph-fill ph-check-circle" style="color:#2ecc71"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// calculateLevel()
function calculateLevel(days) {
    const baseLevel = 0;
    const level = baseLevel + Math.floor(days / 30);
    const progress = ((days % 30) / 30) * 100; 
    return { level, progress };
}

// daysAgoCalc()
function daysAgoCalc(dateString) {
    if (!dateString) return 0;
    const joinedDate = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - joinedDate) / (1000 * 60 * 60 * 24));
    return diff <= 0 ? 0 : diff;
}

document.getElementById('logout-btn').addEventListener('click', () => {
    sessionStorage.removeItem("discord_token");
    window.location.href = 'index.html';
});

window.onload = main;
