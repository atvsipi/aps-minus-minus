import {Class} from '../entity/class';
import {Color} from './color';

Class.Player = {
    sides: 0,
    guns: [
        {
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
        },
    ],
};

Class.Bullet = {
    sides: 0,
    size: 5,
    bullet: true,
};
