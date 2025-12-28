let lastScroll = 0;
const nav = document.querySelector(".navbar");

window.addEventListener("scroll", () => {
    const current = window.scrollY;

    if (current > lastScroll && current > 100) {
        nav.style.transform = "translate(-50%, -150%)";
    } else {
        nav.style.transform = "translate(-50%, 0)"; // Göster
    }

    if (current <= 20) {
        nav.style.background = "rgba(3, 7, 18, 0.6)";
    } else {
        nav.style.background = "rgba(3, 7, 18, 0.9)";
    }

    lastScroll = current;
});
