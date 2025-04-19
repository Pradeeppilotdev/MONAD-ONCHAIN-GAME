// Celestial background with GPU Mode toggle
document.addEventListener('DOMContentLoaded', function() {
    // Create GPU Mode toggle button
    createGPUModeToggle();
    
    // Initialize with static background by default
    createStaticStars();
    initStaticNebula();
});

// Global variables to track state and intervals
let gpuModeActive = false;
let shootingStarInterval = null;
let mousemoveHandler = null;

function createGPUModeToggle() {
    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'gpu-mode-container';
    buttonContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
    `;
    
    // Create toggle button
    const gpuButton = document.createElement('button');
    gpuButton.id = 'gpu-mode-button';
    gpuButton.textContent = 'GPU Mode: OFF';
    gpuButton.style.cssText = `
        background: linear-gradient(45deg, #6c63ff, #4a90e2);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 25px;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
        box-shadow: 0 0 15px rgba(108, 99, 255, 0.3);
        transition: all 0.3s ease;
    `;
    
    // Add hover effect
    gpuButton.addEventListener('mouseover', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 5px 15px rgba(108, 99, 255, 0.4)';
    });
    
    gpuButton.addEventListener('mouseout', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 0 15px rgba(108, 99, 255, 0.3)';
    });
    
    // Add click handler
    gpuButton.addEventListener('click', function() {
        gpuModeActive = !gpuModeActive;
        this.textContent = `GPU Mode: ${gpuModeActive ? 'ON' : 'OFF'}`;
        
        // Clear existing background
        clearBackground();
        
        // Apply appropriate background based on mode
        if (gpuModeActive) {
            createAnimatedStars();
            initAnimatedNebula();
        } else {
            createStaticStars();
            initStaticNebula();
        }
    });
    
    // Add button to container
    buttonContainer.appendChild(gpuButton);
    document.body.appendChild(buttonContainer);
}

// Function to clear all background elements and event listeners
function clearBackground() {
    // Clear stars
    const starsContainer = document.getElementById('stars');
    while (starsContainer.firstChild) {
        starsContainer.removeChild(starsContainer.firstChild);
    }
    
    // Clear nebula
    const nebula = document.getElementById('nebula');
    while (nebula.firstChild) {
        nebula.removeChild(nebula.firstChild);
    }
    
    // Clear nebula animation
    nebula.style.animation = 'none';
    
    // Clear shooting star interval
    if (shootingStarInterval) {
        clearInterval(shootingStarInterval);
        shootingStarInterval = null;
    }
    
    // Remove mousemove event listener
    if (mousemoveHandler) {
        document.removeEventListener('mousemove', mousemoveHandler);
        mousemoveHandler = null;
    }
    
    // Remove any added styles
    const addedStyles = document.querySelectorAll('style[data-celestial]');
    addedStyles.forEach(style => style.remove());
}

function createStaticStars() {
    const starsContainer = document.getElementById('stars');
    const starCount = 300;
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Random position
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        
        // Random size
        const size = Math.random() * 4;
        
        // Random color (slight variation)
        const hue = Math.random() * 60 - 30; // -30 to +30
        const color = `hsl(${hue + 220}, 100%, 100%)`; // Blue-ish white
        
        // Apply styles - no animations
        star.style.cssText = `
            position: absolute;
            top: ${y}%;
            left: ${x}%;
            width: ${size}px;
            height: ${size}px;
            background-color: ${color};
            border-radius: 50%;
            box-shadow: 0 0 ${size * 3}px rgba(255, 255, 255, 0.8);
            opacity: 0.8;
            z-index: 1;
        `;
        
        starsContainer.appendChild(star);
    }
}

function createAnimatedStars() {
    const starsContainer = document.getElementById('stars');
    const starCount = 300;
    
    // Add CSS animation for twinkling
    const style = document.createElement('style');
    style.setAttribute('data-celestial', 'true');
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
    `;
    document.head.appendChild(style);
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Random position
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        
        // Random size
        const size = Math.random() * 4;
        
        // Random twinkle delay
        const delay = Math.random() * 5;
        
        // Random color (slight variation)
        const hue = Math.random() * 60 - 30; // -30 to +30
        const color = `hsl(${hue + 220}, 100%, 100%)`; // Blue-ish white
        
        // Apply styles with animation
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
    
    // Add shooting stars
    shootingStarInterval = setInterval(createShootingStar, 3000);
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
        if (shootingStar.parentNode === starsContainer) {
            starsContainer.removeChild(shootingStar);
        }
        if (trail.parentNode === starsContainer) {
            starsContainer.removeChild(trail);
        }
    }, 2000);
}

function initStaticNebula() {
    const nebula = document.getElementById('nebula');
    
    // Remove animation
    nebula.style.animation = 'none';
    
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
            z-index: -${i + 1};
        `;
        
        nebula.appendChild(layer);
    }
}

function initAnimatedNebula() {
    const nebula = document.getElementById('nebula');
    
    // Add CSS animation for nebula
    const style = document.createElement('style');
    style.setAttribute('data-celestial', 'true');
    style.textContent = `
        @keyframes nebulaPulse {
            0% { opacity: 0.5; transform: scale(1) rotate(0deg); }
            50% { opacity: 0.8; transform: scale(1.1) rotate(5deg); }
            100% { opacity: 0.5; transform: scale(1) rotate(0deg); }
        }
    `;
    document.head.appendChild(style);
    
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
    
    // Add parallax effect to nebula
    mousemoveHandler = function(e) {
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
    };
    
    document.addEventListener('mousemove', mousemoveHandler);
} 