import {Color} from './color.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

export const joysticks = [
    {
        get x() {
            return canvas.width * 0.2;
        },
        get y() {
            return canvas.height * 0.5;
        },
        radius: 50,
        innerRadius: 25,
        touchId: null,
        currentX: 0,
        currentY: 0,
        active: false,
    },
    {
        get x() {
            return canvas.width * 0.8;
        },
        get y() {
            return canvas.height * 0.5;
        },
        radius: 50,
        innerRadius: 25,
        touchId: null,
        currentX: 0,
        currentY: 0,
        active: false,
    },
];

export function drawJoystick() {
    ctx.save();

    for (const joystick of joysticks) {
        ctx.beginPath();
        ctx.arc(joystick.x, joystick.y, joystick.radius, 0, Math.PI * 2);
        ctx.globalAlpha = 0.2;
        ctx.strokeStyle = Color.Black;
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.closePath();
        ctx.globalAlpha = 1;

        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.arc(joystick.x + joystick.currentX, joystick.y + joystick.currentY, joystick.innerRadius, 0, Math.PI * 2);
        ctx.strokeStyle = Color.Black;
        ctx.fill();
        ctx.closePath();
        ctx.globalAlpha = 1;
    }

    ctx.restore();
}

function handleTouchStart(event) {
    for (const touch of event.changedTouches) {
        for (const joystick of joysticks) {
            const dx = touch.pageX - (joystick.x + joystick.currentX);
            const dy = touch.pageY - (joystick.y + joystick.currentY);
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist <= joystick.innerRadius) {
                joystick.touchId = touch.identifier;
                joystick.active = true;
            }
        }
    }
}

function handleTouchMove(event) {
    for (const touch of event.changedTouches) {
        for (const joystick of joysticks) {
            if (joystick.touchId === touch.identifier && joystick.active) {
                const dx = touch.pageX - joystick.x;
                const dy = touch.pageY - joystick.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist <= joystick.radius) {
                    joystick.currentX = dx;
                    joystick.currentY = dy;
                } else {
                    const angle = Math.atan2(dy, dx);
                    joystick.currentX = Math.cos(angle) * joystick.radius;
                    joystick.currentY = Math.sin(angle) * joystick.radius;
                }
            }
        }
    }
}

function handleTouchEnd(event) {
    for (const touch of event.changedTouches) {
        for (const joystick of joysticks) {
            if (joystick.touchId === touch.identifier) {
                joystick.touchId = null;
                joystick.currentX = 0;
                joystick.currentY = 0;
                joystick.active = false;
            }
        }
    }
}

canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('touchmove', handleTouchMove);
canvas.addEventListener('touchend', handleTouchEnd);