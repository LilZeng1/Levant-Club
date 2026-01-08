// Configuration
const clientId = "1454693732799611042"; 
const guildId = "1452829028267327511";
const redirectUri = "https://lilzeng1.github.io/Levant/dashboard.html"; 
const backendUrl = "https://levant-backend.onrender.com";
const REWARD_INTERVAL = 6 * 60 * 60 * 1000;

// --- MOUSE GLOW ---
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

// Level Up Modal
function showLevelUp(newLevel) {
    const modal = document.getElementById('levelup-modal');
    const levelNum = document.getElementById('modal-level-num');
    const icon = document.getElementById('new-level-icon');
    
    // Level'a göre ikon değişimi
    if(newLevel >= 10) icon.className = "ph-duotone ph-crown-simple";
    else if(newLevel >= 5) icon.className = "ph-duotone ph-star";
    else icon.className = "ph-duotone ph-trophy";

    levelNum.innerText = newLevel;
    modal.classList.add('active');
}

window.closeLevelUp = function() {
    document.getElementById('levelup-modal').classList.remove('active');
}

// Claim Logic
window.claimDaily = function() {
    const btn = document.getElementById('claim-btn');
    const streakEl = document.getElementById('streak-count');
    const now = new Date().getTime();
    let streak = parseInt(localStorage.getItem('streak') || '0');
    const isAr = document.body.classList.contains('rtl-mode');
    
    streak++;
    localStorage.setItem('streak', streak);
    localStorage.setItem('lastClaimDate', now);

    btn.innerHTML = `<i class="ph-bold ph-spinner spin-slow"></i>`;
    
    setTimeout(() => {
        btn.disabled = true;
        updateClaimButton(REWARD_INTERVAL);
        
        if(streakEl) streakEl.innerText = streak;
        
        const bar = document.querySelector('.xp-bar-fill');
        if(bar) bar.style.width = "100%";

        const currentLvl = parseInt(document.getElementById('calculated-level').innerText);
        if(currentLvl === 0) {
            document.getElementById('calculated-level').innerText = "2";
            setTimeout(() => showLevelUp(2), 800);
        } else {
             showToast(isAr ? "تم إضافة نقاط الخبرة!" : "+200 XP Added!");
        }

        // Bildirim İzni İste
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    }, 1000);
}

function updateClaimButton(diff) {
    const btn = document.getElementById('claim-btn');
    const isAr = document.body.classList.contains('rtl-mode');
    const remainingMs = REWARD_INTERVAL - diff;
    
    if (remainingMs > 0) {
        btn.disabled = true;
        const hours = Math.floor(remainingMs / (1000 * 60 * 60));
        const mins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        btn.innerHTML = `<i class="ph-bold ph-clock"></i> ${hours}h ${mins}m`;
        
        setTimeout(() => checkRewardAvailability(), 60000); 
    } else {
        btn.disabled = false;
        btn.innerHTML = isAr ? "اجمع الغلّة" : "CLAIM REWARD";
    }
}

function checkRewardAvailability() {
    const lastClaim = localStorage.getItem('lastClaimDate');
    if (!lastClaim) return;

    const now = new Date().getTime();
    const diff = now - parseInt(lastClaim);

    if (diff < REWARD_INTERVAL) {
        updateClaimButton(diff);
        
        const timeUntilNext = REWARD_INTERVAL - diff;
        setTimeout(() => {
            if (Notification.permission === "granted") {
                new Notification("LEVANT", { body: "XP'lerin hazır kanka, gel al!", icon: "./assets/Levant-Logo.png" });
            }
        }, timeUntilNext);
    }
}

function showLevelUp(newLevel) {
    const modal = document.getElementById('levelup-modal');
    const levelNum = document.getElementById('modal-level-num');
    const icon = document.getElementById('new-level-icon');

    if (modal && levelNum) {
        if (icon) {
            if(newLevel >= 10) icon.className = "ph-duotone ph-crown-simple";
            else if(newLevel >= 5) icon.className = "ph-duotone ph-star";
            else icon.className = "ph-duotone ph-trophy";
        }
        
        levelNum.innerText = newLevel;
        modal.classList.add('active');
    }
}

// Main()
async function main() {
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

        document.getElementById("user-display-name").innerText = data.username || "Agent";
        document.getElementById("user-avatar").src = data.avatar 
            ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png?size=256` 
            : "https://placehold.co/120/101010/FFF";

        if(data.banner_color) document.getElementById("user-banner").style.background = data.banner_color;

        const daysJoined = daysAgoCalc(data.joinedAt);
        document.getElementById("joined-on").innerText = daysJoined;
        
        const userStats = calculateLevel(daysJoined);
        document.getElementById('calculated-level').innerText = userStats.level;
        document.querySelector('.xp-bar-fill').style.width = `${userStats.progress}%`;

        checkRewardAvailability();
        applyRoleUI(data.role || "Visitor");

        // Reveal UI
        setTimeout(() => {
            document.getElementById("loading-screen").style.display = 'none';
            const dash = document.getElementById("dashboard-content");
            dash.style.display = 'grid';
            dash.classList.remove("hidden");
        }, 1200);

    } catch (e) {
        console.error(e);
        sessionStorage.removeItem("discord_token");
        window.location.href = "index.html";
    }
}

// HELPERS
window.setLang = function(lang) {
    localStorage.setItem('levant_lang', lang);
    const isAr = lang === 'ar';
    document.body.classList.toggle('rtl-mode', isAr);
    document.body.setAttribute('dir', isAr ? 'rtl' : 'ltr');
    
    document.getElementById('btn-en').classList.toggle('active', !isAr);
    document.getElementById('btn-ar').classList.toggle('active', isAr);

    document.querySelectorAll('.translate').forEach(el => {
        const text = el.getAttribute(`data-${lang}`);
        if(text) el.innerText = text;
    });
}

// ApplyRoleUI()
function applyRoleUI(roleName) {
    const config = ROLE_UI[roleName] || ROLE_UI["Member"];
    const container = document.getElementById('role-badge-container');
    const isAr = document.body.classList.contains('rtl-mode');
    container.innerHTML = `
        <div class="role-badge" style="color: ${config.color}; border: 1px solid ${config.color}40; background: ${config.color}10;">
            <i class="ph-fill ${config.icon}"></i>
            <span>${isAr ? config.ar : roleName}</span>
        </div>
    `;
}

// Define RoleUI []
const ROLE_UI = {
  "Founder": { color: "#FFD700", icon: "ph-crown", ar: "البيغ بوس" },
  "Moderator": { color: "#FF4757", icon: "ph-shield-check", ar: "مشرف" },
  "Member": { color: "#95A5A6", icon: "ph-user", ar: "واحد منا" }
};

// showToast()
function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = "toast-msg";
    toast.innerHTML = `<i class="ph-fill ph-check-circle" style="color:#2ecc71"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// calculateLevel()
function calculateLevel(days) {
    return { level: Math.floor(days / 30), progress: ((days % 30) / 30) * 100 };
}

// daysAgoCalc()
function daysAgoCalc(dateString) {
    if (!dateString) return 0;
    const diff = Math.floor((new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24));
    return diff <= 0 ? 0 : diff;
}

window.onload = main;
