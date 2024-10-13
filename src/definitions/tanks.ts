import {Class, GunClassType} from '../entity/class';
import {CircleMove, GoToMasterTarget, MasterCircleMove, Nearest} from '../entity/controller';
import {Color} from './color';

function makeOverLordGun(angle: number): GunClassType {
    return {
        offset: -5,
        direction: 0,
        length: 14,
        width: 32,
        aspect: 1.2,
        angle: angle,
        color: Color.LightGrey,
        border: Color.AutoBorder,
        strokeWidth: 4,
        alpha: 1,
        layer: -1,
        properties: {
            type: 'Drone',
            autofire: true,
            altFire: false,
            delaySpawn: 0,
            maxChildren: 2,
            independentChildren: false,
            destroyOldestChild: false,
            skill: {
                reload: 0.01,
                recoil: 1,
                size: 2,
                health: 1,
                damage: 3,
                pen: 1,
                speed: 2,
                range: null,
                spray: 1,
            },
        },
    };
}

Class.Player = {
    sides: 0,
    guns: [makeOverLordGun(0), makeOverLordGun(Math.PI / 2), makeOverLordGun(Math.PI), makeOverLordGun(Math.PI * 1.5)],
};

Class.Bullet = {
    showHealth: false,
    showName: false,
    showScore: false,
    giveScore: false,
    sides: 0,
    size: 5,
    bullet: true,
};

Class.Drone = {
    showHealth: false,
    showName: false,
    showScore: false,
    giveScore: false,
    skill: {fov: 300, speed: 0.2},
    sides: 3,
    controllers: [new MasterCircleMove(), new Nearest(), new GoToMasterTarget()],
    size: 5,
    bullet: true,
    hardBullet: true,
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

Class.Food = {
    sides: 4,
    size: 10,
    showHealth: true,
    showName: false,
    showScore: false,
    giveScore: true,
    skill: {
        speed: 0.2,
        health: 40,
        regen: 0.1,
        damage: 0.5,
        pen: 1,
        range: null,
        pushability: 1,
    },
    score: 1000,
    food: true,
    guns: [],
    color: Color.Gold,
    controllers: [new CircleMove()],
};

Class.bot = {
    sides: 5,
    size: 15,
    skill: {
        speed: 0.2,
        health: 100,
        regen: 1,
        damage: 1,
        pen: 10,
        range: null,
        pushability: 1,
    },
    score: 250000,
    food: true,
    guns: [
        {
            offset: -3,
            direction: 0,
            length: 10,
            width: 18,
            aspect: 1.3,
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
                    size: 1,
                    health: 1,
                    damage: 1,
                    pen: 1,
                    speed: 2,
                    range: 2,
                    spray: 1,
                },
            },
        },
    ],
    color: Color.Lavender,
    controllers: [new CircleMove(), new Nearest()],
};
