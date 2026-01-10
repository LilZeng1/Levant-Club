// Variables
const ClientId = "1454693732799611042"; 
const GuildId = "1452829028267327511";
const RedirectUri = "https://lilzeng1.github.io/Levant/dashboard.html"; 
const BackendUrl = "https://levant-backend.onrender.com";
const RewardInterval = 6 * 60 * 60 * 1000;

// Role Hierarchy {}
const RoleHierarchy = [
    { Name: "Founder", Color: "#FFD700", Icon: "ph-crown", Ar: "البيغ بوس" },
    { Name: "Moderator", Color: "#FF4757", Icon: "ph-shield-check", Ar: "مشرف" },
    { Name: "Community Guide", Color: "#00d2d3", Icon: "ph-map-trifold", Ar: "دليل المجتمع" },
    { Name: "Helper", Color: "#54a0ff", Icon: "ph-hands-clapping", Ar: "مساعد" },
    { Name: "Event Lead", Color: "#ff9f43", Icon: "ph-megaphone", Ar: "قائد الفعاليات" },
    { Name: "Levant Booster", Color: "#f368e0", Icon: "ph-rocket-launch", Ar: "داعم ليفانت" },
    { Name: "Ascendant (VIP)", Color: "#5f27cd", Icon: "ph-sketch-logo", Ar: "أسييندانت" },
    { Name: "Content Creator", Color: "#ee5253", Icon: "ph-video-camera", Ar: "صانع محتوى" },
    { Name: "Musician", Color: "#1dd1a1", Icon: "ph-music-notes", Ar: "موسيقي" },
    { Name: "Core Supporter", Color: "#95a5a6", Icon: "ph-heart", Ar: "داعم أساسي" },
    { Name: "Member", Color: "#8e9297", Icon: "ph-user", Ar: "عضو" }
];

// Cards()
const Cards = document.querySelectorAll(".bento-card");
document.addEventListener("mousemove", (E) => {
    Cards.forEach(Card => {
        const Rect = Card.getBoundingClientRect();
        const X = E.clientX - Rect.left;
        const Y = E.clientY - Rect.top;
        Card.style.setProperty("--mouse-x", `${X}px`);
        Card.style.setProperty("--mouse-y", `${Y}px`);
    });
});

// ShowLevelUp()
function ShowLevelUp(NewLevel) {
    const Modal = document.getElementById('levelup-modal');
    const LevelNum = document.getElementById('modal-level-num');
    const Icon = document.getElementById('new-level-icon');
    if (Modal && LevelNum) {
        if (Icon) {
            if(NewLevel >= 10) Icon.className = "ph-duotone ph-crown-simple";
            else if(NewLevel >= 5) Icon.className = "ph-duotone ph-star";
            else Icon.className = "ph-duotone ph-trophy";
        }
        LevelNum.innerText = NewLevel;
        Modal.classList.add('active');
    }
}

// CloseLevelUp
window.CloseLevelUp = function() {
    const Modal = document.getElementById('levelup-modal');
    if(Modal) Modal.classList.remove('active');
}

// ClaimDaily()
window.ClaimDaily = function() {
    const Btn = document.getElementById('claim-btn');
    const StreakEl = document.getElementById('streak-count');
    const Now = new Date().getTime();
    let Streak = parseInt(localStorage.getItem('streak') || '0');
    const IsAr = document.body.classList.contains('rtl-mode');
    Streak++;
    localStorage.setItem('streak', Streak);
    localStorage.setItem('lastClaimDate', Now);
    Btn.innerHTML = `<i class="ph-bold ph-spinner spin-slow"></i>`;
    setTimeout(() => {
        Btn.disabled = true;
        UpdateClaimButton(0);
        if(StreakEl) StreakEl.innerText = Streak;
        const Bar = document.querySelector('.xp-bar-fill');
        if(Bar) Bar.style.width = "100%";
        const CurrentLvl = parseInt(document.getElementById('calculated-level').innerText);
        if(CurrentLvl === 0) {
            document.getElementById('calculated-level').innerText = "2";
            setTimeout(() => ShowLevelUp(2), 800);
        } else {
             ShowToast(IsAr ? "تم إضافة نقاط الخبرة!" : "+200 XP Added!");
        }
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    }, 1000);
}

// UpdateClaimButton()
function UpdateClaimButton(Elapsed) {
    const Btn = document.getElementById('claim-btn');
    const IsAr = document.body.classList.contains('rtl-mode');
    const RemainingMs = RewardInterval - Elapsed;
    if (RemainingMs > 0) {
        Btn.disabled = true;
        const Hours = Math.floor(RemainingMs / (1000 * 60 * 60));
        const Mins = Math.floor((RemainingMs % (1000 * 60 * 60)) / (1000 * 60));
        Btn.innerHTML = `<i class="ph-bold ph-clock"></i> ${Hours}h ${Mins}m`;
        setTimeout(() => CheckRewardAvailability(), 60000); 
    } else {
        Btn.disabled = false;
        Btn.innerHTML = IsAr ? "اجمع المكافأة" : "CLAIM REWARD";
    }
}

// CheckRewardAvailability()
function CheckRewardAvailability() {
    const LastClaim = localStorage.getItem('lastClaimDate');
    if (!LastClaim) return;
    const Now = new Date().getTime();
    const Diff = Now - parseInt(LastClaim);
    if (Diff < RewardInterval) {
        UpdateClaimButton(Diff);
        const TimeUntilNext = RewardInterval - Diff;
        setTimeout(() => {
            if (Notification.permission === "granted") {
                new Notification("LEVANT", { body: "Rewards Ready!", icon: "./assets/Levant-Logo.png" });
            }
        }, TimeUntilNext);
    }
}


// FetchServerStats()
async function FetchServerStats() {
    try {
        const res = await fetch(`${BackendUrl}/server-stats`);
        const stats = await res.json();
        if (stats.error) return;

        document.getElementById("status-online").innerText = stats.online;
        document.getElementById("status-idle").innerText = stats.idle;
        document.getElementById("status-dnd").innerText = stats.dnd;
    } catch (e) { console.error("Stats Error"); }
}

// LoadLeaderBoard()
async function LoadLeaderboard() {
    const list = document.getElementById("leaderboard-list");
    try {
        const res = await fetch(`${BackendUrl}/leaderboard`);
        const data = await res.json();
        
        list.innerHTML = data.map(user => `
            <div class="lb-row">
                <span class="rank-${user.rank}">${user.rank}</span>
                <div class="lb-agent-info">
                    <img src="${user.avatar}" alt="">
                    <span>${user.name}</span>
                </div>
                <span>${user.msgs}</span>
                <span style="opacity: 0.6">${user.voice}</span>
            </div>
        `).join('');
    } catch (e) { list.innerText = "Error loading data..."; }
}


// Main()
async function Main() {
    const SavedLang = localStorage.getItem('levant_lang') || 'en';
    SetLang(SavedLang);
    let Token = new URLSearchParams(window.location.hash.substring(1)).get("access_token");
    if (Token) {
        sessionStorage.setItem("discord_token", Token);
        window.history.replaceState({}, document.title, window.location.pathname);
    } else {
        Token = sessionStorage.getItem("discord_token");
    }
    if (!Token) {
        window.location.href = `https://discord.com/oauth2/authorize?client_id=${ClientId}&response_type=token&redirect_uri=${encodeURIComponent(RedirectUri)}&scope=identify`;
        return;
    }
    try {
        const InfoRes = await fetch(`${BackendUrl}/userinfo`, {
            method: "POST", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ access_token: Token })
        });
        if (!InfoRes.ok) throw new Error("Auth Failed");
        const Data = await InfoRes.json();
        document.getElementById("user-display-name").innerText = Data.username || "Agent";
        document.getElementById("user-avatar").src = Data.avatar 
            ? `https://cdn.discordapp.com/avatars/${Data.id}/${Data.avatar}.png?size=256` 
            : "https://placehold.co/120/101010/FFF";
        if(Data.banner_color) document.getElementById("user-banner").style.background = Data.banner_color;
        const DaysJoined = DaysAgoCalc(Data.joinedAt);
        document.getElementById("joined-on").innerText = DaysJoined;
        const UserStats = CalculateLevel(DaysJoined);
        document.getElementById('calculated-level').innerText = UserStats.level;
        document.querySelector('.xp-bar-fill').style.width = `${UserStats.progress}%`;
        CheckRewardAvailability();
        
        ApplyRoleUI(Data.role || "Member");
        FetchServerStats();
        LoadLeaderboard();
        setInterval(FetchServerStats, 30000);

        setTimeout(() => {
            document.getElementById("loading-screen").style.display = 'none';
            const Dash = document.getElementById("dashboard-content");
            Dash.style.display = 'grid';
            Dash.classList.remove("hidden");
        }, 1200);
    } catch (E) {
        sessionStorage.removeItem("discord_token");
        window.location.href = "index.html";
    }
}

window.SetLang = function(Lang) {
    localStorage.setItem('levant_lang', Lang);
    const IsAr = Lang === 'ar';
    document.body.classList.toggle('rtl-mode', IsAr);
    document.body.setAttribute('dir', IsAr ? 'rtl' : 'ltr');
    const BtnEn = document.getElementById('btn-en');
    const BtnAr = document.getElementById('btn-ar');
    if(BtnEn) { BtnEn.classList.toggle('active', !IsAr); BtnEn.innerText = "EN"; }
    if(BtnAr) { BtnAr.classList.toggle('active', IsAr); BtnAr.innerText = "AR"; }
    document.querySelectorAll('.translate').forEach(El => {
        const Text = El.getAttribute(`data-${Lang}`);
        if(Text) El.innerText = Text;
    });
}

// ApplyRoleUI()
function ApplyRoleUI(RoleNameFromBackend) {
    const Container = document.getElementById('role-badge-container');
    const IsAr = document.body.classList.contains('rtl-mode');
    if(!Container) return;

    const RoleData = RoleHierarchy.find(R => R.Name === RoleNameFromBackend) || RoleHierarchy[RoleHierarchy.length - 1];

    if (RoleData) {
        Container.innerHTML = `
            <div class="role-badge" style="color: ${RoleData.Color}; background: ${RoleData.Color}20;">
                <i class="ph-fill ${RoleData.Icon}"></i>
                <span>${IsAr ? RoleData.Ar : RoleData.Name}</span>
            </div>
        `;
    }
}

// ShowToast()
function ShowToast(Message) {
    const Container = document.getElementById('toast-container');
    if(!Container) return;
    const Toast = document.createElement('div');
    Toast.className = "toast-msg";
    Toast.innerHTML = `<i class="ph-fill ph-check-circle" style="color:#2ecc71"></i> ${Message}`;
    Container.appendChild(Toast);
    setTimeout(() => Toast.remove(), 3000);
}

// CalculateLevel()
function CalculateLevel(Days) {
    return { level: Math.floor(Days / 30), progress: ((Days % 30) / 30) * 100 };
}

// DaysAgoCalc()
function DaysAgoCalc(DateString) {
    if (!DateString) return 0;
    const Diff = Math.floor((new Date() - new Date(DateString)) / (1000 * 60 * 60 * 24));
    return Diff <= 0 ? 0 : Diff;
}

window.onload = Main;
