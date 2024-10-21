import {Color, upgradeColor} from './color.js';
import {Writer} from './protocol.js';
import {Vector} from './vector.js';
import {joysticks, drawJoystick} from './mobile.js';
import {message} from './message.js';
import {score} from './score.js';

import {avgDataSize, dataRate, socket, entity, entities, idToEntity, world, minimap, start} from './socket.js';

const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const fadeDuration = 250;

// DEBUG
let lastRenderTime = 0;
let totalFps = 0;
let fps = 0;
let renderCount = 0;
let lastRenderUpdate = performance.now();
// END

// TOGGLE
let autoFire = false;
// END

// MOBILE
let coordinate = new Vector(0, 0);
// END

let zoom = 0.2;

const dpr = window.devicePixelRatio || 2;
const canvas = document.getElementById('canvas');

const canvasSize = {
    width: 10,
    height: 10,
};

const ctx = canvas.getContext('2d');

function resize() {
    canvas.style.width = document.body.clientWidth + 'px';
    canvas.style.height = document.body.clientHeight + 'px';

    canvas.width = document.body.clientWidth * dpr;
    canvas.height = document.body.clientHeight * dpr;

    canvasSize.width = document.body.clientWidth;
    canvasSize.height = document.body.clientHeight;

    ctx.scale(dpr, dpr);
}

window.addEventListener('resize', resize, true);

resize();

let isFiring = false;

function handleClick(x, y) {
    if (entity && entity.upgrades.length > 0 && entity.upgrades[0].startX !== undefined) {
        for (let i = 0; i < entity.upgrades.length; i++) {
            if (entity.upgrades[i].startX <= x && entity.upgrades[i].endX >= x && entity.upgrades[i].startY <= y && entity.upgrades[i].endY >= y) {
                entity.upgrades = [];
                socket.send(new Writer().writeUint(7).writeUint(i).make());

                return true;
            }
        }
    }

    return false;
}

if (!mobile) {
    canvas.addEventListener('mousemove', ({clientX, clientY}) => {
        const x = (clientX - canvasSize.width / 2) / zoom;
        const y = (clientY - canvasSize.height / 2) / zoom;

        if (isFiring || autoFire) {
            socket.send(new Writer().writeUint(4).writeBoolean(true).writeFloat(x).writeFloat(y).make());
        }

        const angle = Math.atan2(y, x);

        socket.send(new Writer().writeUint(3).writeFloat(angle).make());
    });

    canvas.addEventListener('mousedown', ({clientX, clientY}) => {
        if (handleClick(clientX, clientY)) return;

        const x = (clientX - canvasSize.width / 2) / zoom;
        const y = (clientY - canvasSize.height / 2) / zoom;

        isFiring = true;

        socket.send(new Writer().writeUint(4).writeBoolean(true).writeFloat(x).writeFloat(y).make());
    });

    canvas.addEventListener('mouseup', () => {
        isFiring = false;

        socket.send(new Writer().writeUint(4).writeBoolean(false).make());
    });
} else {
    canvas.addEventListener('touchstart', ({changedTouches}) => {
        for (const {pageX, pageY} of changedTouches) {
            if (handleClick(pageX, pageY)) break;
        }
    });

    joysticks[0].on = (event) => {
        if (event === 'move') {
            const angle = Math.atan2(joysticks[0].currentY, joysticks[0].currentX);

            socket.send(new Writer().writeUint(5).writeBoolean(true).writeFloat(angle).make());
        } else {
            socket.send(new Writer().writeUint(5).writeBoolean(false).make());
        }
    };

    joysticks[1].on = (event) => {
        if (event === 'move') {
            const x = (coordinate.x - canvasSize.width / 2) / zoom;
            const y = (coordinate.y - canvasSize.height / 2) / zoom;
            const angle = Math.atan2(y, x);

            socket.send(new Writer().writeUint(4).writeBoolean(true).writeFloat(x).writeFloat(y).make());
            socket.send(new Writer().writeUint(3).writeFloat(angle).make());
        } else {
            socket.send(new Writer().writeUint(4).writeBoolean(false).make());
        }
    };
}

window.socket = socket;

console.log(socket);

const drawGun = (entity, gun) => {
    const gunAngle = entity.angle + gun.angle;

    // P1 [-----------] P2
    //    [           ]
    // P3 [-----------] P4

    const size = entity.size / 20;
    const p1 = new Vector(entity.size + gun.offset * size, ((gun.width / 2 + gun.direction) * size) / gun.aspect).rotate(gunAngle);
    const p3 = new Vector(entity.size + gun.offset * size, ((-(gun.width / 2) + gun.direction) * size) / gun.aspect).rotate(gunAngle);
    const p2 = new Vector(entity.size + (gun.offset + gun.length) * size, (gun.width / 2 + gun.direction) * size * gun.aspect).rotate(gunAngle);
    const p4 = new Vector(entity.size + (gun.offset + gun.length) * size, (-(gun.width / 2) + gun.direction) * size * gun.aspect).rotate(gunAngle);

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.fillStyle = gun.color;
    ctx.strokeStyle = gun.border;
    ctx.globalAlpha = gun.alpha;
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.globalAlpha = 1;
};

function drawText(text, color, border, size, pos, align = 'start', isMessage = false) {
    ctx.fillStyle = color;
    if (border) ctx.strokeStyle = border;

    ctx.textAlign = align;
    ctx.font = `bold ${size.toFixed(0)}px Ubuntu`;
    ctx.lineCap = ctx.lineJoin = 'round';
    ctx.lineWidth = 4;

    if (isMessage) {
        const {width} = ctx.measureText(text);
        const padding = 8;
        const textHeight = size;

        let x = pos.x;
        let y = pos.y;

        if (align === 'center') x -= width / 2;
        else if (align === 'end') x -= width;

        ctx.fillStyle = 'rgba(128, 128, 128, 0.5)';
        ctx.fillRect(x - padding, y - textHeight / 2 - padding, width + padding * 2, textHeight + padding);

        ctx.fillStyle = color;
    }

    if (pos === 'center') {
        if (border) ctx.strokeText(text, canvasSize.width / 2, canvasSize.height / 2);
        ctx.fillText(text, canvasSize.width / 2, canvasSize.height / 2);
    } else {
        if (border) ctx.strokeText(text, pos.x, pos.y);
        ctx.fillText(text, pos.x, pos.y);
    }
}

function drawPolygon(entity) {
    let dx = Math.cos(entity.angle);
    let dy = Math.sin(entity.angle);
    for (let [x, y] of entity.sides) {
        ctx.lineTo(entity.size * (x * dx - y * dy), entity.size * (y * dx + x * dy));
    }
}

function drawPath(entity) {
    ctx.rotate(entity.angle);
    ctx.scale(entity.size, entity.size);
    let path = new Path2D(entity.sides);
    ctx.fill(path);
}

function drawCircle(entity) {
    ctx.arc(0, 0, entity.size, 0, 2 * Math.PI);
}

function drawStar(entity) {
    let sides = -entity.sides;
    const angle = entity.angle + Math.PI / entity.sides;
    let dip = 1 - 6 / sides ** 2;
    ctx.moveTo(entity.size * Math.cos(angle), entity.size * Math.sin(angle));
    for (let i = 0; i < sides; i++) {
        const htheta = ((i + 0.5) / sides) * 2 * Math.PI + angle;
        const theta = ((i + 1) / sides) * 2 * Math.PI + angle;
        ctx.quadraticCurveTo(entity.size * dip * Math.cos(htheta), entity.size * dip * Math.sin(htheta), entity.size * Math.cos(theta), entity.size * Math.sin(theta));
    }
}

function drawRegularPolygon(entity) {
    const angle = entity.angle + Math.PI / entity.sides;
    for (let i = 0; i < entity.sides + 1; i++) {
        const theta = (i * (2 * Math.PI)) / entity.sides;
        const xPos = entity.size * Math.cos(theta + angle);
        const yPos = entity.size * Math.sin(theta + angle);
        if (i === 0) ctx.moveTo(xPos, yPos);
        else ctx.lineTo(xPos, yPos);
    }
}

function drawEntityShape(obj) {
    if (!obj.isLoaded) return;

    ctx.beginPath();

    if (Array.isArray(obj.sides)) {
        drawPolygon(obj);
    } else if (typeof obj.sides === 'string') {
        drawPath(obj);
    } else if (!obj.sides) {
        drawCircle(obj);
    } else if (obj.sides < 0) {
        drawStar(obj);
    } else if (obj.sides > 0) {
        drawRegularPolygon(obj);
    }

    ctx.fill();
    ctx.stroke();
    ctx.closePath();

    if (obj !== entity) {
        if (obj.showScore) {
            drawText(obj.score, Color.Black, null, 7, new Vector(0, -obj.size - 5), 'center');
        }
        if (obj.showName) {
            drawText(obj.name, Color.Black, null, 10, new Vector(0, -obj.size - 12), 'center');
        }
    }

    if (obj.showHealth && obj.health < (obj.maxHealth || 100)) {
        const radius = 3;

        const width = obj.size * 2.3;
        const height = 3;

        const x = -(width / 2);
        const y = obj.size + height + 1;

        ctx.beginPath();
        ctx.fillStyle = Color.Black;
        ctx.roundRect(x, y, width, height, radius);
        ctx.fill();

        const fillWidth = Math.min(1, Math.max(0, obj.health / (obj.maxHealth || 100))) * width;
        ctx.beginPath();
        ctx.fillStyle = Color.Green;
        ctx.roundRect(x + 1, y + 0.75, fillWidth - 2, height - 1.5, radius);
        ctx.fill();
    }
}

const drawProp = (entity, prop) => {
    if (prop.offsetAngle === undefined) prop.offsetAngle = 0;

    prop.angle += prop.spin;

    prop.offset = prop._offset.clone().rotate(prop.offsetAngle + (prop.fixedAngle ? 0 : entity.angle));
    prop.offsetAngle += prop.spin2;

    const factor = entity.size / 20;

    const pos = prop.offset.clone().mult(factor);

    const obj = {sides: prop.sides, size: factor * prop.size, angle: prop.angle};

    ctx.save();
    ctx.translate(pos.x, pos.y);

    ctx.fillStyle = prop.color;
    ctx.strokeStyle = prop.border;
    ctx.globalAlpha = prop.alpha;

    ctx.beginPath();

    if (Array.isArray(obj.sides)) {
        drawPolygon(obj);
    } else if (typeof obj.sides === 'string') {
        drawPath(obj);
    } else if (!obj.sides) {
        drawCircle(obj);
    } else if (obj.sides < 0) {
        drawStar(obj);
    } else if (obj.sides > 0) {
        drawRegularPolygon(obj);
    }

    ctx.fill();
    ctx.stroke();
    ctx.closePath();

    ctx.globalAlpha = 1;
    ctx.restore();
};

let upgradeAngle = 0;

const renderUpgrades = () => {
    if (entity.upgrades.length > 0) {
        const rows = mobile ? 9 : 3;
        const cols = Math.ceil(entity.upgrades.length / rows);

        const cellWidth = Math.min(Math.max(canvasSize.width, canvasSize.height) * 0.1, 80);
        ctx.lineWidth = 2;

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const index = j * cols + i;
                if (index < entity.upgrades.length) {
                    const upgrade = entity.upgrades[index];
                    const color = upgradeColor[index % upgradeColor.length];

                    upgrade.angle = upgradeAngle;
                    upgrade.size = cellWidth * 0.2;
                    upgrade.isLoaded = true;

                    const startX = 10 + i * cellWidth + i * cellWidth * 0.1;
                    const startY = 10 + j * cellWidth + j * cellWidth * 0.1;

                    upgrade.startX = startX;
                    upgrade.startY = startY;
                    upgrade.endX = startX + cellWidth;
                    upgrade.endY = startY + cellWidth;

                    ctx.globalAlpha = 0.6;
                    ctx.fillStyle = color;
                    ctx.fillRect(startX, startY, cellWidth, cellWidth);
                    ctx.globalAlpha = 1;
                    ctx.strokeRect(startX, startY, cellWidth, cellWidth);

                    const centerX = startX + cellWidth / 2;
                    const centerY = startY + cellWidth / 2;

                    ctx.save();
                    ctx.translate(centerX, centerY);

                    ctx.lineWidth = 2;
                    ctx.lineJoin = 'round';

                    if (upgrade.props) {
                        for (const prop of upgrade.props.filter((prop) => prop.layer < 0)) {
                            drawProp(upgrade, prop);
                        }
                    }

                    if (upgrade.guns) {
                        for (const gun of upgrade.guns.filter((gun) => gun.layer < 0)) {
                            drawGun(upgrade, gun);
                        }
                    }

                    ctx.fillStyle = upgrade.color;
                    ctx.strokeStyle = upgrade.border;

                    drawEntityShape(upgrade);

                    if (upgrade.props) {
                        for (const prop of upgrade.props.filter((prop) => prop.layer > -1 && prop.layer < 100)) {
                            drawProp(upgrade, prop);
                        }
                    }

                    if (upgrade.guns) {
                        for (const gun of upgrade.guns.filter((gun) => gun.layer > -1)) {
                            drawGun(upgrade, gun);
                        }
                    }

                    if (upgrade.props) {
                        for (const prop of upgrade.props.filter((prop) => prop.layer > 100)) {
                            drawProp(upgrade, prop);
                        }
                    }

                    const bottomY = cellWidth * 0.42;

                    drawText(upgrade.label, Color.White, Color.Black, cellWidth * 0.12, {x: 0, y: bottomY}, 'center');

                    ctx.restore();
                }
            }
        }

        upgradeAngle += 0.01;
    }
};

const renderInfo = () => {
    const textSize = 12;

    ctx.save();

    drawText(location.host, Color.Black, Color.White, textSize + 2, {x: canvasSize.width - 10, y: canvasSize.height - 80}, 'right');

    drawText(`Client FPS: ${fps.toFixed(2)} fps`, fps < 60 ? Color.Red : Color.Black, Color.White, textSize, {x: canvasSize.width - 10, y: canvasSize.height - 60}, 'right');

    drawText(`Server Tick: ${(1000 / world.tick).toFixed(2)}`, Color.Black, Color.White, textSize, {x: canvasSize.width - 10, y: canvasSize.height - 45}, 'right');

    drawText(`Average Data Size: ${avgDataSize.toFixed(2)} bytes`, Color.Black, Color.White, textSize, {x: canvasSize.width - 10, y: canvasSize.height - 30}, 'right');

    drawText(
        `Data Rate: ${dataRate > 0 ? (dataRate / 1024).toFixed(2) : '0'} kb/s`,
        Color.Black,
        Color.White,
        textSize,
        {x: canvasSize.width - 10, y: canvasSize.height - 15},
        'right',
    );

    ctx.restore();
};

const drawMessages = () => {
    message.update();

    for (let i = 0; i < message.stack.length; i++) {
        ctx.globalAlpha = Math.min(1, 0.5 + message.stack[i].alpha);
        drawText(message.stack[i].msg, Color.Black, null, 14, {x: canvasSize.width / 2, y: 20 + i * 25}, 'center', true);
    }

    ctx.globalAlpha = 1;
};

const drawScore = () => {
    score.level = entity.level;
    score.score = entity.score;
    score.levelScore = entity.levelScore;

    score.update();

    drawText(`${entity.name}`, Color.White, Color.Black, 24, {x: canvasSize.width / 2, y: canvasSize.height - 65}, 'center', false);

    drawText(`Score: ${score.score.toFixed(0)}`, Color.White, Color.Black, 14, {x: canvasSize.width / 2, y: canvasSize.height - 45}, 'center', false);

    const radius = 10;

    const width = canvasSize.width * 0.3;
    const height = 20;
    const padding = 2;

    const x = canvasSize.width / 2 - width / 2;
    const y = canvasSize.height - 18 - height;

    ctx.beginPath();
    ctx.fillStyle = Color.Black;
    ctx.roundRect(x, y, width, height, radius);
    ctx.fill();

    const fillWidth = padding * 2 + Math.min(Math.max(0, score.scoreProgress) * (width - padding * 2), width - padding * 2);
    ctx.beginPath();
    ctx.fillStyle = Color.Gold;
    ctx.roundRect(x + padding, y + padding, fillWidth - padding * 2, height - padding * 2, radius);
    ctx.fill();

    drawText(`Level ${score.level} ${entity.label}`, Color.White, Color.Black, 14, {x: canvasSize.width / 2, y: canvasSize.height - 23}, 'center', false);
};

const drawMiniMap = () => {
    const minimapScale = 100 / Math.min(world.width, world.height);
    const minimapWidth = world.width * minimapScale;
    const minimapHeight = world.height * minimapScale;

    const minimapStartX = canvasSize.width - minimapWidth - 10;
    const minimapStartY = 10;

    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.6;
    ctx.fillStyle = Color.White;
    ctx.fillRect(minimapStartX, minimapStartY, minimapWidth, minimapHeight);
    ctx.globalAlpha = 1;
    ctx.strokeRect(minimapStartX, minimapStartY, minimapWidth, minimapHeight);

    for (const item of minimap) {
        ctx.fillStyle = item.color;
        const minimapX = minimapStartX + item.pos.x * minimapScale;
        const minimapY = minimapStartY + item.pos.y * minimapScale;

        ctx.beginPath();
        ctx.arc(minimapX, minimapY, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();
    }
};

const correction = (entity, deltaTick, t) => {
    if (!entity.vel) return;

    const interpolationFactor = deltaTick * (1000 / world.tick);
    const velocityMagnitude = Math.sqrt(entity.vel.x * entity.vel.x + entity.vel.y * entity.vel.y);

    if (velocityMagnitude > 0) {
        const finalVelocity = velocityMagnitude / (interpolationFactor + 1);

        entity.vel.x = (finalVelocity * entity.vel.x) / velocityMagnitude;
        entity.vel.y = (finalVelocity * entity.vel.y) / velocityMagnitude;

        entity.pos.x += entity.vel.x / interpolationFactor;
        entity.pos.y += entity.vel.y / interpolationFactor;

        entity.vel.x *= 1 - 0.1 / interpolationFactor;
        entity.vel.y *= 1 - 0.1 / interpolationFactor;
    }
};

const render = (timestamp) => {
    if (!entity || !world.width) return requestAnimationFrame(render);

    if (entity.health > 0) {
        const fov = Math.max(canvasSize.width, canvasSize.height) / ((entity.fov || 10) + entity.size);
        if (zoom !== fov) {
            const diff = Math.abs(zoom - fov);
            if (diff < 0.01) zoom = fov;
            else if (zoom < fov) zoom += diff / 70;
            else zoom -= diff / 70;
        }

        const deltaTime = timestamp - lastRenderTime;
        lastRenderTime = timestamp;

        totalFps += 1000 / deltaTime;

        renderCount++;

        if (performance.now() - lastRenderUpdate >= 1000) {
            fps = totalFps / renderCount;

            renderCount = 0;
            totalFps = 0;
            lastRenderUpdate = performance.now();
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.globalAlpha = 0.2;
        ctx.fillStyle = Color.Black2;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;

        ctx.save();

        ctx.scale(zoom, zoom);
        ctx.translate(canvasSize.width / 2 / zoom - entity.pos.x, canvasSize.height / 2 / zoom - entity.pos.y);

        ctx.fillStyle = Color.White;
        ctx.fillRect(0, 0, world.width, world.height);

        ctx.strokeStyle = 'rgb(0,0,0,0.1)';

        for (let y = 0; y <= world.height; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(world.width, y);
            ctx.stroke();
        }
        for (let x = 0; x <= world.width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, world.height);
            ctx.stroke();
        }
        window.entity = entity;

        for (const entity of entities) {
            const distance = Vector.distance(window.entity.pos, entity.pos);
            const fov = window.entity.fov + (window.entity.size + entity.size) / 2;

            if (distance > fov) continue;

            ctx.save();
            ctx.translate(entity.pos.x, entity.pos.y);

            if (entity.fadeStart) {
                const fadeProgress = (performance.now() - entity.fadeStart) / fadeDuration;
                if (fadeProgress >= 1) {
                    entities.delete(entity);
                    idToEntity.delete(entity.id);
                    ctx.restore();
                    continue;
                }
                ctx.globalAlpha = 1 - fadeProgress;
            } else {
                ctx.globalAlpha = entity.alpha;
            }

            ctx.lineWidth = 2;
            ctx.lineJoin = 'round';

            if (entity.props) {
                for (const prop of entity.props.filter((prop) => prop.layer < 0)) {
                    drawProp(entity, prop);
                }
            }

            if (entity.guns) {
                for (const gun of entity.guns.filter((gun) => gun.layer < 0)) {
                    drawGun(entity, gun);
                }
            }

            ctx.fillStyle = entity.color;
            ctx.strokeStyle = entity.border;

            drawEntityShape(entity);

            if (entity.props) {
                for (const prop of entity.props.filter((prop) => prop.layer > -1 && prop.layer < 100)) {
                    drawProp(entity, prop);
                }
            }

            if (entity.guns) {
                for (const gun of entity.guns.filter((gun) => gun.layer > -1)) {
                    drawGun(entity, gun);
                }
            }

            if (entity.props) {
                for (const prop of entity.props.filter((prop) => prop.layer > 100)) {
                    drawProp(entity, prop);
                }
            }

            ctx.restore();
        }

        ctx.restore();

        renderInfo();

        if (mobile) {
            drawJoystick();

            if (joysticks[1].currentX !== 0 || joysticks[1].currentY !== 0) {
                const padding = joysticks[1].radius - joysticks[1].innerRadius;

                const maxDimension = Math.max(canvasSize.width, canvasSize.height);

                const scaleFactor = maxDimension / (joysticks[1].radius * 2);

                coordinate.x = Math.max(0, Math.min(joysticks[1].currentX * scaleFactor + canvasSize.width / 2, canvasSize.width));
                coordinate.y = Math.max(0, Math.min(joysticks[1].currentY * scaleFactor + canvasSize.height / 2, canvasSize.height));
            }

            const lineLength = 20;

            ctx.save();

            ctx.lineWidth = 4;
            ctx.globalAlpha = 0.7;

            ctx.beginPath();
            ctx.strokeStyle = Color.Black;
            ctx.moveTo(coordinate.x - lineLength / 2, coordinate.y);
            ctx.lineTo(coordinate.x + lineLength / 2, coordinate.y);
            ctx.stroke();

            ctx.beginPath();
            ctx.strokeStyle = Color.Black;
            ctx.moveTo(coordinate.x, coordinate.y - lineLength / 2);
            ctx.lineTo(coordinate.x, coordinate.y + lineLength / 2);
            ctx.stroke();

            ctx.globalAlpha = 1;
            ctx.restore();
        }

        ctx.save();

        drawMessages();

        drawScore();

        drawMiniMap();

        renderUpgrades();

        ctx.restore();
    } else {
        if (socket) {
            ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

            ctx.globalAlpha = 0.2;
            ctx.fillStyle = Color.Red;
            ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
            ctx.globalAlpha = 1;

            ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

            drawText('You are Die.', Color.Black, Color.White, 40, 'center', 'center');
        }
    }

    requestAnimationFrame(render);
};

const RAFId = requestAnimationFrame(render);

document.addEventListener('keydown', ({key, code}) => {
    const msg = new Writer().writeUint(1);
    switch (key) {
        case 'e':
            if (autoFire) {
                message.add('Auto Fire disabled');
                socket.send(new Writer().writeUint(4).writeBoolean(false).make());
            } else {
                message.add('Auto Fire enabled');
            }

            autoFire = !autoFire;
            break;
        case 'ArrowUp':
        case 'w':
            socket.send(msg.writeUint(0).make());
            break;
        case 'ArrowDown':
        case 's':
            socket.send(msg.writeUint(1).make());
            break;
        case 'ArrowLeft':
        case 'a':
            socket.send(msg.writeUint(2).make());
            break;
        case 'ArrowRight':
        case 'd':
            socket.send(msg.writeUint(3).make());
            break;
    }
});

document.addEventListener('keyup', ({key, code}) => {
    const msg = new Writer().writeUint(1);
    switch (key) {
        case 'ArrowUp':
        case 'w':
            socket.send(msg.writeUint(4).make());
            break;
        case 'ArrowDown':
        case 's':
            socket.send(msg.writeUint(5).make());
            break;
        case 'ArrowLeft':
        case 'a':
            socket.send(msg.writeUint(6).make());
            break;
        case 'ArrowRight':
        case 'd':
            socket.send(msg.writeUint(7).make());
            break;
    }
});

document.querySelector('#userId').value = localStorage.getItem('userId') || '';

document.querySelector('#play').addEventListener('click', () => {
    document.querySelector('main').style.display = 'none';
    localStorage.setItem('userId', document.querySelector('#userId').value);
    start(document.querySelector('#userId').value);
});
