// Enhanced Scroll Animations with GSAP
gsap.registerPlugin(ScrollTrigger);

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initScrollAnimations();
});

function initScrollAnimations() {
    // Hero section parallax background
    gsap.to('.hero::before', {
        yPercent: -50,
        ease: 'none',
        scrollTrigger: {
            trigger: '.hero',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
        }
    });

    // Staggered section animations
    gsap.utils.toArray('section').forEach((section, i) => {
        if (section.classList.contains('hero')) return;
        
        gsap.fromTo(section, {
            opacity: 0,
            y: 100
        }, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                end: 'top 20%',
                toggleActions: 'play none none reverse'
            }
        });
    });

    // Competency cards staggered animation
    gsap.fromTo('.competency-card', {
        opacity: 0,
        y: 60,
        scale: 0.9
    }, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: 'back.out(1.7)',
        scrollTrigger: {
            trigger: '.competencies-grid',
            start: 'top 80%'
        }
    });

    // Timeline items alternating animation
    gsap.utils.toArray('.timeline-item').forEach((item, i) => {
        const isEven = i % 2 === 0;
        gsap.fromTo(item, {
            opacity: 0,
            x: isEven ? -100 : 100
        }, {
            opacity: 1,
            x: 0,
            duration: 1,
            ease: 'power2.out',
            scrollTrigger: {
                trigger: item,
                start: 'top 85%'
            }
        });
    });

    // Hobby cards floating animation
    gsap.fromTo('.hobby-card', {
        opacity: 0,
        y: 80
    }, {
        opacity: 1,
        y: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: '.hobby-grid',
            start: 'top 80%'
        }
    });

    // Contact section slide up
    gsap.fromTo('.contact-content', {
        opacity: 0,
        y: 50
    }, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: '.contact',
            start: 'top 80%'
        }
    });

    // Navbar background on scroll
    ScrollTrigger.create({
        start: 'top -80',
        end: 99999,
        toggleClass: {className: 'scrolled', targets: '.navbar'}
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                gsap.to(window, {
                    duration: 1,
                    scrollTo: target,
                    ease: 'power2.inOut'
                });
            }
        });
    });
}