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
        const Res = await fetch(`${BackendUrl}/server-stats`);
        if (!Res.ok) throw new Error("Network response was not ok");
        const Data = await Res.json();
        
        const OnlineEl = document.getElementById('status-online');
        const TotalEl = document.getElementById('total-agents');
        
        if (OnlineEl) OnlineEl.innerText = Data.online;
        if (TotalEl) TotalEl.innerText = Data.total;
    } catch (Err) {
        console.error("Stats Error:", Err);
    }
}

// SwitchLeaderBoard()
window.SwitchLeaderboard = function(type) {
    const weeklyBtn = document.getElementById('tab-weekly');
    const alltimeBtn = document.getElementById('tab-alltime');
    
    if(type === 'weekly') {
        weeklyBtn.classList.add('active');
        alltimeBtn.classList.remove('active');
    } else {
        alltimeBtn.classList.add('active');
        weeklyBtn.classList.remove('active');
    }
    LoadLeaderboard();
};

// LoadLeaderBoard()
async function LoadLeaderboard() {
    const Container = document.getElementById('leaderboard-list');
    if (!Container) return;

    try {
        const Res = await fetch(`${BackendUrl}/leaderboard`);
        const Data = await Res.json();
        
        Container.innerHTML = Data.map(User => `
            <div class="lb-item">
                <span class="rank">${User.rank}</span>
                <div class="user-info">
                    <img src="${User.avatar}" class="lb-avatar" onerror="this.src='https://ui-avatars.com/api/?name=${User.name}'">
                    <span class="name">${User.name}</span>
                </div>
                <span class="stat">${User.msgs}</span>
                <span class="stat">${User.voice}</span>
            </div>
        `).join('');
    } catch (Err) {
        console.error("Leaderboard Error:", Err);
    }
}

// Main()
async function Main() {
    const Params = new URLSearchParams(window.location.search || window.location.hash.substring(1));
    const Token = Params.get('access_token');

    if (!Token) {
        window.location.href = "index.html";
        return;
    }

    try {
        const Res = await fetch(`${BackendUrl}/userinfo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_token: Token })
        });
        
        const Data = await Res.json();
        
        /* Update UI */
        document.getElementById('user-name').innerText = Data.username;
        document.getElementById('user-avatar').src = Data.avatar;
        
        /* Calculate Days */
        const Joined = new Date(Data.joinedAt);
        const Now = new Date();
        const Diff = Math.floor((Now - Joined) / (1000 * 60 * 60 * 24));
        document.getElementById('joined-on').innerText = Diff;

        /* Stats */
        document.getElementById('stat-msgs').innerText = Data.stats.messages;
        document.getElementById('stat-streak').innerText = Data.stats.streak;
        
        ApplyRoleUI(Data.role);
        FetchServerStats();
        LoadLeaderboard();

    } catch (Err) {
        console.error("Main Logic Error:", Err);
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
function ApplyRoleUI(RoleName) {
    const Container = document.getElementById('role-badge-container');
    if (!Container) return;
    Container.innerHTML = `<div class="role-badge"><span>${RoleName}</span></div>`;
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
