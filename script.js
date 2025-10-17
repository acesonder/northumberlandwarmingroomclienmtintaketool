// Icon data for the gallery
const iconData = [
    { name: 'register', label: 'Register Client' },
    { name: 'checkin', label: 'Check In' },
    { name: 'checkout', label: 'Check Out' },
    { name: 'services', label: 'Services' },
    { name: 'resources', label: 'Resources' },
    { name: 'emergency', label: 'Emergency' },
    { name: 'report', label: 'Reports' },
    { name: 'settings', label: 'Settings' },
    { name: 'profile', label: 'Profile' },
    { name: 'food', label: 'Food Services' },
    { name: 'shelter', label: 'Shelter' },
    { name: 'medical', label: 'Medical' },
    { name: 'transport', label: 'Transport' },
    { name: 'support', label: 'Support' },
    { name: 'info', label: 'Information' },
    { name: 'calendar', label: 'Calendar' }
];

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Load icon gallery
    loadIconGallery();
    
    // Add click handlers to CTA buttons
    setupCTAButtons();
    
    // Add fade-in animation to sections
    animateSections();
    
    console.log('Northumberland Warming Room Client Intake System - Initialized');
});

// Load icons into the gallery
function loadIconGallery() {
    const gallery = document.querySelector('.icon-gallery');
    if (!gallery) return;
    
    iconData.forEach((icon, index) => {
        const iconItem = document.createElement('div');
        iconItem.className = 'icon-item slide-in';
        iconItem.style.animationDelay = `${index * 0.05}s`;
        
        iconItem.innerHTML = `
            <img src="icons/${icon.name}.svg" alt="${icon.label}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><circle cx=%2250%22 cy=%2250%22 r=%2240%22 fill=%22%23667eea%22/></svg>'">
            <span>${icon.label}</span>
        `;
        
        gallery.appendChild(iconItem);
    });
}

// Setup CTA button click handlers
function setupCTAButtons() {
    const buttons = document.querySelectorAll('.cta-button');
    
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.dataset.action;
            handleCTAClick(action, this);
        });
    });
}

// Handle CTA button clicks
function handleCTAClick(action, button) {
    // Add click animation
    button.classList.add('loading');
    
    // Simulate action
    setTimeout(() => {
        button.classList.remove('loading');
        showNotification(`${action} action triggered`, 'success');
    }, 500);
    
    console.log(`CTA Action: ${action}`);
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type} fade-in`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : '#2196F3'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
        z-index: 1000;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Animate sections on scroll
function animateSections() {
    const sections = document.querySelectorAll('section');
    
    sections.forEach((section, index) => {
        section.classList.add('fade-in');
        section.style.animationDelay = `${index * 0.1}s`;
    });
}

// Smooth scroll for internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Handle responsive menu if needed in future
function toggleMenu() {
    const menu = document.querySelector('.mobile-menu');
    if (menu) {
        menu.classList.toggle('active');
    }
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        handleCTAClick,
        showNotification,
        loadIconGallery
    };
}
