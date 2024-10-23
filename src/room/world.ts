import {Entity} from '../entity/entity';
import {HSHG} from '../physics/hshg';
import {Vector} from '../physics/vector';
import {RoomConfig} from './room-config';
import {EventEmitter} from 'events';

const restitution = 0.9;

export class World extends EventEmitter {
    public hshg: HSHG = new HSHG();

    public entities = new Set<Entity>();
    public idToEntity = new Map<number, Entity>();

    public walls: Entity[] = [];

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
        entity.room = this;

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
        this.tick++;

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

                const min = new Vector(entity.pos).sub(entity.size * 0.8);
                const max = new Vector(entity.pos).add(entity.size * 0.8);

                if (other.setting.bullet) {
                    other.emit('dead');
                    this.remove(other);

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
                if (entity.size + other.size < Vector.distance(entity.pos, other.pos)) {
                    continue;
                }

                this.doDamage(entity, other, false);

                if (entity.setting.bullet || other.setting.bullet) {
                    if (!(entity.setting.hardBullet && other.setting.hardBullet)) {
                        continue;
                    }
                }

                const normal = Vector.sub(other.pos, entity.pos).normalize();

                const relativeVelocity = Vector.sub(other.vel, entity.vel);
                const velocityAlongNormal = relativeVelocity.dot(normal);

                if (velocityAlongNormal > 0) {
                    continue;
                }

                const impulse = normal
                    .clone()
                    .mult(
                        (-(1 + Math.min(entity.setting.skill.pushability, other.setting.skill.pushability) * restitution) * velocityAlongNormal) /
                            (1 / entity.mass + 1 / other.mass),
                    );

                entity.vel.sub(impulse.clone().mult(1 / entity.mass));
                other.vel.add(impulse.clone().mult(1 / other.mass));
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
