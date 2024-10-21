import {Vector} from '../physics/vector';

export interface TurretSetting {
    offset: Vector;
    angle: number;
    fixedAngle: boolean;
    spin: number;
    spin2: number;
    type: string;
}
