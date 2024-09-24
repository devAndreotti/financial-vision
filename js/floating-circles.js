const numGroups = 5;
const numCircles = 5;
const maxDistance = 150;
const radius = 4;
const maxSpeed = 1.2;
const minSpeed = 0.8;
const initialSpeedFactor = 0.7;
const damping = 0.8;
const propulsionFactor = 3;

const allCircles = [];
let lastWidth = window.innerWidth;
let lastHeight = window.innerHeight;

const maxConnectionsPerCircle = 2;

function createCircle(color, x, y) {
    const circle = document.createElement('div');
    circle.className = 'floating-circle';
    Object.assign(circle.style, {
        left: `${x}px`,
        top: `${y}px`,
        backgroundColor: color,
    });
    circle.speedX = (Math.random() - 0.5) * 2 * maxSpeed * initialSpeedFactor;
    circle.speedY = (Math.random() - 0.5) * 2 * maxSpeed * initialSpeedFactor;
    circle.connections = [];
    circle.x = x + radius;
    circle.y = y + radius;
    document.body.appendChild(circle);
    return circle;
}

function createLine() {
    const line = document.createElement('div');
    line.className = 'floating-line';
    document.body.appendChild(line);
    return line;
}

function updateLine(line, circle1, circle2) {
    const rect1 = circle1.getBoundingClientRect();
    const rect2 = circle2.getBoundingClientRect();
    const [x1, y1] = [rect1.left + rect1.width / 2, rect1.top + rect1.height / 2];
    const [x2, y2] = [rect2.left + rect2.width / 2, rect2.top + rect2.height / 2];
    const length = Math.hypot(x2 - x1, y2 - y1);
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const opacity = Math.max(0, 1 - length / maxDistance);
    
    Object.assign(line.style, {
        width: `${length}px`,
        left: `${x1}px`,
        top: `${y1}px`,
        transform: `rotate(${angle}rad)`,
        opacity: opacity
    });

    if (length < maxDistance / 2) {
        line.classList.add('glow');
    } else {
        line.classList.remove('glow');
    }
}

function limitSpeed(speed) {
    const absSpeed = Math.abs(speed);
    if (absSpeed < minSpeed) return minSpeed * Math.sign(speed);
    return Math.max(Math.min(speed, maxSpeed), -maxSpeed);
}

function checkCollision(circle1, circle2) {
    const dx = circle1.x - circle2.x;
    const dy = circle1.y - circle2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 2 * radius) {
        const angle = Math.atan2(dy, dx);
        const speed = Math.sqrt(circle1.speedX * circle1.speedX + circle1.speedY * circle1.speedY);
        circle1.speedX = Math.cos(angle) * speed;
        circle1.speedY = Math.sin(angle) * speed;
        circle2.speedX = -Math.cos(angle) * speed;
        circle2.speedY = -Math.sin(angle) * speed;

        const overlap = 2 * radius - distance;
        const moveX = (overlap / 2) * Math.cos(angle);
        const moveY = (overlap / 2) * Math.sin(angle);
        circle1.x += moveX;
        circle1.y += moveY;
        circle2.x -= moveX;
        circle2.y -= moveY;

        circle1.classList.add('pulse');
        circle2.classList.add('pulse');
        setTimeout(() => {
            circle1.classList.remove('pulse');
            circle2.classList.remove('pulse');
        }, 300);
    }
}

function animate() {
    if (window.innerWidth <= 1320) {
        return;
    }

    for (const circle of allCircles) {
        circle.speedX *= damping;
        circle.speedY *= damping;
        
        circle.speedX = limitSpeed(circle.speedX);
        circle.speedY = limitSpeed(circle.speedY);
        
        circle.x += circle.speedX;
        circle.y += circle.speedY;
        
        if (circle.x < radius || circle.x > window.innerWidth - radius) {
            circle.speedX *= -1;
            circle.x = Math.max(radius, Math.min(circle.x, window.innerWidth - radius));
        }
        if (circle.y < radius || circle.y > window.innerHeight - radius) {
            circle.speedY *= -1;
            circle.y = Math.max(radius, Math.min(circle.y, window.innerHeight - radius));
        }
        
        circle.style.left = `${circle.x - radius}px`;
        circle.style.top = `${circle.y - radius}px`;
    }
    
    for (let i = 0; i < allCircles.length; i++) {
        for (let j = i + 1; j < allCircles.length; j++) {
            checkCollision(allCircles[i], allCircles[j]);
        }
    }
    
    updateConnections();
    
    requestAnimationFrame(animate);
}

function updateConnections() {
    if (window.innerWidth <= 1320) {
        const allLines = document.querySelectorAll('.floating-line');
        for (const line of allLines) {
            line.remove();
        }
        return;
    }

    for (const circle of allCircles) {
        circle.connections = [];
    }

    for (let i = 0; i < allCircles.length; i++) {
        const circle1 = allCircles[i];
        let closestCircle = null;
        let minDistance = Infinity;

        for (let j = 0; j < allCircles.length; j++) {
            if (i !== j) {
                const circle2 = allCircles[j];
                const distance = Math.hypot(circle1.x - circle2.x, circle1.y - circle2.y);
                if (distance <= maxDistance && distance < minDistance) {
                    closestCircle = circle2;
                    minDistance = distance;
                }
            }
        }

        if (closestCircle && circle1.connections.length < maxConnectionsPerCircle && 
            closestCircle.connections.length < maxConnectionsPerCircle) {
            const line = createLine();
            circle1.connections.push({ circle: closestCircle, line });
            closestCircle.connections.push({ circle: circle1, line });
        }
    }

    const allLines = document.querySelectorAll('.floating-line');
    for (const line of allLines) {
        if (!Array.from(allCircles).some(circle => 
            circle.connections.some(conn => conn.line === line))) {
            line.remove();
        }
    }

    for (const circle of allCircles) {
        for (const conn of circle.connections) {
            updateLine(conn.line, circle, conn.circle);
        }
    }
}

function initializeCircles() {
    for (const circle of allCircles) {
        circle.remove();
    }
    allCircles.length = 0;

    if (window.innerWidth > 1320) {
        for (let i = 0; i < numGroups * numCircles; i++) {
            const x = Math.random() * (window.innerWidth - 2 * radius);
            const y = Math.random() * (window.innerHeight - 2 * radius);
            const color = 'rgba(79, 185, 127, 0.7)';
            allCircles.push(createCircle(color, x, y));
        }
    }
}

initializeCircles();
animate();

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;

        if (newWidth <= 1320) {
            for (const circle of allCircles) {
                circle.remove();
            }
            allCircles.length = 0;
            const allLines = document.querySelectorAll('.floating-line');
            for (const line of allLines) {
                line.remove();
            }
        } else {
            if (allCircles.length === 0) {
                initializeCircles();
            } else {
                const scaleX = newWidth / lastWidth;
                const scaleY = newHeight / lastHeight;

                for (const circle of allCircles) {
                    circle.x *= scaleX;
                    circle.y *= scaleY;

                    if (scaleX < 1) {
                        circle.speedX -= (1 - scaleX) * propulsionFactor * (Math.random() - 0.5);
                    }
                    if (scaleY < 1) {
                        circle.speedY -= (1 - scaleY) * propulsionFactor * (Math.random() - 0.5);
                    }

                    circle.x = Math.max(radius, Math.min(circle.x, newWidth - radius));
                    circle.y = Math.max(radius, Math.min(circle.y, newHeight - radius));

                    circle.style.left = `${circle.x - radius}px`;
                    circle.style.top = `${circle.y - radius}px`;
                }
            }
        }

        lastWidth = newWidth;
        lastHeight = newHeight;

        if (newWidth > 1320) {
            requestAnimationFrame(animate);
        }
    }, 100);
});