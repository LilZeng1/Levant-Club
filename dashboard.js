// CONFIGURATION
const clientId = "1454693732799611042";
const guildId = "1452829028267327511";
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
  "Ascendant (VIP)": { color: "#F5C542", glow: "0 0 25px rgba(245, 197, 66, 0.5)", icon: "ph-star", ar: "Ascendant" },
  "Content Creator": { color: "#FF0000", glow: "0 0 25px rgba(255, 0, 0, 0.5)", icon: "ph-broadcast", ar: "صانع محتوى" },
  "Musician": { color: "#9B51E0", glow: "0 0 25px rgba(155, 81, 224, 0.5)", icon: "ph-music-notes", ar: "موسيقي" },
  "Member": { color: "#95A5A6", glow: "0 0 15px rgba(149, 165, 166, 0.3)", icon: "ph-user", ar: "عضو" },
  "Visitor": { color: "#666", glow: "none", icon: "ph-ghost", ar: "زائر" }
};

// --- EFFECT: SCRAMBLE TEXT ---
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\\/[]{}—=+*^?#________';
    this.update = this.update.bind(this);
  }
  setText(newText) {
    const oldText = this.el.innerText;
    const length = Math.max(oldText.length, newText.length);
    const promise = new Promise((resolve) => this.resolve = resolve);
    this.queue = [];
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      this.queue.push({ from, to, start, end });
    }
    cancelAnimationFrame(this.frameRequest);
    this.frame = 0;
    this.update();
    return promise;
  }
  update() {
    let output = '';
    let complete = 0;
    for (let i = 0, n = this.queue.length; i < n; i++) {
      let { from, to, start, end, char } = this.queue[i];
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.randomChar();
          this.queue[i].char = char;
        }
        output += `<span class="dud">${char}</span>`;
      } else {
        output += from;
      }
    }
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameRequest = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
  randomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

// EFFECT: 3D TILT
function initTilt() {
    const cards = document.querySelectorAll('.js-tilt');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
    });
}

// UTILS
function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="ph-fill ph-check-circle" style="color:#2ecc71"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function daysAgoCalc(dateString) {
  if (!dateString) return 0;
  const joinedDate = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - joinedDate) / (1000 * 60 * 60 * 24));
  return diff <= 0 ? 0 : diff;
}

// FEATURES
async function fetchServerStats() {
    try {
        const response = await fetch(`https://discord.com/api/guilds/${guildId}/widget.json`);
        if(response.ok) {
            const data = await response.json();
            const el = document.getElementById('server-online-count');
            const fx = new TextScramble(el);
            fx.setText(data.presence_count.toString());
        } else {
             document.getElementById('server-online-count').innerText = "N/A";
        }
    } catch (e) {
        console.log("Widget hatası:", e);
        document.getElementById('server-online-count').innerText = "-";
    }
}

function calculateLevel(days) {
    const baseLevel = 1;
    const level = baseLevel + Math.floor(days / 30);
    const progress = ((days % 30) / 30) * 100; 
    return { level, progress };
}

function initDailyReward() {
    const btn = document.getElementById('claim-btn');
    const streakEl = document.getElementById('streak-count');
    const lastClaim = localStorage.getItem('lastClaimDate');
    const streak = parseInt(localStorage.getItem('streak') || '0');
    const today = new Date().toDateString();

    if(streakEl) streakEl.innerText = streak;

    if (lastClaim === today) {
        btn.disabled = true;
        btn.innerHTML = `<i class="ph-fill ph-check-circle"></i> Claimed`;
    }
}

function claimDaily() {
    const btn = document.getElementById('claim-btn');
    const streakEl = document.getElementById('streak-count');
    const today = new Date().toDateString();
    let streak = parseInt(localStorage.getItem('streak') || '0');
    
    streak++;
    localStorage.setItem('streak', streak);
    localStorage.setItem('lastClaimDate', today);

    btn.innerHTML = `<div class="loader-spinner" style="width:15px;height:15px;"></div>`;
    
    setTimeout(() => {
        btn.disabled = true;
        btn.innerHTML = `<i class="ph-fill ph-check-circle"></i> +50 XP`;
        if(streakEl) streakEl.innerText = streak;
        const bar = document.querySelector('.xp-bar-fill');
        if(bar) {
            const currentWidth = parseFloat(bar.style.width) || 0;
            bar.style.width = Math.min(currentWidth + 5, 100) + "%";
        }
        showToast("Daily Loot Claimed!");
    }, 800);
}

function setupCopyId(userId) {
    const btn = document.getElementById('copy-id-btn');
    if(btn) {
        btn.addEventListener('click', () => {
            navigator.clipboard.writeText(userId);
            showToast("User ID Copied!");
        });
    }
}

function applyRoleUI(roleName) {
    const config = ROLE_UI[roleName] || ROLE_UI["Member"];
    const isAr = document.body.getAttribute('lang') === 'ar';
    const container = document.getElementById('role-badge-container');
    
    container.innerHTML = `
        <div class="role-badge" style="
            display: inline-flex; align-items: center; gap: 8px;
            padding: 8px 16px; border-radius: 50px;
            background: ${config.color}15; 
            border: 1px solid ${config.color}30;
            color: ${config.color}; box-shadow: ${config.glow};
            font-weight: 700; font-size: 0.9rem;">
            <i class="ph-fill ${config.icon}"></i>
            <span>${isAr ? config.ar : roleName}</span>
        </div>
    `;

    const statusText = document.getElementById('status');
    const fx = new TextScramble(statusText);
    fx.setText(isAr ? config.ar : roleName);
    
    statusText.style.color = config.color;
    statusText.style.textShadow = config.glow;
}

async function handleRoleAssignment(userId) {
    const roleBtn = document.getElementById('claim-role-btn');
    const isAr = document.body.getAttribute('lang') === 'ar';
    
    try {
        const response = await fetch(`${backendUrl}/give-role`, {
            method: "POST", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: userId })
        });

        const result = await response.json();

        if (result.success) {
            if (result.alreadyHasRole) {
                roleBtn.innerHTML = isAr ? "أنت داعم بالفعل!" : "You're already a Supporter!";
                roleBtn.classList.add('already-supporter');
                roleBtn.disabled = true;
            } else {
                showToast(isAr ? "تم إعطاء الرتبة!" : "Role Assigned!");
                roleBtn.innerHTML = isAr ? "تم التفعيل" : "Activated";
                roleBtn.disabled = true;
            }
        }
    } catch (error) {
        console.error("Role assignment failed:", error);
    }
}

// MAIN LOGIC
async function main() {
    initTilt();
    
    const loadingTitle = document.querySelector('.loading-title');
    const fxLoad = new TextScramble(loadingTitle);
    fxLoad.setText("INITIALIZING SYSTEM...");

    // 1. Token Management and URL Cleaning
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

        if (!infoRes.ok) throw new Error("Backend connection failed");

        const data = await infoRes.json();
        
        const nameEl = document.getElementById("user-display-name");
        if(nameEl) {
            const fxName = new TextScramble(nameEl);
            fxName.setText(data.username || "Unknown");
        }

        const avatarEl = document.getElementById("user-avatar");
        if(avatarEl) {
             if(data.avatar) {
                avatarEl.src = `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png`;
             } else {
                avatarEl.src = "https://placehold.co/120x120/101010/FFF?text=?";
             }
        }

        // Rol & Stats
        const daysJoined = daysAgoCalc(data.joinedAt);
        applyRoleUI(data.role || "Visitor");
        
        document.getElementById("joined-on").innerText = daysJoined;
        
        // Level Bar
        const userStats = calculateLevel(daysJoined);
        document.getElementById('calculated-level').innerText = userStats.level;
        const bar = document.querySelector('.xp-bar-fill');
        const xpText = document.getElementById('xp-perc-text');
        
        if(xpText) xpText.innerText = Math.floor(userStats.progress) + "%";
        
        if(data.id) setupCopyId(data.id);
        
        fetch(`${backendUrl}/give-role`, {
            method: "POST", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: data.id })
        }).catch(err => console.log("Rol verme hatası (zaten verilmiş olabilir):", err));

        // Animasyonlar
        setTimeout(() => {
            if(bar) bar.style.width = `${userStats.progress}%`;
        }, 500);

        fetchServerStats();
        initDailyReward();

        // Ekranı aç
        setTimeout(() => {
            const loadScreen = document.getElementById("loading-screen");
            const dashContent = document.getElementById("dashboard-content");
            if(loadScreen) loadScreen.style.display = 'none';
            if(dashContent) dashContent.classList.remove("hidden");
        }, 1500);

    } catch (e) {
        console.error("Critical Error:", e);
        // Hata olursa kullanıcıya bildir ve login'e yönlendir
        alert("There something went wrong, please re-login.");
        sessionStorage.removeItem("discord_token");
        window.location.href = "index.html";
    }
}

// Event Listeners
const logoutBtn = document.getElementById('logout-btn');
if(logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem("discord_token");
        window.location.href = './index.html';
    });
}

// Activity Logger
function addLog(message) {
    const logContainer = document.getElementById('activity-log');
    if (!logContainer) return;

    const now = new Date();
    const timeStr = now.getHours() + ":" + now.getMinutes();
    
    const logItem = document.createElement('div');
    logItem.className = 'log-item';
    logItem.innerHTML = `
        <span class="log-dot"></span>
        <p>[${timeStr}] ${message}</p>
    `;
    
    logContainer.prepend(logItem);
}

window.addEventListener('load', () => {
    setTimeout(() => {
        addLog("Neural connection established.");
    }, 2000);
});

window.onload = main;
