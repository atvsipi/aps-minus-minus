import {Color, numColor} from './color.js';
import {Reader, Writer} from './protocol.js';
import {RGBColor} from './rgb.js';
import {Team, TeamColor} from './team.js';
import {Vector} from './vector.js';
import {joysticks, drawJoystick} from './mobile.js';

const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

const fadeDuration = 250;

// DEBUG
let totalDataSize = 0;
let dataCount = 0;
let lastUpdate = performance.now();
let avgDataSize = 0;
let dataRate = 0;
let lastRenderTime = 0;
let totalFps = 0;
let fps = 0;
let renderCount = 0;
let lastRenderUpdate = performance.now();
// END

// MOBILE
let coordinate = new Vector(0, 0);
// END

let entity;
const entities = new Set();
const idToEntity = new Map();
let world = {};

let zoom = 0.2;

let tick = 0;
let msgTick = 0;

const canvas = document.getElementById('canvas');

window.addEventListener(
    'resize',
    (e) => {
        canvas.width = document.body.clientWidth;
        canvas.height = document.body.clientHeight;
    },
    true,
);

canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;

const ctx = canvas.getContext('2d');

let uuid = localStorage.getItem('uuid');

let socket = new WebSocket('/?uuid=' + (uuid || '0'));

const decodeColor = (msg, team) => {
    let color;

    if (msg.readUint() === 0) {
        color = msg.readString();
    } else {
        color = numColor[msg.readUint()];
    }

    if (color === 'TeamColor') color = TeamColor[Team[team]];

    if (color === 'FFA') color = team === entity.team ? Color.Blue : Color.Green;

    return color;
};

const decodeBorder = (msg, team, color) => {
    let border;

    if (msg.readUint() === 0) {
        border = msg.readString();
    } else {
        border = numColor[msg.readUint()];
    }

    if (border === 'TeamColor') border = TeamColor[Team[team]];
    else if (border === 'AutoBorder') border = RGBColor.fromHex(color).mix(RGBColor.fromHex(Color.Black), 0.7).hex;

    if (color === 'FFA') color = team === entity.team ? Color.Blue : Color.Green;

    return border;
};

const socketOnMessage = async ({data}) => {
    if (data === 'w') {
        socket.send(new Writer().writeUint(0).make());

        return;
    }

    if (typeof data === 'string') throw new Error(data);

    const buffer = await data.arrayBuffer();

    const msg = new Reader(buffer);
    totalDataSize += buffer.byteLength;
    dataCount++;

    const currentTime = performance.now();

    if (currentTime - lastUpdate >= 1000) {
        avgDataSize = totalDataSize / dataCount;
        dataRate = totalDataSize / ((currentTime - lastUpdate) / 1000);

        totalDataSize = 0;
        dataCount = 0;
        lastUpdate = currentTime;
    }

    switch (msg.readUint()) {
        case 0:
            socket.close();

            uuid = msg.readString();

            localStorage.setItem('uuid', uuid);

            socket = new WebSocket('/?uuid=' + uuid);

            socket.onmessage = socketOnMessage;

            break;

        case 1:
            let isNew = true;

            if (!entity) entity = {};
            else isNew = false;

            entity.id = msg.readUint();
            entity.health = msg.readFloat();
            entity.angle = msg.readFloat();
            entity.pos = new Vector(msg.readFloat(), msg.readFloat());
            if (msg.readBoolean()) {
                entity.vel = new Vector(msg.readFloat(), msg.readFloat());
            }
            entity.score = msg.readFloat();
            entity.size = msg.readFloat();

            idToEntity.set(entity.id, entity);

            entities.add(entity);

            if (isNew) {
                socket.send(new Writer().writeUint(2).writeUint(entity.id).make());
            }

            msgTick = tick;
            break;

        case 2: {
            let entity = {};
            let isNew = false;

            const id = msg.readUint();
            if (idToEntity.has(id)) entity = idToEntity.get(id);
            else isNew = true;

            entity.id = id;
            entity.health = msg.readFloat();
            entity.angle = msg.readFloat();
            entity.pos = new Vector(msg.readFloat(), msg.readFloat());
            if (msg.readBoolean()) {
                entity.vel = new Vector(msg.readFloat(), msg.readFloat());
            }
            entity.score = msg.readFloat();
            entity.size = msg.readFloat();

            idToEntity.set(id, entity);
            entities.add(entity);

            if (isNew) {
                socket.send(new Writer().writeUint(2).writeUint(id).make());
            }

            msgTick = tick;
            break;
        }

        case 3: {
            const id = msg.readUint();
            const entity = idToEntity.get(id);

            if (entity) {
                entity.fadeStart = performance.now();
            }

            msgTick = tick;
            break;
        }

        case 4: {
            world.width = msg.readFloat();
            world.height = msg.readFloat();
            world.tick = msg.readFloat();
            break;
        }

        case 5: {
            const id = msg.readUint();
            const obj = idToEntity.has(id) ? idToEntity.get(id) : entity;

            if (!obj) break;

            obj.team = msg.readUint();

            obj.maxHealth = msg.readFloat();

            obj.showHealth = msg.readBoolean();
            obj.showName = msg.readBoolean();
            obj.showScore = msg.readBoolean();

            obj.fov = msg.readFloat();

            obj.name = msg.readString();

            obj.color = decodeColor(msg, obj.team);
            obj.border = decodeBorder(msg, obj.team, obj.color);

            const type = msg.readUint();
            if (type === 0) {
                obj.sides = msg.readString();
            } else if (type === 1) {
                obj.sides = msg.readInt();
            } else {
                const length = type - 2;

                obj.sides = [];

                for (let i = 0; i < length; i++) {
                    obj.sides.push([msg.readFloat(), msg.readFloat()]);
                }
            }

            obj.guns = [];

            const length = msg.readUint();

            for (let i = 0; i < length; i++) {
                let color;
                obj.guns.push({
                    offset: msg.readFloat(),
                    direction: msg.readFloat(),
                    length: msg.readFloat(),
                    width: msg.readFloat(),
                    aspect: msg.readFloat(),
                    angle: msg.readFloat(),
                    color: (color = decodeColor(msg, obj.team)),
                    border: decodeBorder(msg, obj.team, color),
                    strokeWidth: msg.readFloat(),
                    alpha: msg.readFloat(),
                    layer: msg.readInt(),
                });
            }

            break;
        }

        case 6: {
            entity.score = msg.readFloat();
            entity.level = msg.readInt();
            entity.levelScore = msg.readFloat();

            break;
        }
    }
};

socket.onmessage = socketOnMessage;

socket.onopen = () => {
    console.log('Opened');
};

let isFiring = false;

if (!mobile) {
    canvas.addEventListener('mousemove', ({clientX, clientY}) => {
        const rect = canvas.getBoundingClientRect();

        const x = (clientX - rect.left - canvas.width / 2) / zoom;
        const y = (clientY - rect.top - canvas.height / 2) / zoom;

        if (isFiring) {
            socket.send(new Writer().writeUint(4).writeBoolean(true).writeFloat(x).writeFloat(y).make());
        }

        const angle = Math.atan2(y, x);

        socket.send(new Writer().writeUint(3).writeFloat(angle).make());
    });

    canvas.addEventListener('mousedown', ({clientX, clientY}) => {
        const rect = canvas.getBoundingClientRect();

        const x = (clientX - rect.left - canvas.width / 2) / zoom;
        const y = (clientY - rect.top - canvas.height / 2) / zoom;

        isFiring = true;

        socket.send(new Writer().writeUint(4).writeBoolean(true).writeFloat(x).writeFloat(y).make());
    });

    canvas.addEventListener('mouseup', () => {
        isFiring = false;

        socket.send(new Writer().writeUint(4).writeBoolean(false).make());
    });
} else {
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
            const rect = canvas.getBoundingClientRect();

            const x = (coordinate.x - rect.left - canvas.width / 2) / zoom;
            const y = (coordinate.y - rect.top - canvas.height / 2) / zoom;
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
    const p1 = new Vector(entity.size + gun.offset * size, ((gun.width / 2) * size) / gun.aspect).rotate(gunAngle);
    const p3 = new Vector(entity.size + gun.offset * size, -(((gun.width / 2) * size) / gun.aspect)).rotate(gunAngle);
    const p2 = new Vector(entity.size + (gun.offset + gun.length) * size, ((gun.width * size) / 2) * gun.aspect).rotate(gunAngle);
    const p4 = new Vector(entity.size + (gun.offset + gun.length) * size, -(((gun.width * size) / 2) * gun.aspect)).rotate(gunAngle);

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(p1.x, p1.y);
    ctx.fillStyle = gun.color;
    ctx.strokeStyle = gun.border;
    ctx.globalAlpha = gun.alpha;
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.globalAlpha = 1;
};

function drawText(text, color, border, size, pos, align = 'start') {
    ctx.fillStyle = color;
    if (border) ctx.strokeStyle = border;

    ctx.textAlign = align;
    ctx.font = `bold ${size.toFixed(0)}px Ubuntu`;
    ctx.lineCap = ctx.lineJoin = 'round';
    ctx.lineWidth = 4;

    if (pos === 'center') {
        if (border) ctx.strokeText(text, canvas.width / 2, canvas.height / 2);
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
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

        const fillWidth = (obj.health / (obj.maxHealth || 100)) * width;
        ctx.beginPath();
        ctx.fillStyle = Color.Green;
        ctx.roundRect(x + 1, y + 0.75, fillWidth - 2, height - 1.5, radius);
        ctx.fill();
    }
}

function drawEntityShapeToOffscreenCanvas(offscreenCanvas, offscreenCtx, obj) {
    offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);

    const {hp, size, score, name, angle, ...rest} = obj;
    const modifiedObj = {...rest, size: 1, angle: 0};

    offscreenCtx.beginPath();

    if (Array.isArray(modifiedObj.sides)) {
        drawPolygon(modifiedObj);
    } else if (typeof modifiedObj.sides === 'string') {
        drawPath(modifiedObj);
    } else if (!modifiedObj.sides) {
        drawCircle(modifiedObj);
    } else if (modifiedObj.sides < 0) {
        drawStar(modifiedObj);
    } else if (modifiedObj.sides > 0) {
        drawRegularPolygon(modifiedObj);
    }

    offscreenCtx.fill();
    offscreenCtx.stroke();
    offscreenCtx.closePath();
}

const renderDataInfo = () => {
    const textSize = 12;

    ctx.save();

    drawText(`Client FPS: ${fps.toFixed(2)} fps`, fps < 60 ? Color.Red : Color.Black, Color.White, textSize, {x: canvas.width - 10, y: canvas.height - 60}, 'right');

    drawText(`Server Tick: ${(1000 / world.tick).toFixed(2)}`, Color.Black, Color.White, textSize, {x: canvas.width - 10, y: canvas.height - 45}, 'right');

    drawText(`Average Data Size: ${avgDataSize.toFixed(2)} bytes`, Color.Black, Color.White, textSize, {x: canvas.width - 10, y: canvas.height - 30}, 'right');

    drawText(`Data Rate: ${dataRate > 0 ? (dataRate / 1024).toFixed(2) : '0'} kb/s`, Color.Black, Color.White, textSize, {x: canvas.width - 10, y: canvas.height - 15}, 'right');

    ctx.restore();
};

const correction = (entity, deltaTick, t) => {
    if (!entity.vel) return;

    const interpolationFactor = deltaTick * (world.tick / t);
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
        const fov = Math.max(canvas.width, canvas.height) / ((entity.fov || 10) + entity.size);
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

        const t = performance.now() - timestamp;

        const deltaTick = tick++ - msgTick;

        if (deltaTick > 0) correction(entity, deltaTick, t);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.globalAlpha = 0.2;
        ctx.fillStyle = Color.Black2;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;

        ctx.save();

        ctx.scale(zoom, zoom);
        ctx.translate(canvas.width / 2 / zoom - entity.pos.x, canvas.height / 2 / zoom - entity.pos.y);

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
            if (deltaTick > 0) correction(entity, deltaTick, t);

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
                ctx.globalAlpha = 1;
            }

            ctx.lineWidth = 2;
            ctx.lineJoin = 'round';

            if (entity.guns) {
                for (const gun of entity.guns.filter((gun) => gun.layer < 0)) {
                    drawGun(entity, gun);
                }
            }

            ctx.fillStyle = entity.color;
            ctx.strokeStyle = entity.border;

            drawEntityShape(entity);

            if (entity.guns) {
                for (const gun of entity.guns.filter((gun) => gun.layer > -1).sort((a, b) => a.layer - b.layer)) {
                    drawGun(entity, gun);
                }
            }

            ctx.restore();
        }

        ctx.restore();

        renderDataInfo();

        if (mobile) {
            drawJoystick();

            if (joysticks[1].currentX !== 0 || joysticks[1].currentY !== 0) {
                const padding = joysticks[1].radius - joysticks[1].innerRadius;

                const maxDimension = Math.max(canvas.width, canvas.height);

                const scaleFactor = maxDimension / (joysticks[1].radius * 2);

                coordinate.x = Math.max(0, Math.min(joysticks[1].currentX * scaleFactor + canvas.width / 2, canvas.width));
                coordinate.y = Math.max(0, Math.min(joysticks[1].currentY * scaleFactor + canvas.height / 2, canvas.height));
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
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.globalAlpha = 0.2;
        ctx.fillStyle = Color.Red;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;

        ctx.fillRect(0, 0, canvas.width, canvas.height);

        drawText('You are Die.', Color.Black, Color.White, 40, 'center', 'center');
    }

    requestAnimationFrame(render);
};

const RAFId = requestAnimationFrame(render);

document.addEventListener('keydown', ({key, code}) => {
    const msg = new Writer().writeUint(1);
    switch (key) {
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
