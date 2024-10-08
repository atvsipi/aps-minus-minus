import {Color} from '../definitions/color';
import {Team} from '../definitions/team';
import {HSHGMeta} from '../physics/hshg';
import {Vector} from '../physics/vector';
import {Gun} from './gun';
import {EventEmitter} from 'events';
import {SkillSystem} from './skill';
import {ProcessedClass} from './class';
import {room} from '../room/room';

export class Entity extends EventEmitter {
    public id!: number;

    public pos: Vector = new Vector();
    public vel: Vector = new Vector();
    public acc: Vector = new Vector();

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

    public active: boolean = true;

    public HSHG?: HSHGMeta;

    public angle: number = 0;

    public move = new Set<0 | 1 | 2 | 3>();
    public target: Vector | null = null;

    public skill: SkillSystem = new SkillSystem();

    public setting: {
        size: number;
        mass: number;
        sides: number | string | Vector[];
        isFixed: boolean;
        airplane: boolean;
        bullet: boolean;
        independent: boolean;
    } = {
        size: 10,
        mass: 1,
        sides: 0,
        isFixed: false,
        airplane: false,
        bullet: false,
        independent: false,
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
        this.setting.size = Class.size;
        this.setting.mass = Class.mass;
        this.setting.sides = Class.sides;
        this.setting.isFixed = Class.isFixed;
        this.setting.airplane = Class.airplane;
        this.setting.bullet = Class.bullet;
        this.color = Class.color;
        this.border = Class.border;

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

        const speed = this.skill.values.speed + 0.5;
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

        if (this.vel.mag < 0.1) this.active = false;
        else this.active = true;

        this.pos.add(this.vel);
        this.vel.mult(this.setting.bullet ? 0.98 : 0.9);
        this.vel.add(this.acc);
        this.acc.mult(0);

        if (this.target !== null) {
            for (const gun of this.guns) gun.firing(this.target.clone().add(this.pos));
        }
    }

    public static isSameTeam(entity: Entity, other: Entity) {
        return entity.team === other.team && ((entity.team2 === 0 && other.team2 === 0) || entity.team2 === other.team2);
    }
}
