window.addEventListener("scroll", () => {
    const nav = document.querySelector(".navbar");
    nav.style.background =
        window.scrollY > 50
            ? "rgba(2,6,23,0.95)"
            : "rgba(2,6,23,0.85)";
});

const cards = document.querySelectorAll(".glass-card");

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
        }
    });
}, { threshold: 0.1 });

cards.forEach(card => {
    card.style.opacity = "0";
    card.style.transform = "translateY(20px)";
    card.style.transition = "all 0.6s ease";
    observer.observe(card);
});