// Variables
const ClientId = "1454693732799611042";
const GuildId = "1452829028267327511";
const BackendUrl = "https://levant-backend.onrender.com";

// On Load
document.addEventListener('DOMContentLoaded', async () => {
    const Params = new URLSearchParams(window.location.search);
    const Code = Params.get('code');

    if (Code) {
        // Exchange Code For Token Via Discord
        InitDashboard();
    } else {
        const Token = sessionStorage.getItem('access_token');
        if (!Token) window.location.href = 'index.html';
        else InitDashboard();
    }
});

// Main Initialization
async function InitDashboard() {
    const Token = sessionStorage.getItem('access_token');
    try {
        const Res = await fetch(`${BackendUrl}/userinfo`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_token: Token })
        });
        
        const Data = await Res.json();
        if (Data.Error) throw new Error(Data.Error);

        UpdateUI(Data);
    } catch (Err) {
        console.error("Dashboard Error:", Err);
        // sessionStorage.clear();
        // window.location.href = 'index.html';
    }
}

// Update UI Elements
function UpdateUI(User) {
    document.getElementById('user-display-name').innerText = User.global_name || User.username;
    document.getElementById('user-avatar').src = `https://cdn.discordapp.com/avatars/${User.id}/${User.avatar}.png`;
    document.getElementById('joined-on').innerText = CalculateDays(User.joinedAt);
    document.getElementById('calculated-level').innerText = User.level || 0;
    
    const Loading = document.getElementById('loading-screen');
    if (Loading) Loading.style.display = 'none';
}

// Helper Functions
function CalculateDays(DateString) {
    const Joined = new Date(DateString);
    const Now = new Date();
    const Diff = Math.abs(Now - Joined);
    return Math.floor(Diff / (1000 * 60 * 60 * 24));
}

function ShowToast(Msg) {
    const Container = document.getElementById('toast-container');
    const Toast = document.createElement('div');
    Toast.className = "toast-msg";
    Toast.innerText = Msg;
    Container.appendChild(Toast);
    setTimeout(() => Toast.remove(), 3000);
}
