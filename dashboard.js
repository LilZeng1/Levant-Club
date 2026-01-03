// Variables
const clientId = "1454693732799611042";
const redirectUri = "https://lilzeng1.github.io/Levant/dashboard.html";
const backendUrl = "https://levant-backend.onrender.com";

// ROLE → UI CONFIG
const ROLE_UI = {
  "Founder": {
    color: "#FFD700",
    glow: "0 0 25px rgba(255, 215, 0, 0.5)",
    icon: "ph-fill ph-crown",
    ar: "مؤسس"
  },

  "Moderator": {
    color: "#FF4757",
    glow: "0 0 25px rgba(255, 71, 87, 0.5)",
    icon: "ph-fill ph-shield-check",
    ar: "مشرف"
  },

  "Community Guide": {
    color: "#2ED573",
    glow: "0 0 25px rgba(46, 213, 115, 0.5)",
    icon: "ph-fill ph-compass",
    ar: "دليل المجتمع"
  },

  "Helper": {
    color: "#1E90FF",
    glow: "0 0 25px rgba(30, 144, 255, 0.5)",
    icon: "ph-fill ph-lifebuoy",
    ar: "مساعد"
  },
  
  "Event Lead": {
    color: "#FFA502",
    glow: "0 0 25px rgba(255, 165, 2, 0.5)",
    icon: "ph-fill ph-unite",
    ar: "مسؤول الفعاليات"
  },

  "Levant Booster": {
    color: "#F47FFF",
    glow: "0 0 25px rgba(244, 127, 255, 0.5)",
    icon: "ph-fill ph-rocket-launch",
    ar: "داعم السيرفر"
  },

  "Core Supporter": {
    color: "#38F484",
    glow: "0 0 25px rgba(56, 244, 132, 0.5)",
    icon: "ph-fill ph-heart-half",
    ar: "داعم أساسي"
  },

  "Ascendant": {
    color: "#F5C542",
    glow: "0 0 25px rgba(245, 197, 66, 0.5)",
    icon: "ph-fill ph-star",
    ar: "Ascendant"
  },

  "Content Creator": {
    color: "#FF0000",
    glow: "0 0 25px rgba(255, 0, 0, 0.5)",
    icon: "ph-fill ph-broadcast",
    ar: "صانع محتوى"
  },

  "Musician": {
    color: "#9B51E0",
    glow: "0 0 25px rgba(155, 81, 224, 0.5)",
    icon: "ph-fill ph-music-notes",
    ar: "موسيقي"
  },
  
  "Member": {
    color: "#95A5A6",
    glow: "0 0 15px rgba(149, 165, 166, 0.3)",
    icon: "ph-fill ph-user",
    ar: "عضو"
  }
};

// Role Priority
const ROLE_PRIORITY = [
  "Founder",
  "Moderator",
  "Community Guide",
  "Helper",
  "Event Lead",
  "Levant Booster",
  "Ascendant",
  "Content Creator",
  "Musician",
  "Core Supporter",
  "Member"
];

/* getAccessToken() */
function getAccessToken() {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  return params.get("access_token");
}

// daysAgo()
function daysAgo(dateString) {
  const joinedDate = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - joinedDate) / (1000 * 60 * 60 * 24));
  return diff <= 0 ? "Today" : `${diff} days ago`;
}

// ApplyRoleUI()
function applyRoleUI(roleName) {
    const config = ROLE_UI[roleName] || ROLE_UI["Member"];
    const isAr = document.body.getAttribute('lang') === 'ar';
    const container = document.getElementById('role-badge-container');
    
    // HTML İçeriğini oluştur
    container.innerHTML = `
        <div class="role-badge" style="color: ${config.color}; border-color: ${config.color}44; box-shadow: ${config.glow}">
            <i class="${config.icon}"></i>
            <span>${isAr ? config.ar : roleName}</span>
        </div>
    `;

    const statusText = document.getElementById('status');
    statusText.innerText = isAr ? config.ar : roleName;
    statusText.style.color = config.color;
}

/* Navbar Scroll logic */
let lastScroll = 0;
window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;
    const navbar = document.querySelector(".navbar");

    if (currentScroll <= 150) {
        navbar.classList.remove("navbar--hidden");
        return;
    }
    if (currentScroll > lastScroll && !navbar.classList.contains("navbar--hidden")) {
        navbar.classList.add("navbar--hidden");
    } else if (currentScroll < lastScroll && navbar.classList.contains("navbar--hidden")) {
        navbar.classList.remove("navbar--hidden");
    }
    lastScroll = currentScroll;
});

/* MAIN FLOW */
async function main() {
  const token = getAccessToken();

  if (!token) {
    window.location.href =
      `https://discord.com/oauth2/authorize` +
      `?client_id=${clientId}` +
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
  document.getElementById("user-avatar").src =
    `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;

  await fetch(`${backendUrl}/give-role`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: user.id })
  });

  let finalRole = "Core Supporter";
  let joinedText = "--/--/--";

  try {
    const infoRes = await fetch(`${backendUrl}/userinfo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ access_token: token })
    });

    const info = await infoRes.json();

    if (info.roles && Array.isArray(info.roles)) {
        for (const priorityRole of ROLE_PRIORITY) {
            if (info.roles.includes(priorityRole)) {
                finalRole = priorityRole;
                break;
            }
        }
    } else if (info.role) {
        finalRole = info.role;
    }

    if (info.joinedAt) {
      joinedText = daysAgo(info.joinedAt);
    }
  } catch (e) {
    console.error("Bilgi çekilemedi:", e);
    finalRole = "Core Supporter";
  }

  applyRoleUI(finalRole);

  document.getElementById("joined-on").innerText = joinedText;
  document.getElementById("loading-screen").classList.add("hidden");
  document.getElementById("dashboard-content").classList.remove("hidden");
}

langToggle.addEventListener('change', () => {
    const currentRole = document.getElementById("status").innerText;
});

window.onload = main;
