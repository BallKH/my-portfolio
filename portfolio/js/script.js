// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Enhanced smooth scrolling with easing
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - 70;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar background on scroll with dark theme
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(10, 10, 10, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(255, 107, 53, 0.1)';
    } else {
        navbar.style.background = 'rgba(10, 10, 10, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Enhanced scroll animations with staggered effects
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, index * 100);
        }
    });
}, observerOptions);

// Add animation classes to elements
document.addEventListener('DOMContentLoaded', () => {
    const fadeElements = document.querySelectorAll('.about-content p');
    const slideLeftElements = document.querySelectorAll('.competency-card:nth-child(odd)');
    const slideRightElements = document.querySelectorAll('.competency-card:nth-child(even)');
    const scaleElements = document.querySelectorAll('.hobby-card, .timeline-item');
    
    fadeElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
    
    slideLeftElements.forEach(el => {
        el.classList.add('slide-in-left');
        observer.observe(el);
    });
    
    slideRightElements.forEach(el => {
        el.classList.add('slide-in-right');
        observer.observe(el);
    });
    
    scaleElements.forEach(el => {
        el.classList.add('scale-in');
        observer.observe(el);
    });
});

// Typing effect for hero title (optional enhancement)
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}



// Active navigation link highlighting
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Enhanced loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // Trigger hero animations
    setTimeout(() => {
        const heroElements = document.querySelectorAll('.hero-title .title-line');
        heroElements.forEach((el, index) => {
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }, 300);
});

// Image lazy loading
const images = document.querySelectorAll('img[data-src]');
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
        }
    });
});

images.forEach(img => imageObserver.observe(img));

// Skill bars animation (if you want to add skill percentage bars)
function animateSkillBars() {
    const skillBars = document.querySelectorAll('.skill-bar');
    
    skillBars.forEach(bar => {
        const percentage = bar.dataset.percentage;
        const fill = bar.querySelector('.skill-fill');
        
        if (fill) {
            fill.style.width = percentage + '%';
        }
    });
}

// Contact form handling (if you add a contact form)
const contactForm = document.querySelector('#contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Add your form submission logic here
        const formData = new FormData(contactForm);
        
        // Show success message
        showNotification('Message sent successfully!', 'success');
    });
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Dark mode toggle (optional feature)
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// Load dark mode preference
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
}

// Cursor trail effect (optional enhancement)
let mouseX = 0;
let mouseY = 0;
let trail = [];

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function createTrail() {
    trail.push({ x: mouseX, y: mouseY });
    
    if (trail.length > 20) {
        trail.shift();
    }
    
    requestAnimationFrame(createTrail);
}

// Initialize cursor trail
// createTrail();

// Performance optimization: Debounce scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debouncing to scroll events
const debouncedScrollHandler = debounce(() => {
    // Your scroll handling code here
}, 10);

window.addEventListener('scroll', debouncedScrollHandler);

// Chat Widget Functionality with Name Collection
const chatButton = document.getElementById('chat-button');
const chatPopup = document.getElementById('chat-popup');
const chatClose = document.getElementById('chat-close');
const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send');
const chatMessages = document.getElementById('chat-messages');

let lastMessageId = 0;
let pollInterval;
let visitorName = null;
let sessionId = null;
let chatStarted = false;

chatButton.addEventListener('click', () => {
    chatPopup.classList.toggle('show');
    if (chatPopup.classList.contains('show')) {
        if (!chatStarted) {
            showNameForm();
        } else {
            chatInput.focus();
            startPolling();
        }
    } else {
        stopPolling();
    }
});

chatClose.addEventListener('click', () => {
    chatPopup.classList.remove('show');
    stopPolling();
});

document.addEventListener('click', (e) => {
    if (!document.getElementById('chat-widget').contains(e.target)) {
        chatPopup.classList.remove('show');
        stopPolling();
    }
});

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

chatSend.addEventListener('click', sendMessage);

function showNameForm() {
    chatMessages.innerHTML = `
        <div class="name-form" style="padding: 20px; text-align: center;">
            <h4 style="margin-bottom: 15px; color: #333;">👋 Welcome!</h4>
            <p style="margin-bottom: 20px; color: #666;">Please enter your name to start chatting:</p>
            <input type="text" id="visitor-name" placeholder="Enter your name..." maxlength="20" style="width: 100%; padding: 10px; border: 2px solid #ddd; border-radius: 5px; margin-bottom: 15px; font-size: 14px;">
            <button id="start-chat-btn" style="width: 100%; padding: 10px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px;">Start Chat</button>
        </div>
    `;
    
    const nameInput = document.getElementById('visitor-name');
    const startBtn = document.getElementById('start-chat-btn');
    
    nameInput.focus();
    
    nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            startChat();
        }
    });
    
    startBtn.addEventListener('click', startChat);
}

function startChat() {
    const nameInput = document.getElementById('visitor-name');
    const name = nameInput.value.trim();
    
    if (!name) {
        alert('Please enter your name');
        return;
    }
    
    if (name.length < 2) {
        alert('Name must be at least 2 characters');
        return;
    }
    
    visitorName = name;
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    sessionId = `session_${cleanName}`;
    chatStarted = true;
    
    // Clear name form and show chat interface
    chatMessages.innerHTML = '';
    addMessage(`Hello ${visitorName}! You're now connected to support. How can I help you today?`, false);
    
    // Enable chat input
    chatInput.disabled = false;
    chatSend.disabled = false;
    chatInput.placeholder = 'Type your message...';
    chatInput.focus();
    
    // Start polling for replies
    startPolling();
    
    // Notify Telegram about new visitor
    notifyTelegram(sessionId, visitorName, 'New visitor connected');
}

function addMessage(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMessage() {
    if (!chatStarted) return;
    
    const message = chatInput.value.trim();
    if (!message) return;
    
    addMessage(message, true);
    chatInput.value = '';
    
    chatSend.textContent = 'Sending...';
    chatSend.disabled = true;
    
    try {
        const response = await fetch('/api/sendMessage', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message,
                sessionId,
                visitorName
            })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            // Notify Telegram about new message
            notifyTelegram(sessionId, visitorName, message);
        } else {
            addMessage(`Error: ${result.error || 'Failed to send'}`, false);
        }
    } catch (error) {
        addMessage(`Network error: ${error.message}`, false);
    }
    
    chatSend.disabled = false;
    chatSend.textContent = 'Send';
}

async function notifyTelegram(sessionId, visitorName, message) {
    try {
        await fetch('/api/telegramNotify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                sessionId,
                visitorName,
                message
            })
        });
    } catch (error) {
        console.error('Failed to notify Telegram:', error);
    }
}

async function pollMessages() {
    if (!chatStarted || !sessionId) return;
    
    try {
        const response = await fetch(`/api/getMessages?sessionId=${sessionId}&lastMessageId=${lastMessageId}`);
        const result = await response.json();
        
        if (result.messages && result.messages.length > 0) {
            result.messages.forEach(msg => {
                // Only show messages that are replies (not the visitor's own messages)
                if (msg.sender === 'support' || msg.sender === 'admin') {
                    addMessage(msg.text, false);
                }
                lastMessageId = Math.max(lastMessageId, msg.id);
            });
        }
    } catch (error) {
        console.error('Polling error:', error);
    }
}

function startPolling() {
    if (!pollInterval) {
        pollInterval = setInterval(pollMessages, 3000);
    }
}

function stopPolling() {
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
    }
}

