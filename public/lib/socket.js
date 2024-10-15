import {Color, numColor} from './color.js';
import {Reader, Writer} from './protocol.js';
import {RGBColor} from './rgb.js';
import {Team, TeamColor} from './team.js';
import {Vector} from './vector.js';
import {message} from './message.js';

import {addGrid, addEntity, addEntityInfo} from './draw.js';

// DEBUG
let totalDataSize = 0;
let dataCount = 0;
let lastUpdate = performance.now();
export let avgDataSize = 0;
export let dataRate = 0;
// END

export let entity;
export const entities = new Set();
const idToEntity = new Map();
export let world = {};
let mockups = [];

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

            const score = entity.score;
            entity.score = msg.readFloat();
            const size = entity.size;
            entity.size = msg.readFloat();

            if (isNew) {
                idToEntity.set(entity.id, entity);
                entities.add(entity);
                socket.send(new Writer().writeUint(2).writeUint(entity.id).make());
            } else {
                if (size !== entity.size) {
                    addEntity(entity);
                }
                if (score !== entity.score) {
                    addEntityInfo(entity);
                }
            }
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
            const score = entity.score;
            entity.score = msg.readFloat();
            const size = entity.size;
            entity.size = msg.readFloat();

            if (isNew) {
                idToEntity.set(id, entity);
                entities.add(entity);
                socket.send(new Writer().writeUint(2).writeUint(id).make());
            } else {
                if (size !== entity.size) {
                    addEntity(entity);
                }
                if (score !== entity.score) {
                    addEntityInfo(entity);
                }
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
            addGrid(world);
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

                addEntity(obj);
            } else {
                socket.send(new Writer().writeUint(6).writeUint(obj.id).make());
            }

            break;
        }

        case 8: {
            const id = msg.readUint();
            const obj = idToEntity.has(id) ? idToEntity.get(id) : entity;

            if (!obj) break;

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

            addEntity(obj);

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

socket.onopen = () => {
    console.log('Opened');
};
