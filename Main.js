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

// LastScroll()
let lastScroll = 0;
const nav = document.querySelector(".navbar");

window.addEventListener("scroll", () => {
    const current = window.scrollY;
    if (current > lastScroll && current > 100) {
        nav.style.transform = "translate(-50%, -200%)";
    } else {
        nav.style.transform = "translate(-50%, 0)";
    }
    nav.style.background = current <= 20 ? "rgba(3, 7, 18, 0.6)" : "rgba(3, 7, 18, 0.95)";
    lastScroll = current;
});
