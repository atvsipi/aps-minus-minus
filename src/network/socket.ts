import {randomUUID} from 'crypto';
import {Protocol} from './protocol';
import {Entity} from '../entity/entity';
import {RoomConfig} from '../room/roomconfig';
import {room} from '../room/room';
import {Logger} from '../util/logger';
import {EntityClass} from '../entity/class';
import {Vector} from '../physics/vector';
import {setInterval} from 'timers';

const users = new Map<
    string,
    {
        body?: Entity;
        timeout?: number;
        send: (msg: Uint8Array | string) => void;
    }
>();

export function message(uuid: string, data: Uint8Array, send: (msg: Uint8Array | string) => void) {
    try {
        if (uuid === '0') {
            uuid = randomUUID();

            send(new Protocol.Writer().writeUint(0).writeString(uuid).make());

            return;
        }

        const msg = new Protocol.Reader(data);

        switch (msg.readUint()) {
            // Spawn request
            case 0: {
                let entity: Entity;
                if (users.has(uuid) && !(entity = users.get(uuid).body).die) {
                    users.get(uuid).timeout = 0;
                } else {
                    entity = new Entity();

                    entity.init(EntityClass.Player);

                    RoomConfig.spawn(entity);

                    room.insert(entity);
                }

                entity.socket = {
                    send,
                    sendMsg(str: string) {
                        const msg = new Protocol.Writer();

                        msg.writeUint(7);
                        msg.writeString(str);

                        send(msg.make());
                    },
                };

                users.set(uuid, {
                    body: entity,
                    send,
                });

                const msg = new Protocol.Writer();

                msg.writeUint(4);
                msg.writeFloat(RoomConfig.width);
                msg.writeFloat(RoomConfig.height);
                msg.writeFloat(RoomConfig.socketTick);

                send(msg.make());

                for (const obj of room.entities) {
                    if (obj === entity) continue;

                    const msg = new Protocol.Writer();

                    msg.writeUint(2);
                    EntityData(obj, msg, true);

                    send(msg.make());
                }

                entity.socket.sendMsg(RoomConfig.welcomeMessage);

                break;
            }

            // Move
            case 1: {
                if (!users.has(uuid)) break;

                const user = users.get(uuid);

                if (!user.body) break;

                const move = msg.readUint();

                switch (move) {
                    case 0:
                        user.body.move.add(0);
                        break;

                    case 1:
                        user.body.move.add(1);
                        break;

                    case 2:
                        user.body.move.add(2);
                        break;

                    case 3:
                        user.body.move.add(3);
                        break;

                    case 4:
                        user.body.move.delete(0);
                        break;

                    case 5:
                        user.body.move.delete(1);
                        break;

                    case 6:
                        user.body.move.delete(2);
                        break;

                    case 7:
                        user.body.move.delete(3);
                        break;
                }

                break;
            }

            // Want info!
            case 2: {
                const id = msg.readUint();

                const entity = room.idToEntity.get(id);

                if (entity) send(EntityInfo(entity, new Protocol.Writer().writeUint(5)).make());
                break;
            }

            // Angle
            case 3: {
                if (!users.has(uuid)) break;

                const user = users.get(uuid);

                if (!user.body) break;

                user.body.angle = msg.readFloat();
                break;
            }

            // Target
            case 4: {
                if (!users.has(uuid)) break;

                const user = users.get(uuid);

                if (!user.body) break;

                if (msg.readBoolean()) {
                    user.body.control.fire = true;
                    user.body.control.target = new Vector(msg.readFloat(), msg.readFloat());
                    user.body.source = user.body.control.target.clone();
                } else {
                    user.body.control.fire = false;
                    user.body.source = null;
                }
                break;
            }

            // Angle move
            case 5: {
                if (!users.has(uuid)) break;

                const user = users.get(uuid);

                if (!user.body) break;

                user.body.moveAngle = msg.readBoolean() ? msg.readFloat() : null;
                break;
            }

            // mockup
            case 6: {
                const id = msg.readUint();

                const entity = room.idToEntity.get(id);

                if (entity) send(EntityMockup(entity, new Protocol.Writer().writeUint(8)).make());
                break;
            }

            default:
                send("I can't understand :(");
                break;
        }
    } catch (err) {
        Logger.error(err);
    }
}

export function isValidUUID(uuid: string) {
    return true;
}

export function close(uuid: string) {
    if (users.has(uuid)) users.get(uuid).timeout = performance.now();
}

function EntityInfo(entity: Entity, msg: Protocol.Writer) {
    msg.writeUint(entity.id);

    msg.writeUint(entity.team);

    msg.writeFloat(entity.setting.skill.health);

    msg.writeBoolean(entity.setting.showHealth);
    msg.writeBoolean(entity.setting.showName);
    msg.writeBoolean(entity.setting.showScore);
    msg.writeFloat(entity.setting.skill.fov);
    msg.writeString(entity.name);

    if (typeof entity.color === 'string') {
        msg.writeUint(0);
        msg.writeString(entity.color);
    } else {
        msg.writeUint(1);
        msg.writeUint(entity.color);
    }

    if (typeof entity.border === 'string') {
        msg.writeUint(0);
        msg.writeString(entity.border);
    } else {
        msg.writeUint(1);
        msg.writeUint(entity.border);
    }

    msg.writeUint(entity.mockupId);

    return msg;
}

function EntityMockup(entity: Entity, msg: Protocol.Writer) {
    msg.writeUint(entity.id);

    if (typeof entity.setting.sides === 'string') {
        msg.writeUint(0);
        msg.writeString(entity.setting.sides);
    } else if (typeof entity.setting.sides === 'object') {
        msg.writeUint(2 + entity.setting.sides.length);
        for (let i = 0; i < entity.setting.sides.length; i++) {
            msg.writeFloat(entity.setting.sides[i].x);
            msg.writeFloat(entity.setting.sides[i].y);
        }
    } else {
        msg.writeUint(1);
        msg.writeInt(entity.setting.sides);
    }

    msg.writeUint(entity.guns.length);

    for (const gun of entity.guns) {
        msg.writeFloat(gun.setting.offset);
        msg.writeFloat(gun.setting.direction);
        msg.writeFloat(gun.setting.length);
        msg.writeFloat(gun.setting.width);
        msg.writeFloat(gun.setting.aspect);
        msg.writeFloat(gun.setting.angle);
        if (typeof gun.setting.color === 'string') {
            msg.writeUint(0);
            msg.writeString(gun.setting.color);
        } else {
            msg.writeUint(1);
            msg.writeUint(gun.setting.color);
        }
        if (typeof gun.setting.border === 'string') {
            msg.writeUint(0);
            msg.writeString(gun.setting.border);
        } else {
            msg.writeUint(1);
            msg.writeUint(gun.setting.border);
        }
        msg.writeFloat(gun.setting.strokeWidth);
        msg.writeFloat(gun.setting.alpha);
        msg.writeInt(gun.setting.layer);
    }

    return msg;
}

function EntityData(entity: Entity, msg: Protocol.Writer, active: boolean = false) {
    msg.writeUint(entity.id);
    msg.writeFloat(entity.health);
    msg.writeFloat(entity.angle);
    msg.writeFloat(entity.pos.x);
    msg.writeFloat(entity.pos.y);
    if (entity.active || entity.tick < 10 || active) {
        msg.writeBoolean(true);
        msg.writeFloat(entity.vel.x);
        msg.writeFloat(entity.vel.y);
    } else {
        msg.writeBoolean(false);
    }
    msg.writeFloat(entity.score);
    msg.writeFloat(entity.size);

    return msg;
}

setInterval(() => {
    const changed = new Set<Entity>();
    for (const user of users) {
        const entity = user[1].body;

        if (user[1].timeout && user[1].timeout > RoomConfig.socketTimeout) {
            room.remove(entity);
            users.delete(user[0]);

            continue;
        }

        const msg = new Protocol.Writer();

        msg.writeUint(1);
        EntityData(entity, msg);

        user[1].send(msg.make());

        if (entity.tick % 20 === 0) {
            msg.reset();

            msg.writeUint(6);
            msg.writeFloat(entity.score);
            msg.writeInt(entity.level);
            msg.writeFloat(entity.levelScore);

            user[1].send(msg.make());
        }

        for (const obj of room.entities) {
            if (obj === entity) continue;

            if (!Entity.isEntityVisible(entity, obj)) continue;

            /*if (entity.lastSend.angle === entity.angle && entity.lastSend.size === entity.size && !entity.active && entity.tick > 10) {
                entity.lastSend.angle = entity.angle;
                entity.lastSend.size = entity.size;
            }*/

            msg.reset();

            msg.writeUint(2);
            EntityData(obj, msg);

            user[1].send(msg.make());

            if (entity.changed) {
                msg.reset();

                msg.writeUint(5);
                EntityInfo(obj, msg);

                user[1].send(msg.make());
                changed.add(entity);
            }
        }
    }

    for (const entity of changed) entity.changed = false;
}, RoomConfig.socketTick);

room.on('remove', (obj: Entity) => {
    for (const user of users) {
        const msg = new Protocol.Writer();

        msg.writeUint(3);
        msg.writeUint(obj.id);

        user[1].send(msg.make());
    }
});

room.socket = {
    send(msg: Uint8Array) {
        for (const user of users) user[1].send(msg);
    },
    sendMsg(msg: string) {
        for (const user of users) user[1].body.socket.sendMsg(msg);
    },
};
