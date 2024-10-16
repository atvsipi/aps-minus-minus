import {Color, numColor} from './color.js';
import {Reader, Writer} from './protocol.js';
import {Entity} from './entity.js';
import {RGBColor} from './rgb.js';
import {Team, TeamColor} from './team.js';
import {message} from './message.js';

// DEBUG
let totalDataSize = 0;
let dataCount = 0;
let lastUpdate = performance.now();
export let avgDataSize = 0;
export let dataRate = 0;
// END

export let entity;
export const entities = new Set();
export const idToEntity = new Map();
export let world = {};
let mockups = [];

let uuid = localStorage.getItem('uuid');

export let socket = new WebSocket('/?uuid=' + (uuid || '0'));
socket.binaryType = 'arraybuffer';

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

    const buffer = data;

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
            socket.binaryType = 'arraybuffer';

            socket.onmessage = socketOnMessage;

            break;

        case 1:
            let isNew = true;

            if (!entity) entity = new Entity();
            else isNew = false;

            entity.id = msg.readUint();
            entity.health = msg.readFloat();
            entity.angle = msg.readFloat();
            entity.pos.x = msg.readFloat();
            entity.pos.y = msg.readFloat();
            if (msg.readBoolean()) {
                entity.vel.x = msg.readFloat();
                entity.vel.y = msg.readFloat();
            }

            entity.score = msg.readFloat();
            entity.size = msg.readFloat();

            idToEntity.set(entity.id, entity);

            entities.add(entity);

            if (isNew) {
                socket.send(new Writer().writeUint(2).writeUint(entity.id).make());
            }
            break;

        case 2: {
            let entity;
            let isNew = false;

            const id = msg.readUint();
            if (idToEntity.has(id)) entity = idToEntity.get(id);
            else {
                entity = new Entity();
                isNew = true;
            }

            entity.id = id;
            entity.health = msg.readFloat();
            entity.angle = msg.readFloat();
            entity.pos.x = msg.readFloat();
            entity.pos.y = msg.readFloat();
            if (msg.readBoolean()) {
                entity.vel.x = msg.readFloat();
                entity.vel.y = msg.readFloat();
            }

            entity.score = msg.readFloat();
            entity.size = msg.readFloat();

            idToEntity.set(id, entity);
            entities.add(entity);

            if (isNew) {
                socket.send(new Writer().writeUint(2).writeUint(id).make());
            }
            break;
        }

        case 3: {
            const id = msg.readUint();
            const entity = idToEntity.get(id);

            if (entity) {
                entity.fadeStart = performance.now();
            }
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

            obj.mockupId = msg.readUint();

            if (mockups[obj.mockupId]) {
                obj.sides = mockups[obj.mockupId].sides;
                obj.guns = mockups[obj.mockupId].guns;
                obj.isLoaded = true;
            } else {
                socket.send(new Writer().writeUint(6).writeUint(obj.id).make());
            }

            break;
        }

        case 8: {
            const id = msg.readUint();
            const obj = idToEntity.has(id) ? idToEntity.get(id) : entity;

            if (!obj) break;

            obj.label = msg.readString();

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

            if (obj.mockupId !== 0)
                mockups[obj.mockupId] = {
                    sides: obj.sides,
                    guns: obj.guns,
                };

            obj.isLoaded = true;

            break;
        }

        case 6: {
            entity.score = msg.readFloat();
            entity.level = msg.readInt();
            entity.levelScore = msg.readFloat();

            break;
        }

        case 7: {
            message.add(msg.readString());
        }
    }
};

socket.onmessage = socketOnMessage;
