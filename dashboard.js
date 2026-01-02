// dashboard.js
document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 Dashboard initialized...");

    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    
    const accessToken = params.get('access_token');
    const tokenType = params.get('token_type');

    if (accessToken) {
        console.log("✅ Token found! Fetching real user data...");
        fetchDiscordUser(accessToken, tokenType);
    } else {
        console.warn("⚠️ No token found. Showing demo mode.");
        showDemoMode();
    }
});

async function fetchDiscordUser(token, type) {
    try {
        const response = await fetch('https://discord.com/api/users/@me', {
            headers: {
                'Authorization': `${type} ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Discord API error: ${response.status}`);
        }

        const userData = await response.json();
        console.log("👤 User data received:", userData);
        
        renderDashboard(userData);

    } catch (error) {
        console.error("❌ Failed to fetch user:", error);
        alert("Discord bağlantısı başarısız oldu. Lütfen tekrar giriş yapın.");
        showDemoMode();
    }
}

function renderDashboard(user) {
    const loader = document.getElementById("loading-screen");
    const content = document.getElementById("dashboard-content");
    
    if (loader) loader.style.display = "none";
    if (content) {
        content.classList.remove("hidden");
        content.classList.add("active");
    }

    const usernameEl = document.getElementById("nav-username");
    const displayEl = document.getElementById("user-display-name");
    const tagEl = document.getElementById("user-discriminator");
    const avatarImg = document.getElementById("user-avatar");
    const navPill = document.getElementById("nav-user-pill");

    if (usernameEl) usernameEl.innerText = user.username;
    if (displayEl) displayEl.innerText = user.global_name || user.username;
    if (tagEl) tagEl.innerText = `@${user.username}`;
    if (navPill) navPill.classList.remove("hidden");

    if (avatarImg) {
        if (user.avatar) {
            avatarImg.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`;
        } else {
            avatarImg.src = "https://cdn.discordapp.com/embed/avatars/0.png";
        }
    }
    
    const joinDateEl = document.getElementById("join-date");
    if (joinDateEl) joinDateEl.innerText = new Date().toLocaleDateString('tr-TR');
}

function showDemoMode() {
    const dummyUser = {
        username: "Guest_User",
        global_name: "Guest Mode",
        id: "0",
        avatar: null
    };
    renderDashboard(dummyUser);
}

// Logout()
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "index.html";
    });
}
