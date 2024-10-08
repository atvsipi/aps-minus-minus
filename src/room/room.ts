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

        entity.die = true;

        this.emit('remove', entity);
    }

    protected doDamage(entity: Entity, other: Entity, god: boolean) {
        if (Entity.isSameTeam(entity, other)) return;

        other.skill.health -= entity.skill.values.bodyDamage * 7;
        other.emit('damage', entity.skill.values.bodyDamage * 7);
        if (other.skill.health <= 0) {
            other.emit('dead', entity);
            this.remove(other);
        }

        if (!god) {
            entity.skill.health -= other.skill.values.bodyDamage * 7;
            entity.emit('damage', other.skill.values.bodyDamage * 7);
            if (entity.skill.health <= 0) {
                entity.emit('dead', other);
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

            if (entity.setting.isFixed || other.setting.isFixed) {
                if (other.setting.isFixed) [entity, other] = [other, entity];
                if (other.setting.isFixed) continue;
                if (other.setting.airplane) continue;

                const min = new Vector(entity.pos).sub(entity.size);
                const max = new Vector(entity.pos).add(entity.size);

                if (other.pos.x < max.x && other.pos.x > min.x) {
                    if (other.pos.y < max.y && other.pos.y > min.y) {
                        if (other.setting.bullet) {
                            room.remove(other);

                            continue;
                        }

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
                    }
                }

                this.doDamage(entity, other, true);
            } else {
                this.doDamage(entity, other, false);

                if (entity.setting.bullet || other.setting.bullet) {
                    continue;
                }

                const correctionVector = Vector.sub(other.pos, entity.pos)
                    .normalize()
                    .mult((entity.size + other.size - Vector.distance(entity.pos, other.pos)) / 2);

                other.pos.add(correctionVector);
                entity.pos.sub(correctionVector);

                const normal = Vector.sub(other.pos, entity.pos).normalize();

                const u1 = entity.vel.x * normal.x + entity.vel.y * normal.y;
                const u2 = other.vel.x * normal.x + other.vel.y * normal.y;

                const normalVel1 = Vector.mult(normal, u1);
                const normalVel2 = Vector.mult(normal, u2);

                const mass1 = entity.mass;
                const mass2 = other.mass;

                entity.vel = Vector.add(normalVel1.normalize().mult((2 * mass2 * u2 + u1 * (mass1 - 1 * mass2)) / (mass1 + mass2)), Vector.sub(entity.vel, normalVel1));
                other.vel = Vector.add(normalVel2.normalize().mult((2 * mass1 * u1 + u2 * (mass2 - 1 * mass1)) / (mass1 + mass2)), Vector.sub(other.vel, normalVel2));
            }
        }

        for (const entity of this.entities) {
            entity.update();
            RoomConfig.physics(entity);
        }
    }
}

export const room = new RoomLoop();