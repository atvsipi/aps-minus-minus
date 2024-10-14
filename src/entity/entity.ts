import {Color} from '../definitions/color';
import {Team} from '../definitions/team';
import {HSHGMeta} from '../physics/hshg';
import {Vector} from '../physics/vector';
import {Gun} from './gun';
import {EventEmitter} from 'events';
import {ProcessedClass} from './class';
import {room} from '../room/room';
import {RoomConfig} from '../room/roomconfig';
import {Controller} from './controller';

export interface EntitySetting {
    showHealth: boolean;
    showName: boolean;
    showScore: boolean;
    giveScore: boolean;
    killMessage: boolean | string;
    label: string;
    hitType: 'none' | 'auto' | ((other: Entity) => void);
    score: number;
    name: null | string;
    size: number;
    mass: number;
    sides: number | string | Vector[];
    isFixed: boolean;
    airplane: boolean;
    hardBullet: boolean;
    bullet: boolean;
    food: boolean;
    independent: boolean;
    controllers: Controller[];
    skill: {
        speed: number;
        health: number;
        regen: number;
        damage: number;
        pen: number;
        range: number | null;
        pushability: number;
        fov: number;
    };
}

export class Entity extends EventEmitter {
    public id!: number;

    public pos: Vector = new Vector();
    public vel: Vector = new Vector();
    public acc: Vector = new Vector();

    public score: number = 0;

    public level: number = 0;
    public levelScore: number = 0;

    public health: number = 100;

    public changed: boolean = false;

    public mockupId: number = 0;

    public socket: {
        send: (msg: Uint8Array) => void;
        sendMsg: (msg: string) => void;
    } = {
        send: () => void 0,
        sendMsg: () => void 0,
    };

    public getAABB: () => {
        active: boolean;
        min: [number, number];
        max: [number, number];
    } = () => {
        const size = this.size;

        const x1 = Math.min(this.pos.x, this.pos.x + this.vel.x) - size - 5;
        const y1 = Math.min(this.pos.y, this.pos.y + this.vel.y) - size - 5;
        const x2 = Math.max(this.pos.x, this.pos.x + this.vel.x) + size + 5;
        const y2 = Math.max(this.pos.y, this.pos.y + this.vel.y) + size + 5;

        return {
            active: true,
            min: [x1, y1],
            max: [x2, y2],
        };
    };

    public data: {[key: string]: any} = {};

    public name: string = 'Entity';

    public active: boolean = true;

    public HSHG?: HSHGMeta;

    public angle: number = 0;

    public move = new Set<0 | 1 | 2 | 3>();
    public moveAngle: null | number = null;
    public control: {
        target: Vector | null;
        goal: Vector | null;
        main: boolean;
        fire: boolean;
        alt: boolean;
        power: number;
    } = {
        target: null,
        goal: null,
        main: false,
        fire: false,
        alt: false,
        power: 1,
    };

    private _source: Vector | null;

    public set source(value: Vector | null) {
        if (this.setting.independent || !this.master) this._source = value;
        else this.master.source = value;
    }

    public get source(): Vector | null {
        if (this.setting.independent || !this.master) return this._source;

        return this.master.source;
    }

    public setting: EntitySetting = {
        showHealth: true,
        showName: true,
        showScore: true,
        giveScore: true,
        killMessage: true,
        label: 'Entity',
        hitType: 'auto',
        score: 25000,
        name: null,
        size: 10,
        mass: 1,
        sides: 0,
        isFixed: false,
        airplane: false,
        hardBullet: false,
        bullet: false,
        food: false,
        independent: false,
        controllers: [],
        skill: {
            speed: 0.5,
            health: 100,
            regen: 1,
            damage: 1,
            pen: 10,
            range: null,
            pushability: 1,
            fov: 90,
        },
    };

    public guns: Gun[] = [];

    public color: Color | string = Color.TeamColor;
    public border: Color | string = Color.AutoBorder;

    public team: Team = Math.random() > 0.5 ? Team.Blue : Team.Green;
    public team2: number = 0;

    public tick: number = 0;

    public master?: Entity;
    public children: Entity[] = [];

    public lastSend = {
        angle: 0,
        size: 0,
    };

    public die: boolean = false;

    public get size() {
        return this.setting.size;
    }

    public get mass() {
        return this.size * this.setting.mass;
    }

    public get isMaster() {
        if (this.setting.independent || !this.master) return true;

        return false;
    }

    public get topMaster(): Entity {
        if (this.setting.independent || !this.master) return this;

        return this.master.topMaster;
    }

    public get masterPos(): Vector {
        return this.topMaster.pos;
    }

    public get title(): string {
        let title = this.setting.food ? this.setting.label : this.setting.bullet ? `${this.topMaster.name}'s ${this.setting.label}` : `${this.name}'s ${this.setting.label}`;

        return title;
    }

    constructor() {
        super();
    }

    public init(Class: ProcessedClass) {
        this.mockupId = Class.mockupId;

        this.setting.showHealth = Class.showHealth;
        this.setting.showName = Class.showName;
        this.setting.showScore = Class.showScore;
        this.setting.giveScore = Class.giveScore;
        this.setting.killMessage = Class.killMessage;
        this.setting.label = Class.label;
        this.setting.name = Class.name;
        this.setting.size = Class.size;
        this.setting.mass = Class.mass;
        this.setting.sides = Class.sides;
        this.setting.isFixed = Class.isFixed;
        this.setting.airplane = Class.airplane;
        this.setting.bullet = Class.bullet;
        this.setting.hardBullet = Class.hardBullet;
        this.setting.food = Class.food;
        this.setting.skill = Class.skill;
        this.setting.independent = Class.independent;
        this.setting.controllers = Class.controllers;
        this.setting.hitType = Class.hitType;
        this.color = Class.color;
        this.border = Class.border;
        this.score = Class.score;
        this.health = Class.skill.health;

        if (this.setting.name !== null) this.name = this.setting.name;

        for (const gunSetting of Class.guns) {
            const gun = new Gun(this);

            gun.setting = gunSetting;

            this.guns.push(gun);
        }
    }

    public update() {
        this.tick++;
        this.emit('tick', this.tick);

        if (!this.setting.independent && this.master?.die) return room.remove(this);

        if (this.score > this.levelScore) {
            this.level++;
            this.levelScore = RoomConfig.levelScore(this.level);
        }

        if (this.health < this.setting.skill.health) {
            this.health += this.setting.skill.regen;
        }

        const speed = this.setting.skill.speed;

        for (const controller of this.setting.controllers) {
            if (controller.entity !== this) controller.entity = this;

            const think = controller.think();

            if (controller.acceptsFromTop) continue;

            if (think.target !== null) this.control.target = think.target;
            if (think.goal !== null) this.control.goal = think.goal;
            if (think.main !== null) this.control.main = think.main;
            if (think.alt !== null) this.control.alt = think.alt;
            if (think.fire !== null) this.control.fire = think.fire;
            if (think.power !== null) this.control.power = think.power;
        }

        for (const gun of this.guns) gun.update();

        if (this.control.main && this.control.target) {
            const target = this.control.target;

            this.angle = target.angle();

            this.vel.add(
                target
                    .clone()
                    .normalize()
                    .mult(speed * (this.control.power || 1)),
            );
        } else {
            if (this.move.size > 0) {
                for (const move of this.move) {
                    switch (move) {
                        case 0:
                            this.vel.add({x: 0, y: -speed});
                            break;

                        case 1:
                            this.vel.add({x: 0, y: speed});
                            break;

                        case 2:
                            this.vel.add({x: -speed, y: 0});
                            break;

                        case 3:
                            this.vel.add({x: speed, y: 0});
                            break;
                    }
                }
            } else if (this.moveAngle !== null) {
                this.vel.add(new Vector(1, 1).addAngle(this.moveAngle).normalize().mult(speed));
            }
        }

        if (this.vel.mag < 0.1) this.active = false;
        else this.active = true;

        this.pos.add(this.vel);
        this.vel.mult(this.setting.bullet && !this.setting.hardBullet ? 0.98 : this.setting.hardBullet ? 0.95 : 0.9);
        this.vel.add(this.acc);
        this.acc.mult(0);
    }

    public static isSameTeam(entity: Entity, other: Entity) {
        return entity.team === other.team && ((entity.team2 === 0 && other.team2 === 0) || entity.team2 === other.team2);
    }

    public static isEntityVisible(entity: Entity, other: Entity): boolean {
        const distance = Vector.distance(entity.pos, other.pos);
        const fov = entity.setting.skill.fov + (entity.size + other.size) / 2;

        return distance <= fov;
    }
}
