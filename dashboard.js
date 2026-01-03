const clientId = "1454693732799611042";
const redirectUri = "https://lilzeng1.github.io/Levant/dashboard.html";
const backendUrl = "https://YOUR-RENDER-APP.onrender.com";

function getAccessToken() {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  return params.get("access_token");
}

async function main() {
  const token = getAccessToken();

  if (!token) {
    window.location.href =
      `https://discord.com/oauth2/authorize?client_id=${clientId}` +
      `&response_type=token` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=identify`;
    return;
  }

  const userRes = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const user = await userRes.json();

  document.getElementById("user-display-name").innerText = user.username;
  document.getElementById("user-discriminator").innerText = `#${user.discriminator}`;
  document.getElementById("user-avatar").src =
    `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;

  await fetch(`${backendUrl}/give-role`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: user.id })
  });

  document.getElementById("loading-screen").classList.add("hidden");
  document.getElementById("dashboard-content").classList.remove("hidden");
}

window.onload = main;
