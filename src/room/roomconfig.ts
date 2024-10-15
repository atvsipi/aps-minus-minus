import {Entity} from '../entity/entity';

export const RoomConfig = {
    height: 1000,
    width: 1000,
    tick: 1000 / 60,
    socketTick: 1000 / 40,
    runSpeed: 1.2,
    maxGiveScore: 99999999,
    socketTimeout: 1000 * 60,
    welcomeMessage: `You have spawned! Welcome to the game.\nPlease report any bugs you encounter!`,
    spawn(entity: Entity) {
        entity.pos.x = Math.random() * this.height;
        entity.pos.y = Math.random() * this.width;
    },
    levelScore(level: number) {
        return Math.ceil(level ** 3 * 0.3);
    },
    physics(entity: Entity) {
        if (entity.setting.bullet && !entity.setting.hardBullet) return;

        if (entity.pos.x < 0 || entity.pos.x > this.width || entity.pos.y < 0 || entity.pos.y > this.height) {
            if (entity.pos.x < 0) {
                entity.vel.x -= entity.pos.x / 50;
            } else if (entity.pos.x > this.width) {
                entity.vel.x -= entity.pos.clone().sub(this.width).x / 50;
            }

            if (entity.pos.y < 0) {
                entity.vel.y -= entity.pos.y / 50;
            } else if (entity.pos.y > this.height) {
                entity.vel.y -= entity.pos.clone().sub(this.height).y / 50;
            }
        }
    },
};
