import {Color} from '../definitions/color';
import {Vector} from '../physics/vector';
import {room} from '../room/room';
import {RoomConfig} from '../room/roomconfig';
import {EntityClass} from './class';
import {Entity} from './entity';
import {Skill, SkillSystem} from './skill';

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
        properties: {
            autofire: boolean;
            altFire: boolean;
            delaySpawn: number;
            bulletSkills: null | Skill.Base[] | {skill: Skill.Base; value: number}[];
            maxChildren: false | number;
            independentChildren: boolean;
            destroyOldestChild: boolean;
            shootSettings: {
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
            statCalc: (stat: {speed: number; health: number; damage: number; pen: number; range: number; pushability: number}, gun: Gun) => unknown;
        };
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
        alpha: 0.5,
        layer: -1,
        properties: {
            autofire: false,
            altFire: false,
            delaySpawn: 0,
            bulletSkills: null,
            maxChildren: false,
            independentChildren: false,
            destroyOldestChild: false,
            shootSettings: {
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
            statCalc() {},
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

    public calcBulletStat(): [
        SkillSystem,
        {
            speed: number;
            health: number;
            damage: number;
            pen: number;
            range: number;
            pushability: number;
        },
    ] {
        const skill = new SkillSystem();

        if (!this.setting.properties.bulletSkills) skill.values = this.body.skill.values;
        else {
            const bulletSkills = this.setting.properties.bulletSkills;
            if (bulletSkills[0] instanceof Skill.Base) {
                for (let i = 0; i < bulletSkills.length; i++) skill.skills.push(bulletSkills[i] as Skill.Base);
            } else {
                for (let i = 0; i < bulletSkills.length; i++) {
                    const data = bulletSkills[i] as {skill: Skill.Base; value: number};
                    skill.skills.push(data.skill);
                    data.skill.value = data.value;
                }
            }
        }

        const stat = {
            speed: skill.values.bulletSpeed,
            health: this.setting.properties.shootSettings.health * skill.values.bulletHealth,
            damage: this.setting.properties.shootSettings.damage * skill.values.bulletDamage,
            pen: Math.max(1, this.setting.properties.shootSettings.pen * skill.values.bulletPen),
            range: this.setting.properties.shootSettings.range / Math.sqrt(skill.values.bulletSpeed),
            pushability: 1 / skill.values.bulletPen,
        };

        this.setting.properties.statCalc(stat, this);

        return [skill, stat];
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

    public firing(target: Vector) {
        if (this.maxChildren !== false && this.maxChildren <= this.children.filter(Boolean).length) {
            if (this.setting.properties.destroyOldestChild) {
                const entity = this.children[0];

                room.remove(entity);

                delete this.children[0];
            } else return;
        }

        if (this.body.tick - this.lastFireTick > 30 - this.body.skill.values.reload * 3.42) {
            this.body.emit('fire');

            this.lastFireTick = this.body.tick;

            const pos = this.calcBulletPos().add(this.body.pos);

            const bullet = new Entity();

            bullet.init(EntityClass.Bullet);

            if (this.setting.properties.independentChildren) bullet.setting.independent = true;

            const [skill, stat] = this.calcBulletStat();

            bullet.skill = skill;

            bullet.skill.init(bullet);

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
