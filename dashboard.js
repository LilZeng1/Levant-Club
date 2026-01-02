// dashboard.js
const initDashboard = () => {
    console.log("--- DEBUG BAŞLADI ---");
    console.log("Mevcut URL:", window.location.href);
    console.log("Mevcut Hash:", window.location.hash);

    const getParam = (name) => {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        if (hashParams.has(name)) return hashParams.get(name);
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has(name)) return urlParams.get(name);
        
        return null;
    };

    const accessToken = getParam('access_token');
    const tokenType = getParam('token_type') || 'Bearer';

    if (accessToken) {
        console.log("✅ Token yakalandı! Discord API'ye gidiliyor...");
        fetchDiscordUser(accessToken, tokenType);
    } else {
        console.error("❌ URL'de token bulunamadı! URL şu şekilde olmalı: dashboard.html#access_token=...");
        const loader = document.getElementById("loading-screen");
        if(loader) loader.innerHTML = "<h3>Token bulunamadı! Lütfen tekrar giriş yapın.</h3>";
    }
};

async function fetchDiscordUser(token, type) {
    try {
        const response = await fetch('https://discord.com/api/users/@me', {
            headers: { 'Authorization': `${type} ${token}` }
        });

        if (!response.ok) {
            const errData = await response.json();
            console.error("Discord API Hatası:", errData);
            throw new Error("Token geçersiz veya süresi dolmuş.");
        }

        const userData = await response.json();
        console.log("👤 Giriş yapan kullanıcı:", userData);
        renderDashboard(userData);

    } catch (error) {
        console.error("❌ Hata:", error);
        document.getElementById("loading-screen").innerHTML = `<h3>Hata: ${error.message}</h3>`;
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

    document.getElementById("nav-username").innerText = user.username;
    document.getElementById("user-display-name").innerText = user.global_name || user.username;
    document.getElementById("user-discriminator").innerText = `@${user.username}`;
    document.getElementById("nav-user-pill").classList.remove("hidden");

    if (user.avatar) {
        document.getElementById("user-avatar").src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`;
    }
}

window.onload = initDashboard;
window.onhashchange = initDashboard;
