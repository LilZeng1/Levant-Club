// CONFIGURATION
const clientId = "1454693732799611042";
const redirectUri = "https://lilzeng1.github.io/Levant/dashboard.html";
const backendUrl = "https://levant-backend.onrender.com";

// ROLE DEFINITIONS
const ROLE_UI = {
  "Founder": { color: "#FFD700", glow: "0 0 25px rgba(255, 215, 0, 0.5)", icon: "ph-crown", ar: "مؤسس" },
  "Moderator": { color: "#FF4757", glow: "0 0 25px rgba(255, 71, 87, 0.5)", icon: "ph-shield-check", ar: "مشرف" },
  "Community Guide": { color: "#2ED573", glow: "0 0 25px rgba(46, 213, 115, 0.5)", icon: "ph-compass", ar: "دليل المجتمع" },
  "Helper": { color: "#1E90FF", glow: "0 0 25px rgba(30, 144, 255, 0.5)", icon: "ph-lifebuoy", ar: "مساعد" },
  "Event Lead": { color: "#FFA502", glow: "0 0 25px rgba(255, 165, 2, 0.5)", icon: "ph-unite", ar: "مسؤول الفعاليات" },
  "Levant Booster": { color: "#F47FFF", glow: "0 0 25px rgba(244, 127, 255, 0.5)", icon: "ph-rocket-launch", ar: "داعم السيرفر" },
  "Core Supporter": { color: "#38F484", glow: "0 0 25px rgba(56, 244, 132, 0.5)", icon: "ph-heart-half", ar: "داعم أساسي" },
  "Ascendant": { color: "#F5C542", glow: "0 0 25px rgba(245, 197, 66, 0.5)", icon: "ph-star", ar: "Ascendant" },
  "Content Creator": { color: "#FF0000", glow: "0 0 25px rgba(255, 0, 0, 0.5)", icon: "ph-broadcast", ar: "صانع محتوى" },
  "Musician": { color: "#9B51E0", glow: "0 0 25px rgba(155, 81, 224, 0.5)", icon: "ph-music-notes", ar: "موسيقي" },
  "Member": { color: "#95A5A6", glow: "0 0 15px rgba(149, 165, 166, 0.3)", icon: "ph-user", ar: "عضو" }
};

// UTILITIES
function getAccessToken() {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  return params.get("access_token");
}

function daysAgoCalc(dateString) {
  const joinedDate = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - joinedDate) / (1000 * 60 * 60 * 24));
  return diff <= 0 ? 0 : diff;
}

// --- NEW FEATURE: GAMIFICATION LOGIC ---
function calculateLevel(days) {
    // Simple logic: 1 level per 30 days
    const baseLevel = 1;
    const level = baseLevel + Math.floor(days / 30);
    // Calculate progress to next level
    const progress = (days % 30) / 30 * 100; 
    return { level, progress };
}

function initDailyReward() {
    const btn = document.getElementById('claim-btn');
    const msg = document.getElementById('claim-msg');
    const lastClaim = localStorage.getItem('lastClaimDate');
    const today = new Date().toDateString();

    if (lastClaim === today) {
        btn.disabled = true;
        btn.innerHTML = `<i class="ph-fill ph-check-circle"></i> Claimed`;
        msg.innerText = "Come back tomorrow!";
    }
}

function claimDaily() {
    const btn = document.getElementById('claim-btn');
    const today = new Date().toDateString();
    
    // Visual effect
    btn.innerHTML = `<div class="loader-spinner" style="width:15px;height:15px;"></div>`;
    
    setTimeout(() => {
        localStorage.setItem('lastClaimDate', today);
        btn.disabled = true;
        btn.innerHTML = `<i class="ph-fill ph-check-circle"></i> +50 XP Added`;
        
        // Update progress bar slightly for visual feedback
        const bar = document.querySelector('.xp-bar-fill');
        const currentWidth = parseFloat(bar.style.width) || 0;
        bar.style.width = (currentWidth + 5) + "%";
    }, 800);
}

// UI UPDATERS
function applyRoleUI(roleName) {
    const config = ROLE_UI[roleName] || ROLE_UI["Member"];
    const isAr = document.body.getAttribute('lang') === 'ar';
    const container = document.getElementById('role-badge-container');
    
    container.innerHTML = `
        <div class="role-badge" style="
            display: inline-flex; align-items: center; gap: 8px;
            padding: 8px 16px; border-radius: 50px;
            background: ${config.color}20; 
            border: 1px solid ${config.color}40;
            color: ${config.color}; box-shadow: ${config.glow};
            font-weight: 700; font-size: 0.9rem;">
            <i class="ph-fill ${config.icon}"></i>
            <span>${isAr ? config.ar : roleName}</span>
        </div>
    `;

    const statusText = document.getElementById('status');
    statusText.innerText = isAr ? config.ar : roleName;
    statusText.style.color = config.color;
    statusText.style.textShadow = config.glow;
}

// --- MAIN LOGIC ---
async function main() {
    const token = getAccessToken();

    if (!token) {
        window.location.href = `https://discord.com/oauth2/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=identify`;
        return;
    }

    // 1. Fetch Discord User
    const userRes = await fetch("https://discord.com/api/users/@me", {
        headers: { Authorization: `Bearer ${token}` }
    });
    const user = await userRes.json();

    document.getElementById("user-display-name").innerText = user.username;
    document.getElementById("user-avatar").src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;

    // 2. Trigger Backend Role Assignment
    fetch(`${backendUrl}/give-role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id })
    }).catch(console.error);

    // 3. Fetch User Info from Backend
    let roleName = "Member";
    let daysJoined = 0;

    try {
        const infoRes = await fetch(`${backendUrl}/userinfo`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ access_token: token })
        });
        const info = await infoRes.json();

        if (info.role) roleName = info.role;
        if (info.joinedAt) daysJoined = daysAgoCalc(info.joinedAt);

    } catch (e) {
        console.error("Info fetch failed:", e);
    }

    // 4. Update UI
    applyRoleUI(roleName);
    
    // Stats
    document.getElementById("joined-on").innerText = daysJoined;
    
    // Level System Calculation
    const userStats = calculateLevel(daysJoined);
    document.getElementById('calculated-level').innerText = userStats.level;
    document.querySelector('.xp-bar-fill').style.width = `${userStats.progress}%`;

    // Init Daily Reward
    initDailyReward();

    // Reveal Dashboard
    setTimeout(() => {
        document.getElementById("loading-screen").style.display = 'none';
        document.getElementById("dashboard-content").classList.remove("hidden");
    }, 1500);
}

// Event Listeners
document.getElementById('logout-btn').addEventListener('click', () => {
    window.location.href = './index.html';
});

window.onload = main;
