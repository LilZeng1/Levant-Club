// Configuration
const clientId = "1454693732799611042";
const guildId = "1452829028267327511";
const redirectUri = "https://lilzeng1.github.io/Levant/dashboard.html";
const backendUrl = "https://levant-backend.onrender.com";

// Mouse Glow
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

// Language Logic
const translations = document.querySelectorAll('.translate');
const btnEn = document.getElementById('btn-en');
const btnAr = document.getElementById('btn-ar');

function setLang(lang) {
    localStorage.setItem('levant_lang', lang);
    const isAr = lang === 'ar';

    if(isAr) {
        document.body.classList.add('rtl-mode');
        document.body.setAttribute('dir', 'rtl');
        btnAr.classList.add('active');
        btnEn.classList.remove('active');
    } else {
        document.body.classList.remove('rtl-mode');
        document.body.setAttribute('dir', 'ltr');
        btnEn.classList.add('active');
        btnAr.classList.remove('active');
    }

    translations.forEach(el => {
        const text = el.getAttribute(`data-${lang}`);
        if(text) el.innerText = text;
    });

    // Re-render role to update language
    const currentUserRole = sessionStorage.getItem('user_role_name');
    if(currentUserRole) applyRoleUI(currentUserRole);
}

// Role Defenitions {}
const ROLE_UI = {
  "Founder": { color: "#FFD700", icon: "ph-crown", ar: "البيغ بوس" },
  "Moderator": { color: "#FF4757", icon: "ph-shield-check", ar: "مشرف" },
  "Community Guide": { color: "#2ED573", icon: "ph-compass", ar: "الدليل" },
  "Helper": { color: "#1E90FF", icon: "ph-lifebuoy", ar: "مساعد" },
  "Event Lead": { color: "#FFA502", icon: "ph-unite", ar: "مسؤول الفعاليات" },
  "Levant Booster": { color: "#F47FFF", icon: "ph-rocket-launch", ar: "داعم السيرفر" },
  "Core Supporter": { color: "#38F484", icon: "ph-heart-half", ar: "داعم أساسي" },
  "Ascendant (VIP)": { color: "#F5C542", icon: "ph-star", ar: "Ascendant" },
  "Content Creator": { color: "#FF0000", icon: "ph-broadcast", ar: "صانع محتوى" },
  "Musician": { color: "#9B51E0", icon: "ph-music-notes", ar: "موسيقي" },
  "Member": { color: "#95A5A6", icon: "ph-user", ar: "واحد منا" },
  "Visitor": { color: "#666", icon: "ph-ghost", ar: "ضيف" }
};

// applyRoleUI()
function applyRoleUI(roleName) {
    const config = ROLE_UI[roleName] || ROLE_UI["Member"];
    const isAr = document.body.classList.contains('rtl-mode');
    const container = document.getElementById('role-badge-container');
    
    // Save for re-render on lang switch
    sessionStorage.setItem('user_role_name', roleName);

    container.innerHTML = `
        <div class="role-badge" style="color: ${config.color}; border-color: ${config.color}40; background: ${config.color}10;">
            <i class="ph-fill ${config.icon}"></i>
            <span>${isAr ? config.ar : roleName}</span>
        </div>
    `;
}

// showToast()
function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.style.cssText = `
        background: rgba(20,20,20,0.9); border: 1px solid rgba(255,255,255,0.1); 
        color: white; padding: 12px 24px; border-radius: 12px; margin-top: 10px;
        backdrop-filter: blur(10px); animation: slideIn 0.3s ease; display: flex; align-items: center; gap: 10px;
    `;
    toast.innerHTML = `<i class="ph-fill ph-check-circle" style="color:#2ecc71"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// calculatelevel()
function calculateLevel(days) {
    const baseLevel = 1;
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

// initDailyReward()
function initDailyReward() {
    const btn = document.getElementById('claim-btn');
    const streakEl = document.getElementById('streak-count');
    const lastClaim = localStorage.getItem('lastClaimDate');
    const streak = parseInt(localStorage.getItem('streak') || '0');
    const today = new Date().toDateString();

    if(streakEl) streakEl.innerText = streak;

    if (lastClaim === today) {
        btn.disabled = true;
        const isAr = document.body.classList.contains('rtl-mode');
        btn.innerHTML = `<i class="ph-fill ph-check-circle"></i> ${isAr ? "أخذتها" : "Claimed"}`;
    }
}

window.claimDaily = function() {
    const btn = document.getElementById('claim-btn');
    const streakEl = document.getElementById('streak-count');
    const today = new Date().toDateString();
    let streak = parseInt(localStorage.getItem('streak') || '0');
    const isAr = document.body.classList.contains('rtl-mode');
    
    streak++;
    localStorage.setItem('streak', streak);
    localStorage.setItem('lastClaimDate', today);

    btn.innerHTML = `...`;
    
    setTimeout(() => {
        btn.disabled = true;
        btn.innerHTML = `<i class="ph-fill ph-check-circle"></i> +50 XP`;
        if(streakEl) streakEl.innerText = streak;
        const bar = document.querySelector('.xp-bar-fill');
        if(bar) {
            const currentWidth = parseFloat(bar.style.width) || 0;
            bar.style.width = Math.min(currentWidth + 5, 100) + "%";
        }
        showToast(isAr ? "مبروك الغلّة!" : "Daily Loot Secured!");
    }, 800);
}

// MAIN INIT
async function main() {
    // Language Init
    const savedLang = localStorage.getItem('levant_lang') || 'en';
    setLang(savedLang);

    // Auth Check
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

    // Data Fetch
    try {
        const infoRes = await fetch(`${backendUrl}/userinfo`, {
            method: "POST", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ access_token: token })
        });

        if (!infoRes.ok) throw new Error("Auth Failed");
        const data = await infoRes.json();

        // Update UI
        document.getElementById("user-display-name").innerText = data.username || "Agent";
        if(data.avatar) {
            document.getElementById("user-avatar").src = `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png`;
        }

        const daysJoined = daysAgoCalc(data.joinedAt);
        document.getElementById("joined-on").innerText = daysJoined;
        
        const userStats = calculateLevel(daysJoined);
        document.getElementById('calculated-level').innerText = userStats.level;
        
        setTimeout(() => {
             document.querySelector('.xp-bar-fill').style.width = `${userStats.progress}%`;
        }, 500);

        applyRoleUI(data.role || "Visitor");
        initDailyReward();

        // Fetch Server Stats
        try {
            const guildRes = await fetch(`https://discord.com/api/guilds/${guildId}/widget.json`);
            const guildData = await guildRes.json();
            document.getElementById('server-online-count').innerText = guildData.presence_count || "200+";
        } catch {
             document.getElementById('server-online-count').innerText = "200+";
        }

        // Reveal Dashboard
        setTimeout(() => {
            document.getElementById("loading-screen").style.display = 'none';
            const dash = document.getElementById("dashboard-content");
            dash.style.display = 'grid';
            dash.classList.remove("hidden");
            dash.style.opacity = '0';
            dash.style.transform = 'translateY(20px)';
            dash.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            requestAnimationFrame(() => {
                dash.style.opacity = '1';
                dash.style.transform = 'translateY(0)';
            });

        }, 1500);

    } catch (e) {
        console.error(e);
        sessionStorage.removeItem("discord_token");
        window.location.href = "index.html";
    }
}

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    sessionStorage.removeItem("discord_token");
    window.location.href = 'index.html';
});

window.onload = main;
