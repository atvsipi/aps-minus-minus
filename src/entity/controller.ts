import {Vector} from '../physics/vector';
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
