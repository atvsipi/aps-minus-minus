import {Class} from '../entity/class';
import {Nearest} from '../entity/controller';
import {Color} from './color';

Class.Player = {
    sides: 0,
    guns: [
        {
            offset: -5,
            direction: 0,
            length: 30,
            width: 36,
            aspect: 1,
            angle: 0,
            color: Color.LightGrey,
            border: Color.AutoBorder,
            strokeWidth: 4,
            alpha: 1,
            layer: -1,
            properties: {
                type: 'Bullet',
                autofire: false,
                altFire: false,
                delaySpawn: 0,
                maxChildren: false,
                independentChildren: false,
                destroyOldestChild: false,
                skill: {
                    reload: 2,
                    recoil: 1,
                    size: 2,
                    health: 1,
                    damage: 30,
                    pen: 1,
                    speed: 3,
                    range: 2,
                    spray: 1,
                },
            },
        },
        {
            offset: 0,
            direction: 0,
            length: 20,
            width: 18,
            aspect: 1,
            angle: Math.PI / 2,
            color: Color.LightGrey,
            border: Color.AutoBorder,
            strokeWidth: 4,
            alpha: 1,
            layer: -1,
        },
        {
            offset: 0,
            direction: 0,
            length: 20,
            width: 18,
            aspect: 1,
            angle: Math.PI,
            color: Color.LightGrey,
            border: Color.AutoBorder,
            strokeWidth: 4,
            alpha: 1,
            layer: -1,
        },
        {
            offset: 0,
            direction: 0,
            length: 20,
            width: 18,
            aspect: 1,
            angle: Math.PI * 1.5,
            color: Color.LightGrey,
            border: Color.AutoBorder,
            strokeWidth: 4,
            alpha: 1,
            layer: -1,
        },
    ],
};

Class.Bullet = {
    showHealth: false,
    showName: false,
    showScore: false,
    sides: 0,
    size: 5,
    bullet: true,
};

Class.Wall = {
    showHealth: false,
    showName: false,
    showScore: false,
    sides: 4,
    isFixed: true,
    size: 49,
    skill: {damage: 0, health: 10000},
    guns: [],
    color: Color.LightGrey,
};

Class.bot = {
    sides: 5,
    size: 20,
    guns: [],
    color: Color.Lavender,
    controllers: [new Nearest()],
};
