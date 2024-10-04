import {AddClass} from '../entity/class';
import {Color} from './color';

AddClass('Player', {
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
            alpha: 1,
            layer: -1,
        },
    ],
});

AddClass('Bullet', {
    sides: 0,
    size: 5,
    bullet: true,
});
