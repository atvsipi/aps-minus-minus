import {Color} from '../definitions/color';
import {Vector} from '../physics/vector';
import {room} from '../room/room';
import {RoomConfig} from '../room/roomconfig';
import {EntityClass} from './class';
import {Controller} from './controller';
import {Entity} from './entity';

export interface GunSetting {
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
    properties: {
        type: string;
        autofire: boolean;
        altFire: boolean;
        delaySpawn: number;
        maxChildren: false | number;
        independentChildren: boolean;
        destroyOldestChild: boolean;
        controllers: Controller[];
        skill: {
            reload: number;
            recoil: number;
            size: number;
            health: number;
            damage: number;
            pen: number;
            speed: number;
            range: number;
            spray: number;
        };
    };
}

export class Gun {
    public setting: GunSetting = {
        offset: -2,
        direction: 0,
        length: 20,
        width: 18,
        aspect: 1,
        angle: 0,
        color: Color.LightGrey,
        border: Color.AutoBorder,
        strokeWidth: 4,
        alpha: 0.5,
        layer: -1,
        properties: {
            type: 'Bullet',
            autofire: false,
            altFire: false,
            delaySpawn: 0,
            maxChildren: false,
            independentChildren: false,
            destroyOldestChild: false,
            controllers: [],
            skill: {
                reload: 1,
                recoil: 1,
                size: 1,
                health: 1,
                damage: 1,
                pen: 1,
                speed: 1,
                range: 1,
                spray: 1,
            },
        },
    };

    public get maxChildren() {
        return this.setting.properties.maxChildren ? this.setting.properties.maxChildren + (this.setting.properties.destroyOldestChild ? 1 : 0) : false;
    }

    public body: Entity;

    public children: Entity[] = [];

    public lastFireTick = 0;

    public recoilVelocity: number = 0;
    public recoilPosition: number = 0;

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

    public recoil() {
        if (this.recoilVelocity || this.recoilPosition) {
            this.recoilPosition += this.recoilVelocity;
            this.recoilVelocity *= 0.8;

            if (this.recoilVelocity > -0.001) {
                this.recoilVelocity = 0.5;
            } else if (this.recoilVelocity > 0.001) {
                this.recoilPosition = 0;
                this.recoilVelocity = 0;
            }
        }
    }

    public firing() {
        if (this.maxChildren !== false && this.maxChildren <= this.children.filter(Boolean).length) {
            if (this.setting.properties.destroyOldestChild) {
                const entity = this.children[0];

                room.remove(entity);

                delete this.children[0];
            } else return;
        }

        if (this.body.tick - this.lastFireTick > 30 - this.setting.properties.skill.reload * 3.42) {
            this.body.emit('fire');

            this.lastFireTick = this.body.tick;

            const pos = this.calcBulletPos().add(this.body.pos);

            const bullet = new Entity();

            bullet.init(EntityClass[this.setting.properties.type]);

            bullet.setting.skill.damage += this.setting.properties.skill.damage - 1;
            bullet.setting.skill.health += this.setting.properties.skill.health - 1;
            bullet.setting.skill.pen += this.setting.properties.skill.pen - 1;
            bullet.setting.size *= this.setting.properties.skill.size;

            if (this.setting.properties.independentChildren) bullet.setting.independent = true;

            bullet.team = this.body.team;
            bullet.team2 = this.body.team2;
            bullet.pos = pos;

            bullet.master = this.body;
            const index = this.children.push(bullet);
            const bodyIndex = this.body.children.push(bullet);

            bullet.on('dead', () => {
                delete this.children[index];
                delete this.body.children[bodyIndex];
            });

            room.insert(bullet);

            const angle = Vector.addAngle({x: 1, y: 1}, this.body.angle + this.setting.angle).normalize();

            bullet.vel = new Vector(angle).mult(this.setting.properties.skill.speed).add(this.body.vel);

            this.body.vel.sub(new Vector(angle).mult(this.setting.properties.skill.speed / 10));

            setTimeout(() => {
                room.remove(bullet);
            }, this.setting.properties.skill.range * 1000);
        }
    }

    public update() {
        if (this.setting.properties.autofire || (this.setting.properties.altFire && this.body.control.alt) || (!this.setting.properties.altFire && this.body.control.fire)) {
            this.firing();
        }
    }
}
