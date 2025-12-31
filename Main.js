// Variables
const langToggle = document.getElementById("lang-toggle");
const btnEn = document.getElementById("btn-en");
const btnAr = document.getElementById("btn-ar");
const translatableElements = document.querySelectorAll(".translate");

langToggle.addEventListener("change", () => {
    const isArabic = langToggle.checked;
    
    if (isArabic) {
        btnEn.classList.remove("active");
        btnAr.classList.add("active");
        document.body.classList.add("rtl");
    } else {
        btnEn.classList.add("active");
        btnAr.classList.remove("active");
        document.body.classList.remove("rtl");
    }

    translatableElements.forEach(el => {
        el.innerText = isArabic ? el.getAttribute("data-ar") : el.getAttribute("data-en");
    });
});

const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add("active"); });
}, observerOptions);

document.querySelectorAll(".reveal-on-scroll").forEach(el => observer.observe(el));

const scrollAlert = document.getElementById("scroll-alert");
let scrollTimeout;

const startScrollTimer = () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        if (window.scrollY < 200) scrollAlert.classList.add("show");
    }, 5000);
};

window.addEventListener("scroll", () => {
    scrollAlert.classList.remove("show");
    startScrollTimer();
    const nav = document.querySelector(".navbar");
    const socialBar = document.getElementById("social-bar");
    if (window.scrollY > 50) {
        socialBar.classList.add("hidden");
        nav.classList.add("scrolled-up");
    } else {
        socialBar.classList.remove("hidden");
        nav.classList.remove("scrolled-up");
    }
});

startScrollTimer();

const cardsContainer = document.getElementById("cards-container");
const cards = document.querySelectorAll(".feature-card");
cardsContainer.addEventListener("mousemove", (e) => {
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--x", `${e.clientX - rect.left}px`);
        card.style.setProperty("--y", `${e.clientY - rect.top}px`);
    });
});
