// Colorful Text Effect
function wrapLetters(element) {
    const text = element.textContent;
    element.innerHTML = '';
    
    for (let i = 0; i < text.length; i++) {
        const letter = text[i];
        const span = document.createElement('span');
        span.className = 'letter';
        span.textContent = letter === ' ' ? '\u00A0' : letter;
        element.appendChild(span);
    }
}

// Auto-wrap letters on page load
document.addEventListener('DOMContentLoaded', function() {
    const colorfulTexts = document.querySelectorAll('.colorful-text');
    colorfulTexts.forEach(wrapLetters);
});