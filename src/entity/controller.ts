import {throws} from 'assert';
import {Vector} from '../physics/vector';
import {room} from '../room/room';
import {RoomConfig} from '../room/roomconfig';
import {Entity} from './entity';

export interface ControllerThink {
    target: Vector | null;
    goal: Vector | null;
    main: boolean | null;
    fire: boolean | null;
    alt: boolean | null;
    power?: number;
}

export class Controller {
    public entity!: Entity;
    public acceptsFromTop: boolean = true;
    public timer: number = Math.random() * 10;

    constructor() {}

    public isThinkTime() {
        if (this.timer-- < 0) {
            this.timer = 10;

            return true;
        }

        return false;
    }

    public think(): ControllerThink {
        return {
            target: null,
            goal: null,
            main: false,
            fire: false,
            alt: false,
        };
    }
}

export class Nearest extends Controller {
    protected target: Vector | null = null;

    public think(): ControllerThink {
        if (this.isThinkTime()) {
            if (this.target !== null) {
                this.acceptsFromTop = false;

                return {
                    target: this.target.clone().sub(this.entity.pos),
                    goal: null,
                    main: true,
                    fire: true,
                    alt: false,
                };
            }

            this.acceptsFromTop = true;

            return {
                target: null,
                goal: null,
                main: null,
                fire: null,
                alt: null,
            };
        }

        let diff = Infinity;
        let master: Entity;
        for (const entity of room.entities) {
            if (entity === this.entity) continue;

            if (Entity.isSameTeam(entity, this.entity)) continue;

            if (entity.master && !entity.setting.independent) continue;

            if (entity.setting.isFixed) continue;

            const distance = Vector.distance(this.entity.pos, entity.pos);

            if (distance < diff) {
                diff = distance;

                master = entity;
            }
        }

        if (!master) {
            this.acceptsFromTop = true;
            this.target = null;

            return {
                target: null,
                goal: null,
                main: null,
                fire: null,
                alt: null,
            };
        }

        this.target = master.pos;

        this.acceptsFromTop = false;
        return {
            target: this.target.clone().sub(this.entity.pos),
            goal: null,
            main: true,
            fire: true,
            alt: false,
        };
    }
}

export class CircleMove extends Controller {
    public acceptsFromTop: boolean = false;

    protected angle: number = Math.random() * Math.PI * 2;
    protected target: Vector = new Vector(0, 0);

    public think(): ControllerThink {
        if (this.isThinkTime()) {
            this.target = new Vector(5, 5).addAngle(this.angle);

            this.angle -= Math.PI / 60;
        }

        return {
            target: this.target,
            goal: null,
            main: true,
            fire: false,
            alt: false,
            power: 0.1,
        };
    }
}

export class MasterCircleMove extends Controller {
    public acceptsFromTop: boolean = false;

    protected angle: number = Math.random() * Math.PI * 2;
    protected target: Vector = new Vector(0, 0);

    public think(): ControllerThink {
        if (this.isThinkTime()) {
            this.target = this.entity.masterPos.clone().add(new Vector(30, 0).rotate(this.angle));

            /*const master = this.entity.masterPos;
            this.target = master.clone().add(new Vector(30, 30).rotate(this.angle));

            this.target = master.clone().add(new Vector().add(30).addAngle(this.angle).mult(0.02)).sub(this.entity.pos);*/

            this.angle -= Math.PI / 100;
        }

        return {
            target: this.target.clone(),
            goal: null,
            main: true,
            fire: false,
            alt: false,
            power: 0.1,
        };
    }
}

export class GoToMasterTarget extends Controller {
    protected target: Vector = new Vector(0, 0);

    public think(): ControllerThink {
        if (this.isThinkTime()) {
            if (!this.entity.source) {
                this.acceptsFromTop = true;
            } else {
                this.acceptsFromTop = false;
                this.target = this.entity.source.clone();
            }
        }

        return {
            target: this.target.clone().add(this.entity.masterPos).sub(this.entity.pos),
            goal: null,
            main: true,
            fire: false,
            alt: false,
            power: 0.1,
        };
    }
}
