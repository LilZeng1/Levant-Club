// Variables
const ClientId = "1454693732799611042"; 
const GuildId = "1452829028267327511";
const RedirectUri = "https://lilzeng1.github.io/Levant/dashboard.html"; 
const BackendUrl = "https://levant-backend.onrender.com";
const RewardInterval = 6 * 60 * 60 * 1000;

const LeaderboardData = {
    weekly: [
        { name: "NeonRider", avatar: "https://cdn.discordapp.com/embed/avatars/0.png", msgs: 452, voice: "12h" },
        { name: "SarahAgent", avatar: "https://cdn.discordapp.com/embed/avatars/3.png", msgs: 320, voice: "8h" },
        { name: "ViperMain", avatar: "https://cdn.discordapp.com/embed/avatars/2.png", msgs: 150, voice: "2h" },
        { name: "GhostProtocol", avatar: "https://cdn.discordapp.com/embed/avatars/4.png", msgs: 98, voice: "5h" }
    ],
    alltime: [
        { name: "NeonRider", avatar: "https://cdn.discordapp.com/embed/avatars/0.png", msgs: "15.2K", voice: "420h" },
        { name: "CyberWolf", avatar: "https://cdn.discordapp.com/embed/avatars/1.png", msgs: "12.8K", voice: "380h" },
        { name: "SarahAgent", avatar: "https://cdn.discordapp.com/embed/avatars/3.png", msgs: "10.5K", voice: "250h" },
        { name: "LevantCore", avatar: "./assets/Levant-Logo.png", msgs: "9.1K", voice: "500h" }
    ]
};

const RoleHierarchy = [
    { Name: "Founder", Color: "#FFD700", Icon: "ph-crown", Ar: "البيغ بوس" },
    { Name: "Moderator", Color: "#FF4757", Icon: "ph-shield-check", Ar: "مشرف" },
    { Name: "Member", Color: "#8e9297", Icon: "ph-user", Ar: "عضو" }
];

// Mouse Glow Effect
document.addEventListener("mousemove", (E) => {
    document.querySelectorAll(".bento-card").forEach(Card => {
        const Rect = Card.getBoundingClientRect();
        Card.style.setProperty("--mouse-x", `${E.clientX - Rect.left}px`);
        Card.style.setProperty("--mouse-y", `${E.clientY - Rect.top}px`);
    });
});

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

window.CloseLevelUp = function() {
    const Modal = document.getElementById('levelup-modal');
    if(Modal) Modal.classList.remove('active');
}

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

// Server Stats Fetcher()
async function FetchServerStats() {
    try {
        const res = await fetch(`https://discord.com/api/guilds/${GuildId}/widget.json`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        
        let online = 0, idle = 0, dnd = 0;
        data.members.forEach(m => {
            if (m.status === 'online') online++;
            else if (m.status === 'idle') idle++;
            else if (m.status === 'dnd') dnd++;
        });

        const activeCount = online + idle + dnd;
        const totalMembers = 150; 
        const offline = Math.max(0, totalMembers - activeCount);

        if(document.getElementById('status-online')) document.getElementById('status-online').innerText = online;
        if(document.getElementById('status-idle')) document.getElementById('status-idle').innerText = idle;
        if(document.getElementById('status-dnd')) document.getElementById('status-dnd').innerText = dnd;
        if(document.getElementById('status-offline')) document.getElementById('status-offline').innerText = offline > 0 ? offline : "133";

    } catch (e) {
        console.warn("Widget not reachable");
    }
}

// Leaderboard Logic
window.SwitchLeaderboard = function(Type) {
    const TabWeekly = document.getElementById('tab-weekly');
    const TabAllTime = document.getElementById('tab-alltime');
    
    if(Type === 'weekly') {
        TabWeekly?.classList.add('active');
        TabAllTime?.classList.remove('active');
    } else {
        TabWeekly?.classList.remove('active');
        TabAllTime?.classList.add('active');
    }
    RenderLeaderboard(Type);
}

// RenderLeaderboard()
function RenderLeaderboard(Type) {
    const Container = document.getElementById('leaderboard-list');
    if(!Container) return;
    const Data = LeaderboardData[Type]; 
    Container.innerHTML = '';

    Data.forEach((User, Index) => {
        const RankColor = Index === 0 ? '#ffd700' : (Index === 1 ? '#c0c0c0' : (Index === 2 ? '#cd7f32' : '#54a0ff'));
        const Row = document.createElement('div');
        Row.className = 'lb-row';
        Row.innerHTML = `
            <div class="lb-rank" style="color: ${RankColor}">#${Index + 1}</div>
            <div class="lb-user">
                <div class="lb-avatar" style="background-image: url('${User.avatar}');"></div>
                <span class="lb-name">${User.name}</span>
            </div>
            <div class="lb-stat">${User.msgs}</div>
            <div class="lb-stat sub">${User.voice}</div>
        `;
        Container.appendChild(Row);
    });
}

// Auth & Init
async function Main() {
    const SavedLang = localStorage.getItem('levant_lang') || 'en';
    SetLang(SavedLang);
    FetchServerStats();
    SwitchLeaderboard('weekly');
    setInterval(FetchServerStats, 60000);

    let Token = new URLSearchParams(window.location.hash.substring(1)).get("access_token") || sessionStorage.getItem("discord_token");
    if (!Token) {
        window.location.href = `https://discord.com/oauth2/authorize?client_id=${ClientId}&response_type=token&redirect_uri=${encodeURIComponent(RedirectUri)}&scope=identify`;
        return;
    }
    sessionStorage.setItem("discord_token", Token);
    window.history.replaceState({}, document.title, window.location.pathname);

    try {
        const InfoRes = await fetch(`${BackendUrl}/userinfo`, {
            method: "POST", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ access_token: Token })
        });
        const Data = await InfoRes.json();
        
        document.getElementById("user-display-name").innerText = Data.username || "Agent";
        document.getElementById("user-avatar").src = Data.avatar 
            ? `https://cdn.discordapp.com/avatars/${Data.id}/${Data.avatar}.png` : "https://placehold.co/120";
        
        const DaysJoined = DaysAgoCalc(Data.joinedAt);
        const UserStats = CalculateLevel(DaysJoined);
        document.getElementById('calculated-level').innerText = UserStats.level;
        document.querySelector('.xp-bar-fill').style.width = `${UserStats.progress}%`;
        
        ApplyRoleUI(Data.role || "Member");

        setTimeout(() => {
            document.getElementById("loading-screen").style.display = 'none';
            document.getElementById("dashboard-content").style.display = 'grid';
        }, 1000);
    } catch (E) {
        sessionStorage.removeItem("discord_token");
        window.location.href = "index.html";
    }
}

// DaysAgoCalc()
function DaysAgoCalc(DateString) {
    if (!DateString) return 0;
    return Math.floor((new Date() - new Date(DateString)) / (1000 * 60 * 60 * 24));
}

// CalculateLevel()
function CalculateLevel(Days) {
    return { level: Math.floor(Days / 30), progress: ((Days % 30) / 30) * 100 };
}

// ApplyRoleUI()
function ApplyRoleUI(RoleName) {
    const Container = document.getElementById('role-badge-container');
    const IsAr = document.body.classList.contains('rtl-mode');
    const RoleData = RoleHierarchy.find(R => R.Name === RoleName) || RoleHierarchy[RoleHierarchy.length-1];
    Container.innerHTML = `<div class="role-badge" style="color: ${RoleData.Color}; background: ${RoleData.Color}20;">
        <i class="ph-fill ${RoleData.Icon}"></i><span>${IsAr ? RoleData.Ar : RoleData.Name}</span></div>`;
}

window.SetLang = function(Lang) {
    localStorage.setItem('levant_lang', Lang);
    const IsAr = Lang === 'ar';
    document.body.classList.toggle('rtl-mode', IsAr);
    document.body.setAttribute('dir', IsAr ? 'rtl' : 'ltr');
    document.querySelectorAll('.translate').forEach(El => {
        const Text = El.getAttribute(`data-${Lang}`);
        if(Text) El.innerText = Text;
    });
}

window.onload = Main;
