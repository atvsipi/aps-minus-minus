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
    name: null | string;
    size: number;
    mass: number;
    sides: number | string | Vector[];
    isFixed: boolean;
    airplane: boolean;
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

    public getAABB: () => {
        active: boolean;
        min: [number, number];
        max: [number, number];
    } = () => {
        const size = this.size;

        return {
            active: true,
            min: [this.pos.x - size, this.pos.y - size],
            max: [this.pos.x + size, this.pos.y + size],
        };
    };

    public name: string = 'Entity';

    public active: boolean = true;

    public HSHG?: HSHGMeta;

    public angle: number = 0;

    public move = new Set<0 | 1 | 2 | 3>();
    public control: {
        target: Vector | null;
        goal: Vector | null;
        main: boolean;
        fire: boolean;
        alt: boolean;
    } = {
        target: null,
        goal: null,
        main: false,
        fire: false,
        alt: false,
    };

    public setting: EntitySetting = {
        showHealth: true,
        showName: true,
        showScore: true,
        giveScore: true,
        name: null,
        size: 10,
        mass: 1,
        sides: 0,
        isFixed: false,
        airplane: false,
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

    constructor() {
        super();
    }

    public init(Class: ProcessedClass) {
        this.setting.showHealth = Class.showHealth;
        this.setting.showName = Class.showName;
        this.setting.showScore = Class.showScore;
        this.setting.name = Class.name;
        this.setting.size = Class.size;
        this.setting.mass = Class.mass;
        this.setting.sides = Class.sides;
        this.setting.isFixed = Class.isFixed;
        this.setting.airplane = Class.airplane;
        this.setting.bullet = Class.bullet;
        this.setting.skill = Class.skill;
        this.setting.controllers = Class.controllers;
        this.color = Class.color;
        this.border = Class.border;

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

            if (think.target) this.control.target = think.target;
            if (think.goal) this.control.goal = think.goal;
            if (think.main) this.control.main = think.main;
            if (think.alt) this.control.alt = think.alt;
            if (think.fire) this.control.fire = think.fire;
        }

        for (const gun of this.guns) gun.update();

        if (this.control.main && this.control.target) {
            const target = this.control.target;

            this.angle = target.angle();

            this.vel.add(target.clone().normalize().mult(speed));
        } else {
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
        }

        if (this.vel.mag < 0.1) this.active = false;
        else this.active = true;

        this.pos.add(this.vel);
        this.vel.mult(this.setting.bullet ? 0.98 : 0.9);
        this.vel.add(this.acc);
        this.acc.mult(0);
    }

    public static isSameTeam(entity: Entity, other: Entity) {
        return entity.team === other.team && ((entity.team2 === 0 && other.team2 === 0) || entity.team2 === other.team2);
    }
}
