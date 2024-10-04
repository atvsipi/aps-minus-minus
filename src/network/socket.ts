import {randomUUID} from 'crypto';
import {Protocol} from './protocol';
import {Entity} from '../entity/entity';
import {RoomConfig} from '../room/roomconfig';
import {room} from '../room/room';
import {Logger} from '../util/logger';
import {Classes} from '../entity/class';
import {Vector} from '../physics/vector';
import {setInterval} from 'timers';

const users = new Map<
    string,
    {
        body?: Entity;
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
                const entity = new Entity();

                entity.init(Classes.Player);

                RoomConfig.spawn(entity);

                room.insert(entity);

                users.set(uuid, {
                    body: entity,
                    send,
                });

                const msg = new Protocol.Writer();

                msg.writeUint(4);
                msg.writeFloat(RoomConfig.width);
                msg.writeFloat(RoomConfig.height);
                msg.writeFloat(RoomConfig.tick);

                send(msg.make());

                for (const obj of room.entities) {
                    if (obj === entity) continue;

                    const msg = new Protocol.Writer();

                    msg.writeUint(2);
                    EntityData(obj, msg, true);

                    send(msg.make());
                }

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
                    user.body.target = new Vector(msg.readFloat(), msg.readFloat());
                } else user.body.target = null;
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
    if (users.has(uuid)) {
        room.remove(users.get(uuid).body);
    }
}

function EntityInfo(entity: Entity, msg: Protocol.Writer) {
    msg.writeUint(entity.id);

    msg.writeUint(entity.team);

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
    msg.writeFloat(entity.angle);
    if (entity.active || entity.tick < 10 || active) {
        msg.writeBoolean(true);
        msg.writeFloat(entity.pos.x);
        msg.writeFloat(entity.pos.y);
        msg.writeFloat(entity.vel.x);
        msg.writeFloat(entity.vel.y);
    } else {
        msg.writeBoolean(false);
    }
    msg.writeFloat(entity.size);

    return msg;
}

setInterval(() => {
    for (const user of users) {
        const entity = user[1].body;

        const msg = new Protocol.Writer();

        msg.writeUint(1);
        EntityData(entity, msg);

        user[1].send(msg.make());

        for (const obj of room.entities) {
            if (obj === entity) continue;

            if (entity.lastSend.angle === entity.angle && entity.lastSend.size === entity.size && !entity.active && entity.tick > 10) entity.lastSend.angle = entity.angle;
            entity.lastSend.size = entity.size;

            const msg = new Protocol.Writer();

            msg.writeUint(2);
            EntityData(obj, msg);

            user[1].send(msg.make());
        }
    }
}, 1000 / 60);

room.on('remove', (obj: Entity) => {
    for (const user of users) {
        const msg = new Protocol.Writer();

        msg.writeUint(3);
        msg.writeUint(obj.id);

        user[1].send(msg.make());
    }
});
