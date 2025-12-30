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

// Navigation & Top Bar Scroll Logic
let lastScroll = 0;
const nav = document.querySelector(".navbar");
const socialBar = document.getElementById("social-bar");

window.addEventListener("scroll", () => {
    const current = window.scrollY;

    // Logic for the Top Social Bar
    if (current > 50) {
        socialBar.classList.add("hidden");
        // Pull navbar up slightly when top bar disappears
        nav.classList.add("scrolled-up"); 
    } else {
        socialBar.classList.remove("hidden");
        nav.classList.remove("scrolled-up");
    }

    // Logic for Main Navbar (hiding when scrolling down deep)
    if (current > lastScroll && current > 200) {
        // Hide nav completely
        nav.style.transform = "translate(-50%, -200%)";
    } else {
        // Show nav
        nav.style.transform = "translate(-50%, 0)";
    }

    // Navbar Background Opacity
    nav.style.background = current <= 20 ? "rgba(3, 7, 18, 0.6)" : "rgba(3, 7, 18, 0.95)";
    
    lastScroll = current;
});

// Scroll Indicators Logic
window.addEventListener("scroll", () => {
    const indicators = document.querySelectorAll('.scroll-indicator');
    if (window.scrollY > 50) {
        indicators.forEach(el => el.classList.add('hidden'));
    } else {
        indicators.forEach(el => el.classList.remove('hidden'));
    }
});
