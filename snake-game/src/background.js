// Celestial background animation
document.addEventListener('DOMContentLoaded', function() {
    // Create stars
    createStars();
    
    // Add shooting stars occasionally
    setInterval(createShootingStar, 3000);
    
    // Initialize nebula effect
    initNebula();
});

function createStars() {
    const starsContainer = document.getElementById('stars');
    const starCount = 300; // Increased from 200
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Random position
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        
        // Random size (varied more)
        const size = Math.random() * 4;
        
        // Random twinkle delay
        const delay = Math.random() * 5;
        
        // Random color (slight variation)
        const hue = Math.random() * 60 - 30; // -30 to +30
        const color = `hsl(${hue + 220}, 100%, 100%)`; // Blue-ish white
        
        // Apply styles
        star.style.cssText = `
            position: absolute;
            top: ${y}%;
            left: ${x}%;
            width: ${size}px;
            height: ${size}px;
            background-color: ${color};
            border-radius: 50%;
            box-shadow: 0 0 ${size * 3}px rgba(255, 255, 255, 0.8);
            animation: twinkle ${2 + Math.random() * 4}s infinite ${delay}s;
            z-index: 1;
        `;
        
        starsContainer.appendChild(star);
    }
    
    // Add CSS animation for twinkling
    const style = document.createElement('style');
    style.textContent = `
        @keyframes twinkle {
            0%, 100% { opacity: 0.2; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.2); }
        }
        
        @keyframes shootingStar {
            0% {
                transform: translateX(0) translateY(0) rotate(45deg);
                opacity: 1;
            }
            100% {
                transform: translateX(1000px) translateY(1000px) rotate(45deg);
                opacity: 0;
            }
        }
        
        @keyframes nebulaPulse {
            0% { opacity: 0.5; transform: scale(1) rotate(0deg); }
            50% { opacity: 0.8; transform: scale(1.1) rotate(5deg); }
            100% { opacity: 0.5; transform: scale(1) rotate(0deg); }
        }
    `;
    document.head.appendChild(style);
}

function createShootingStar() {
    const starsContainer = document.getElementById('stars');
    const shootingStar = document.createElement('div');
    
    // Random starting position (top half of screen)
    const startX = Math.random() * 50;
    const startY = Math.random() * 30;
    
    // Apply styles
    shootingStar.style.cssText = `
        position: absolute;
        top: ${startY}%;
        left: ${startX}%;
        width: 3px;
        height: 3px;
        background-color: white;
        border-radius: 50%;
        box-shadow: 0 0 15px 3px rgba(255, 255, 255, 0.8);
        animation: shootingStar 2s linear forwards;
        z-index: 2;
    `;
    
    // Add trail effect
    const trail = document.createElement('div');
    trail.style.cssText = `
        position: absolute;
        top: ${startY}%;
        left: ${startX}%;
        width: 150px;
        height: 2px;
        background: linear-gradient(to right, rgba(255, 255, 255, 0.8), transparent);
        transform: rotate(45deg);
        transform-origin: left;
        animation: shootingStar 2s linear forwards;
        z-index: 1;
    `;
    
    starsContainer.appendChild(shootingStar);
    starsContainer.appendChild(trail);
    
    // Remove after animation completes
    setTimeout(() => {
        starsContainer.removeChild(shootingStar);
        starsContainer.removeChild(trail);
    }, 2000);
}

function initNebula() {
    const nebula = document.getElementById('nebula');
    
    // Add animation to nebula
    nebula.style.animation = 'nebulaPulse 15s infinite ease-in-out';
    
    // Create additional nebula layers for depth
    const nebulaLayers = 3;
    for (let i = 0; i < nebulaLayers; i++) {
        const layer = document.createElement('div');
        layer.className = 'nebula-layer';
        
        // Different colors for each layer
        const colors = [
            'rgba(108, 99, 255, 0.2)',
            'rgba(74, 144, 226, 0.15)',
            'rgba(255, 107, 107, 0.1)'
        ];
        
        layer.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: ${100 + i * 20}%;
            height: ${100 + i * 20}%;
            background: radial-gradient(circle at center, 
                ${colors[i]} 0%,
                transparent 70%);
            filter: blur(${40 + i * 10}px);
            transition: transform 0.5s ease-out;
            z-index: -${i + 1};
        `;
        
        nebula.appendChild(layer);
    }
}

// Add parallax effect to nebula
document.addEventListener('mousemove', function(e) {
    const nebula = document.getElementById('nebula');
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    
    // Move nebula slightly with mouse
    nebula.style.transform = `translate(${x * 30}px, ${y * 30}px) scale(1.1)`;
    
    // Move nebula layers with different intensities for parallax effect
    const layers = nebula.querySelectorAll('.nebula-layer');
    layers.forEach((layer, index) => {
        const intensity = 1 + index * 0.5;
        layer.style.transform = `translate(${x * 30 * intensity}px, ${y * 30 * intensity}px) scale(1.1)`;
    });
}); 