// Dashboard.js

const clientId = "1454693732799611042";
const redirectUri = "https://lilzeng1.github.io/Levant/dashboard.html";
const backendUrl = "https://levant-backend.onrender.com";

/* ROLE → UI CONFIG */
const ROLE_UI = {
  "Founder": {
    glow: "0 0 25px rgba(255, 215, 0, 0.9)",
    badge: "👑 Founder"
  },
  "Moderator": {
    glow: "0 0 20px rgba(52, 152, 219, 0.9)"
  },
  "Community Guide": {
    glow: "0 0 18px rgba(46, 204, 113, 0.9)"
  },
  "Helper": {
    glow: "0 0 18px rgba(26, 188, 156, 0.9)"
  },
  "Event Lead": {
    glow: "0 0 18px rgba(155, 89, 182, 0.9)"
  },
  "Levant Booster": {
    glow: "0 0 18px rgba(241, 196, 15, 0.9)"
  },
  "Core Supporter": {
    glow: "0 0 16px rgba(231, 76, 60, 0.9)"
  },
  "Ascendant (VIP)": {
    glow: "0 0 16px rgba(155, 89, 182, 0.9)"
  },
  "Content Creator": {
    glow: "0 0 16px rgba(230, 126, 34, 0.9)"
  },
  "Musician": {
    glow: "0 0 16px rgba(52, 73, 94, 0.9)"
  },
  "Member": {
    glow: "0 0 10px rgba(189, 195, 199, 0.6)"
  }
};

/* HELPERS */
function getAccessToken() {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  return params.get("access_token");
}

function daysAgo(dateString) {
  const joinedDate = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - joinedDate) / (1000 * 60 * 60 * 24));
  return diff <= 0 ? "Today" : `${diff} days ago`;
}

function applyRoleUI(roleName) {
  const ui = ROLE_UI[roleName] || ROLE_UI["Core Supporter"];

  const card = document.querySelector(".profile-card");
  if (card && ui.glow) {
    card.style.boxShadow = ui.glow;
  }

  if (ui.badge) {
    let badge = document.getElementById("special-badge");
    if (!badge) {
      badge = document.createElement("div");
      badge.id = "special-badge";
      badge.style.marginTop = "6px";
      badge.style.fontWeight = "600";
      badge.style.opacity = "0.9";
      document
        .getElementById("user-display-name")
        .parentElement.appendChild(badge);
    }
    badge.innerText = ui.badge;
  }
}

/* MAIN FLOW */
async function main() {
  const token = getAccessToken();

  // OAuth redirect
  if (!token) {
    window.location.href =
      `https://discord.com/oauth2/authorize` +
      `?client_id=${clientId}` +
      `&response_type=token` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=identify`;
    return;
  }

  /* 1️⃣ Discord basic user */
  const userRes = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const user = await userRes.json();

  document.getElementById("user-display-name").innerText = user.username;
  document.getElementById("user-discriminator").innerText =
    user.discriminator ? `#${user.discriminator}` : "";
  document.getElementById("user-avatar").src =
    `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;

  /* 2️⃣ Give role (existing logic) */
  await fetch(`${backendUrl}/give-role`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: user.id })
  });

  /* 3️⃣ Get extended info (role + joined_at) */
  let roleName = "Core Supporter";
  let joinedText = "--/--/--";

  try {
    const infoRes = await fetch(`${backendUrl}/userinfo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_token: token })
    });

    const info = await infoRes.json();

    roleName = info.role || "Core Supporter";
    if (info.joinedAt) {
      joinedText = daysAgo(info.joinedAt);
    }
  } catch (e) {
    // fallback already set
  }

  /* 4️⃣ UI apply */
  document.getElementById("status").innerText = roleName;
  document.getElementById("joined-on").innerText = joinedText;

  applyRoleUI(roleName);

  /* 5️⃣ Show dashboard */
  document.getElementById("loading-screen").classList.add("hidden");
  document.getElementById("dashboard-content").classList.remove("hidden");
}

window.onload = main;
