import {Color} from '../definitions/color';
import {RoomConfig} from '../room/roomconfig';
import {Entity} from './entity';

export namespace Skill {
    export class Base {
        public entity!: Entity;
        public fixed: boolean = false;

        public name: string = 'Skill';
        public color: string | Color = Color.Green;

        protected _value: number = 0;
        public set value(value: number) {
            this._value = value;
        }

        public get value() {
            return this._value;
        }

        public init(entity: Entity) {
            this.entity = entity;
        }

        public fix(value: number) {
            this.fixed = true;
            this.value = value;

            return this;
        }

        public setName(name: string) {
            this.name = name;

            return this;
        }

        public setColor(color: string | Color) {
            this.color = color;

            return this;
        }

        public update() {}
    }

    export class Reload extends Base {
        public set value(value: number) {
            this.entity.skill.values.reload = value;
        }

        public get value() {
            return this.entity.skill.values.reload;
        }
    }

    export class BulletPenetration extends Base {
        public set value(value: number) {
            this.entity.skill.values.bulletPen = value;
        }

        public get value() {
            return this.entity.skill.values.bulletPen;
        }
    }

    export class BulletHealth extends Base {
        public set value(value: number) {
            this.entity.skill.values.bulletHealth = value;
        }

        public get value() {
            return this.entity.skill.values.bulletHealth;
        }
    }

    export class BulletDamage extends Base {
        public set value(value: number) {
            this.entity.skill.values.bulletDamage = value;
        }

        public get value() {
            return this.entity.skill.values.bulletDamage;
        }
    }

    export class BulletSpeed extends Base {
        public set value(value: number) {
            this.entity.skill.values.bulletSpeed = value;
        }

        public get value() {
            return this.entity.skill.values.bulletSpeed;
        }
    }

    export class BodyDamage extends Base {
        public set value(value: number) {
            this.entity.skill.values.bodyDamage = value;
        }

        public get value() {
            return this.entity.skill.values.bodyDamage;
        }
    }

    export class MaxHealth extends Base {
        public set value(value: number) {
            this.entity.skill.values.maxHealth = value;
        }

        public get value() {
            return this.entity.skill.values.maxHealth;
        }
    }

    export class MovementSpeed extends Base {
        public set value(value: number) {
            this.entity.skill.values.speed = value;
        }

        public get value() {
            return this.entity.skill.values.speed;
        }
    }
}

export class SkillSystem {
    public skills: Skill.Base[] = [];

    public point: number = 0;

    public score: number = 0;

    public level: number = 0;
    public levelScore: number = 0;

    public health: number = 100;

    public values = {
        reload: 0,
        bulletPen: 0,
        bulletHealth: 0,
        bulletDamage: 0,
        bulletSpeed: 0,
        bodyDamage: 0,
        healthRegain: 0,
        maxHealth: 0,
        speed: 0,
    };

    public max: number = 9;

    public getSkills() {
        return this.skills.map((skill) => ({
            name: skill.name,
            color: skill.color,
            fixed: skill.fixed,
            value: skill.value,
        }));
    }

    public upgrade(index: number) {
        if (!this.point || !this.skills[index] || this.skills[index].fixed || this.skills[index].value >= this.max) return false;

        this.point--;
        this.skills[index].value++;
    }

    public update() {
        if (this.score > this.levelScore) {
            this.level++;
            this.levelScore = RoomConfig.levelScore(this.level);
            this.point += RoomConfig.levelSkillPoint(this.level);
        }

        for (const skill of this.skills) skill.update();
    }
}
