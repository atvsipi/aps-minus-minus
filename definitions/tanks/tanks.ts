import {Class, GunClassType} from '@/entity/class';
import {CircleMove, GoToMasterTarget, MasterCircleMove, Nearest} from '@/entity/controller';
import {Vector} from '@/physics/vector';
import {Color} from '@/definitions/color';

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
                damage: 1,
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
    label: 'Overlord',
    killMessage: true,
    skill: {
        speed: 0.5,
        health: 140,
        regen: 0.001,
        damage: 1,
        pen: 10,
        range: null,
        pushability: 1,
        fov: 800,
    },
    upgrades: ['Basic', 'Twin', 'Annihilator', 'Basic', 'Basic', 'Basic', 'Basic', 'Basic', 'Basic'],
    guns: [makeOverLordGun(0), makeOverLordGun(Math.PI / 2), makeOverLordGun(Math.PI), makeOverLordGun(Math.PI * 1.5)],
    props: [
        {
            offset: new Vector(),
            layer: 10,
            size: 15,
            spin: 0.04,
            color: Color.Grey,
            alpha: 1,
            sides: 3,
        },
    ],
    miniMapType: 'team',
};

Class.Basic = {
    tier: 0,
    label: 'Basic',
    sides: 0,
    killMessage: true,
    skill: {
        speed: 0.5,
        health: 140,
        regen: 0.001,
        damage: 1,
        pen: 10,
        range: null,
        pushability: 1,
        fov: 400,
    },
    guns: [
        {
            offset: -5,
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
            properties: {
                type: 'Bullet',
                autofire: false,
                altFire: false,
                delaySpawn: 0,
                maxChildren: false,
                independentChildren: false,
                destroyOldestChild: false,
                skill: {
                    reload: 0.1,
                    recoil: 1,
                    size: 1,
                    health: 1,
                    damage: 1.2,
                    pen: 1,
                    speed: 6,
                    range: 2,
                    spray: 1,
                },
            },
        },
    ],
    props: [
        {
            offset: new Vector(0, 0),
            layer: 10,
            fixedAngle: true,
            size: 200,
            color: Color.Blue,
            alpha: 0.3,
            sides: 0,
            angle: 0,
        },
    ],
    turrets: [
        {
            offset: new Vector(0, 0),
            angle: 0,
            fixedAngle: true,
            type: 'test',
        },
        {
            offset: new Vector(0, 0),
            angle: 0,
            fixedAngle: true,
            type: 'test1',
        },
    ],
    miniMapType: 'team',
    upgrades: ['Killer'],
};

Class.test = {
    size: 100,
    color: Color.Blue,
    showHealth: false,
    showName: false,
    showScore: false,
    sides: 0,
    alpha: 0,
    skill: {
        damage: 0.1,
        health: 10000000,
        regen: 100,
    },
};

Class.test1 = {
    size: 5,
    showHealth: false,
    showName: false,
    showScore: false,
    sides: 0,
    alpha: 0,
    color: Color.Grey,
    skill: {
        damage: 0.1,
        health: 10000000,
        regen: 100,
    },
    guns: [
        {
            offset: -5,
            direction: 0,
            length: 50,
            width: 18,
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
                    reload: 0.1,
                    recoil: 1,
                    size: 1,
                    health: 1,
                    damage: 1.2,
                    pen: 1,
                    speed: 6,
                    range: 2,
                    spray: 1,
                },
            },
        },
    ],
    controllers: [new Nearest()],
};

Class.Twin = {
    parent: 'Basic',
    tier: 0,
    label: 'Twin',
    sides: 0,
    killMessage: true,
    skill: {
        speed: 0.5,
        health: 140,
        regen: 0.001,
        damage: 1,
        pen: 10,
        range: null,
        pushability: 1,
        fov: 700,
    },
    guns: [
        {
            offset: -10,
            direction: 11,
            length: 28,
            width: 16,
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
                    reload: 1,
                    recoil: 1,
                    size: 1,
                    health: 1,
                    damage: 1,
                    pen: 1,
                    speed: 6,
                    range: 2,
                    spray: 1,
                },
            },
        },
        {
            offset: -10,
            direction: -11,
            length: 28,
            width: 16,
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
                delaySpawn: 250,
                maxChildren: false,
                independentChildren: false,
                destroyOldestChild: false,
                skill: {
                    reload: 1,
                    recoil: 1,
                    size: 1,
                    health: 1,
                    damage: 1,
                    pen: 1,
                    speed: 6,
                    range: 2,
                    spray: 1,
                },
            },
        },
    ],
    miniMapType: 'team',
    upgrades: ['Killer'],
};

Class.Annihilator = {
    parent: 'Basic',
    tier: 0,
    label: 'Annihilator',
    sides: 0,
    killMessage: true,
    skill: {
        speed: 1,
        health: 200,
        regen: 0.001,
        damage: 1,
        pen: 10,
        range: null,
        pushability: 1,
        fov: 700,
    },
    guns: [
        {
            offset: -10,
            direction: 0,
            length: 30,
            width: 38,
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
                    reload: 0.002,
                    recoil: 1,
                    size: 2,
                    health: 1,
                    damage: 4,
                    pen: 1,
                    speed: 3,
                    range: 2,
                    spray: 1,
                },
            },
        },
    ],
    miniMapType: 'team',
    upgrades: ['Killer'],
};

Class.Killer = {
    tier: 60,
    label: 'Killer',
    sides: -5,
    killMessage: true,
    props: [
        {
            offset: new Vector(0, 0),
            layer: -1,
            size: 200,
            color: Color.Blue,
            alpha: 0.2,
            sides: 0,
        },
    ],
    skill: {
        speed: 0.6,
        health: 400,
        regen: 0.001,
        damage: 10,
        pen: 10,
        range: null,
        pushability: 1,
        fov: 800,
    },
    on: {
        upgrade(body) {
            body.socket.sendMsg('Oh my, I have to give you a gift :(\nhttps://tetris.com/play-tetris\nHave fun!');
        },
    },
    guns: [
        {
            offset: -10,
            direction: 0,
            length: 30,
            width: 38,
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
                    reload: 0.002,
                    recoil: 1,
                    size: 2,
                    health: 1,
                    damage: 4,
                    pen: 1,
                    speed: 3,
                    range: 2,
                    spray: 1,
                },
            },
        },
        {
            offset: -10,
            direction: 0,
            length: 30,
            width: 38,
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
                    reload: 0.002,
                    recoil: 1,
                    size: 2,
                    health: 1,
                    damage: 4,
                    pen: 1,
                    speed: 3,
                    range: 2,
                    spray: 1,
                },
            },
        },
        {
            offset: -10,
            direction: 0,
            length: 30,
            width: 38,
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
                    reload: 0.002,
                    recoil: 1,
                    size: 2,
                    health: 1,
                    damage: 4,
                    pen: 1,
                    speed: 3,
                    range: 2,
                    spray: 1,
                },
            },
        },
        {
            offset: -10,
            direction: 0,
            length: 30,
            width: 38,
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
                    reload: 0.002,
                    recoil: 1,
                    size: 2,
                    health: 1,
                    damage: 4,
                    pen: 1,
                    speed: 3,
                    range: 2,
                    spray: 1,
                },
            },
        },
    ],
    miniMapType: 'always',
    upgrades: ['Killer'],
};

Class.Bullet = {
    showHealth: false,
    showName: false,
    showScore: false,
    giveScore: false,
    sides: 0,
    size: 5,
    skill: {
        speed: 0.5,
        health: 0.1,
        regen: 0,
        damage: 2,
        pen: 5,
        range: null,
        pushability: 1,
        fov: 90,
    },
    bullet: true,
    hardBullet: false,
};

Class.Drone = {
    showHealth: false,
    showName: false,
    showScore: false,
    giveScore: false,
    skill: {
        fov: 300,
        speed: 0.2,
        health: 0.1,
        regen: 0,
        damage: 2,
        pen: 5,
        range: null,
        pushability: 1,
    },
    sides: 3,
    controllers: [new MasterCircleMove(), new Nearest(), new GoToMasterTarget()],
    size: 5,
    bullet: true,
    hardBullet: true,
};
Class.Drone1 = {
    showHealth: true,
    showName: false,
    showScore: false,
    giveScore: false,
    skill: {
        fov: 300,
        speed: 0.2,
        health: 0.1,
        regen: 0,
        damage: 2,
        pen: 5,
        range: null,
        pushability: 1,
    },
    sides: 3,
    controllers: [new MasterCircleMove(), new Nearest(), new GoToMasterTarget()],
    size: 5,
    bullet: true,
    hardBullet: true,
};

Class.bot = {
    sides: 5,
    size: 15,
    killMessage: 'Why killed me :((',
    skill: {
        speed: 0.01,
        health: 800,
        regen: 0.001,
        damage: 10,
        pen: 10,
        range: null,
        pushability: 1,
    },
    score: 250000,
    food: true,
    guns: [
        {
            offset: -10,
            direction: 0,
            length: 14,
            width: 32,
            aspect: 1.2,
            angle: 0,
            color: Color.LightGrey,
            border: Color.AutoBorder,
            strokeWidth: 4,
            alpha: 1,
            layer: -1,
            properties: {
                type: 'Drone1',
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
                    damage: 1,
                    pen: 1,
                    speed: 2,
                    range: null,
                    spray: 1,
                },
            },
        },
    ],
    miniMapType: 'team',
    color: Color.Lavender,
    controllers: [new CircleMove(), new Nearest()],
};
