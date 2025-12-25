// Minimalist Scroll Effect
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    if (nav) {
        nav.style.background = window.scrollY > 50
            ? 'rgba(2, 6, 23, 0.95)'
            : 'rgba(2, 6, 23, 0.85)';
    }
});

// Reveal Animation for Cards
const cards = document.querySelectorAll('.glass-card');
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
        }
    });
}, observerOptions);

cards.forEach(card => {
    card.style.opacity = "0";
    card.style.transform = "translateY(20px)";
    card.style.transition = "all 0.6s ease-out";
    observer.observe(card);
});

console.log("Levant Club: Deployment Ready.");
