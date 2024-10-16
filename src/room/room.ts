import {Entity} from '../entity/entity';
import {HSHG} from '../physics/hshg';
import {Vector} from '../physics/vector';
import {RoomConfig} from './roomconfig';
import {EventEmitter} from 'events';

export class RoomLoop extends EventEmitter {
    public hshg: HSHG = new HSHG();

    public entities = new Set<Entity>();
    public idToEntity = new Map<number, Entity>();

    public index: number = 0;

    public tick: number = 0;

    public socket: {
        send: (msg: Uint8Array) => void;
        sendMsg: (msg: string) => void;
    } = {
        send: () => void 0,
        sendMsg: () => void 0,
    };

    public miniMap: Set<Entity> = new Set();

    public insert(entity: Entity) {
        this.entities.add(entity);
        this.hshg.addObject(entity);

        entity.id = this.index++;

        this.idToEntity.set(entity.id, entity);

        this.emit('insert', entity);
    }

    public remove(entity: Entity) {
        this.entities.delete(entity);
        this.hshg.removeObject(entity);

        this.idToEntity.delete(entity.id);

        this.miniMap.delete(entity);

        entity.die = true;

        this.emit('remove', entity);
    }

    protected giveScore(entity: Entity, other: Entity) {
        if (!other.setting.giveScore) return;

        const score = other.setting.food ? other.score : Math.min(other.score, RoomConfig.maxGiveScore);

        entity.topMaster.score += score;

        if (other.setting.killMessage !== false) {
            entity.topMaster.socket.sendMsg(other.setting.killMessage === true ? `You killed ${other.title}.` : other.setting.killMessage);
        }
    }

    protected doDamage(entity: Entity, other: Entity, god: boolean) {
        if (Entity.isSameTeam(entity, other)) return;

        other.health -= entity.setting.skill.damage;
        other.emit('damage', entity.setting.skill.damage);
        other.lastTickAttacked = other.tick;
        if (other.health <= 0) {
            other.emit('dead', entity);

            if (!other.die) this.giveScore(entity, other);

            this.remove(other);
        }

        if (!god) {
            entity.health -= other.setting.skill.damage;
            entity.emit('damage', other.setting.skill.damage);
            entity.lastTickAttacked = entity.tick;
            if (entity.health <= 0) {
                entity.emit('dead', other);

                if (!entity.die) this.giveScore(other, entity);

                this.remove(entity);
            }
        }
    }

    public update() {
        this.emit('tick');

        this.hshg.update();

        for (const [objA, objB] of this.hshg.queryForCollisionPairs()) {
            let entity = objA as Entity;
            let other = objB as Entity;

            if (entity.setting.hitType !== 'auto' || other.setting.hitType !== 'auto') {
                if (other.setting.hitType !== 'auto') [entity, other] = [other, entity];

                this.doDamage(entity, other, false);

                if (entity.setting.hitType === 'none' || other.setting.hitType === 'none') {
                    continue;
                }

                if (typeof entity.setting.hitType === 'function') entity.setting.hitType(other);

                if (typeof other.setting.hitType === 'function') other.setting.hitType(entity);

                continue;
            }

            if (entity.setting.isFixed || other.setting.isFixed) {
                if (other.setting.isFixed) [entity, other] = [other, entity];
                if (other.setting.isFixed) continue;
                if (other.setting.airplane) continue;

                const min = new Vector(entity.pos).sub(entity.size);
                const max = new Vector(entity.pos).add(entity.size);

                if (other.setting.bullet) {
                    other.emit('dead');
                    room.remove(other);

                    continue;
                }

                this.doDamage(entity, other, true);

                if (Math.abs(other.pos.x - entity.pos.x) < Math.abs(other.pos.y - entity.pos.y)) {
                    if (other.pos.y < entity.pos.y) {
                        other.pos.y = min.y;
                    } else {
                        other.pos.y = max.y;
                    }
                } else {
                    if (other.pos.x < entity.pos.x) {
                        other.pos.x = min.x;
                    } else {
                        other.pos.x = max.x;
                    }
                }
            } else {
                this.doDamage(entity, other, false);

                if (!(entity.setting.hardBullet && other.setting.hardBullet)) {
                    continue;
                }

                /*const correctionVector = Vector.sub(other.pos, entity.pos)
                    .normalize()
                    .mult((entity.size + other.size - Vector.distance(entity.pos, other.pos)) / 2);

                other.pos.add(correctionVector);
                entity.pos.sub(correctionVector);*/

                const normal = Vector.sub(other.pos, entity.pos).normalize();

                const u1 = entity.vel.x * normal.x + entity.vel.y * normal.y;
                const u2 = other.vel.x * normal.x + other.vel.y * normal.y;

                const normalVel1 = Vector.mult(normal, u1);
                const normalVel2 = Vector.mult(normal, u2);

                const mass1 = entity.mass;
                const mass2 = other.mass;

                entity.vel = Vector.add(normalVel1.normalize().mult((2 * mass2 * u2 + u1 * (mass1 - 1 * mass2)) / (mass1 + mass2)), Vector.sub(entity.vel, normalVel1)).mult(
                    other.setting.skill.pushability,
                );
                other.vel = Vector.add(normalVel2.normalize().mult((2 * mass1 * u1 + u2 * (mass2 - 1 * mass1)) / (mass1 + mass2)), Vector.sub(other.vel, normalVel2)).mult(
                    entity.setting.skill.pushability,
                );
            }
        }

        for (const entity of this.entities) {
            entity.update();
            RoomConfig.physics(entity);

            if (entity.setting.miniMapType === 'none') this.miniMap.delete(entity);
            else this.miniMap.add(entity);
        }
    }
}

export const room = new RoomLoop();
