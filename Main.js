document.addEventListener('DOMContentLoaded', () => {
    // Language System
    const langToggle = document.getElementById('lang-toggle');
    const translatables = document.querySelectorAll('.translate');

    function updateLanguage() {
        const isArabic = langToggle.checked;
        const lang = isArabic ? 'ar' : 'en';
        document.body.setAttribute('lang', lang);
        document.body.style.direction = isArabic ? 'rtl' : 'ltr';

        translatables.forEach(el => {
            const text = el.getAttribute(`data-${lang}`);
            if (text) el.innerText = text;
        });
    }

    langToggle.addEventListener('change', updateLanguage);

    // Smooth Reveal
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Card Hover Effect
    const cards = document.querySelectorAll('.bento-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
});
