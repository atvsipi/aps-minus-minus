import {Color} from '../definitions/color';
import {Vector} from '../physics/vector';
import {room} from '../room/room';
import {Classes} from './class';
import {Entity} from './entity';

export class Gun {
    public setting: {
        offset: number;
        direction: number;
        length: number;
        width: number;
        aspect: number;
        angle: number;
        color: Color | string;
        border: Color | string;
        strokeWidth: number;
        alpha: number;
        layer: number;
    } = {
        offset: -2,
        direction: 0,
        length: 20,
        width: 18,
        aspect: 1,
        angle: 0,
        color: Color.LightGrey,
        border: Color.AutoBorder,
        strokeWidth: 4,
        alpha: 1,
        layer: -1,
    };

    public body: Entity;

    public lastFireTick = 0;

    constructor(body: Entity) {
        this.body = body;
    }

    public calcPos() {
        const gunAngle = this.body.angle + this.setting.angle;

        // P1 [-----------] P2
        //    [           ]
        // P3 [-----------] P4

        const size = this.body.size / 20;
        const p1 = new Vector(this.body.size + this.setting.offset * size, ((this.setting.width / 2) * size) / this.setting.aspect).rotate(gunAngle);
        const p3 = new Vector(this.body.size + this.setting.offset * size, -(((this.setting.width / 2) * size) / this.setting.aspect)).rotate(gunAngle);
        const p2 = new Vector(this.body.size + (this.setting.offset + this.setting.length) * size, ((this.setting.width * size) / 2) * this.setting.aspect).rotate(gunAngle);
        const p4 = new Vector(this.body.size + (this.setting.offset + this.setting.length) * size, -(((this.setting.width * size) / 2) * this.setting.aspect)).rotate(gunAngle);

        return [p1, p2, p3, p4];
    }

    public calcBulletPos() {
        const gunAngle = this.body.angle + this.setting.angle;
        const size = this.body.size / 20;

        return new Vector(this.body.size + (this.setting.offset + this.setting.length) * size, this.setting.aspect).rotate(gunAngle);
    }

    public firing(target: Vector) {
        if (this.body.tick - this.lastFireTick > 30 - this.body.skill.values.reload * 3.42) {
            this.lastFireTick = this.body.tick;

            const pos = this.calcBulletPos().add(this.body.pos);

            const bullet = new Entity();

            bullet.init(Classes.Bullet);

            bullet.skill.values = {
                reload: this.body.skill.values.reload,
                bulletPen: this.body.skill.values.bulletPen,
                bulletHealth: this.body.skill.values.bulletPen,
                bulletDamage: this.body.skill.values.bulletDamage,
                bulletSpeed: this.body.skill.values.bulletSpeed,
                bodyDamage: 1 + this.body.skill.values.bulletDamage,
                healthRegain: 0,
                maxHealth: 9,
                speed: this.body.skill.values.bulletSpeed,
            };

            bullet.team = this.body.team;
            bullet.team2 = this.body.team2;
            bullet.pos = pos;

            room.insert(bullet);

            bullet.vel = Vector.sub(target, this.body.pos)
                .normalize()
                .mult(5 + this.body.skill.values.bulletSpeed * 4)
                .add(this.body.vel);

            this.body.vel.sub(
                Vector.sub(target, this.body.pos)
                    .normalize()
                    .mult((5 + this.body.skill.values.bulletSpeed * 4) / 10),
            );

            setTimeout(() => {
                room.remove(bullet);
            }, 2000);
        }
    }
}
