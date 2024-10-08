import {Vector} from '../physics/vector';
import {room} from '../room/room';
import {Entity} from './entity';

export class Controller {
    public entity!: Entity;
    public acceptsFromTop: boolean = true;

    constructor() {}

    think(): {target: Vector | null; goal: Vector | null; main: boolean; fire: boolean; alt: boolean} {
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
    think(): {target: Vector | null; goal: Vector | null; main: boolean; fire: boolean; alt: boolean} {
        let diff = Infinity;
        let master: Entity;

        for (const entity of room.entities) {
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

            return {
                target: null,
                goal: null,
                main: false,
                fire: false,
                alt: false,
            };
        }

        this.acceptsFromTop = false;

        return {
            target: master.pos.clone().sub(this.entity.pos),
            goal: null,
            main: true,
            fire: true,
            alt: false,
        };
    }
}
