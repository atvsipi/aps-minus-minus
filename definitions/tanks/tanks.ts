import {Class, GunClassType} from '../../src/entity/class';
import {CircleMove, ControllerMaker, GoToMasterTarget, MasterCircleMove, Minion, MinionNearest, Nearest} from '../../src/entity/controller';
import {Vector} from '../../src/physics/vector';
import {Color} from '../../src/definitions/color';

// Base bullet class
Class.Bullet = {
    showHealth: false,
    showName: false,
    showScore: false,
    giveScore: false,
    sides: 0,
    size: 5,
    skill: {
        speed: 0.5,
        health: 4,
        regen: 0,
        damage: 10,
        pen: 5,
        range: null,
        pushability: 1,
        fov: 90,
    },
    bullet: true,
    hardBullet: false,
};

// Base trap class
Class.Trap = {
    showHealth: false,
    showName: false,
    showScore: false,
    giveScore: false,
    sides: -3,
    size: 6,
    skill: {
        speed: 0.8,
        health: 8,
        regen: 0,
        damage: 12,
        pen: 6,
        range: 8,
        pushability: 0.1,
        fov: 90,
    },
    bullet: true,
    hardBullet: true,
};

// Base drone class
Class.Drone = {
    showHealth: false,
    showName: false,
    showScore: false,
    giveScore: false,
    skill: {
        fov: 300,
        speed: 0.2,
        health: 5,
        regen: 0,
        damage: 10,
        pen: 5,
        range: null,
        pushability: 1,
    },
    sides: 3,
    controllers: [new ControllerMaker(MasterCircleMove), new ControllerMaker(Nearest), new ControllerMaker(GoToMasterTarget)],
    size: 5,
    bullet: true,
    hardBullet: true,
};

// TANK

Class.Tank = {
    tier: 0,
    label: 'Tank',
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
    miniMapType: 'team',
};

// BULLET TANKS

Class.Basic = {
    parent: 'Tank',
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
                    reload: 0.8,
                    recoil: 1,
                    size: 1,
                    health: 1,
                    damage: 1,
                    pen: 1,
                    speed: 4,
                    range: 2,
                    spray: 1,
                },
            },
        },
    ],
    miniMapType: 'team',
    upgrades: ['Twin', 'Sniper', 'MachineGun', 'FlankGuard', 'Trapper', 'Overseer', 'Smasher'],
};

Class.Twin = {
    parent: 'Basic',
    label: 'Twin',
    guns: [
        {
            offset: -5,
            direction: 9,
            length: 20,
            width: 16,
            aspect: 1,
            angle: 0,
            properties: {
                type: 'Bullet',
                skill: {
                    reload: 0.7,
                    damage: 0.8,
                },
            },
        },
        {
            offset: -5,
            direction: -9,
            length: 20,
            width: 16,
            aspect: 1,
            angle: 0,
            properties: {
                type: 'Bullet',
                delaySpawn: 250,
                skill: {
                    reload: 0.7,
                    damage: 0.8,
                },
            },
        },
    ],
    upgrades: ['TripleShot'],
};

Class.Sniper = {
    parent: 'Basic',
    label: 'Sniper',
    guns: [
        {
            offset: -5,
            length: 25,
            width: 16,
            aspect: 1,
            angle: 0,
            properties: {
                type: 'Bullet',
                skill: {
                    reload: 0.4,
                    recoil: 1.2,
                    damage: 1.5,
                    speed: 5,
                    range: 3,
                },
            },
        },
    ],
    skill: {
        fov: 600,
    },
    upgrades: [],
};

Class.MachineGun = {
    parent: 'Basic',
    label: 'Machine Gun',
    guns: [
        {
            offset: -5,
            length: 20,
            width: 22,
            aspect: 1.4,
            angle: 0,
            properties: {
                type: 'Bullet',
                skill: {
                    reload: 2,
                    recoil: 0.8,
                    size: 0.8,
                    damage: 0.7,
                    spray: 2,
                },
            },
        },
    ],
    upgrades: [],
};

Class.FlankGuard = {
    parent: 'Basic',
    label: 'Flank Guard',
    guns: [
        {
            offset: -5,
            length: 20,
            width: 18,
            angle: 0,
            properties: {
                type: 'Bullet',
            },
        },
        {
            offset: -5,
            length: 16,
            width: 16,
            angle: Math.PI,
            properties: {
                type: 'Bullet',
                skill: {
                    damage: 0.8,
                },
            },
        },
    ],
    upgrades: ['TripleShot'],
};

Class.TripleShot = {
    parent: 'Basic',
    label: 'Triple Shot',
    guns: [
        {
            offset: -5,
            length: 20,
            width: 16,
            angle: 0,
            properties: {
                type: 'Bullet',
            },
        },
        {
            offset: -5,
            length: 20,
            width: 16,
            angle: Math.PI / 4,
            properties: {
                type: 'Bullet',
            },
        },
        {
            offset: -5,
            length: 20,
            width: 16,
            angle: -Math.PI / 4,
            properties: {
                type: 'Bullet',
            },
        },
    ],
    upgrades: ['PentaShot'],
};

Class.PentaShot = {
    parent: 'TripleShot',
    label: 'Penta Shot',
    guns: [
        {
            offset: -5,
            length: 20,
            width: 16,
            angle: 0,
            properties: {
                type: 'Bullet',
            },
        },
        {
            offset: -5,
            length: 18,
            width: 16,
            angle: Math.PI / 4,
            properties: {
                type: 'Bullet',
            },
        },
        {
            offset: -5,
            length: 18,
            width: 16,
            angle: -Math.PI / 4,
            properties: {
                type: 'Bullet',
            },
        },
        {
            offset: -5,
            length: 16,
            width: 16,
            angle: Math.PI / 2,
            properties: {
                type: 'Bullet',
            },
        },
        {
            offset: -5,
            length: 16,
            width: 16,
            angle: -Math.PI / 2,
            properties: {
                type: 'Bullet',
            },
        },
    ],
    upgrades: [],
};

// TRAP TANKS

Class.Trapper = {
    parent: 'Basic',
    label: 'Trapper',
    guns: [
        {
            offset: 2,
            length: 12,
            width: 20,
            aspect: 1.3,
            angle: 0,
            color: Color.LightGrey,
            border: Color.AutoBorder,
            properties: {
                type: 'Trap',
                skill: {
                    reload: 0.8,
                    speed: 2,
                    size: 1.2,
                },
            },
        },
    ],
    upgrades: ['TriTrapper', 'MegaTrapper', 'AutoTrapper'],
};

Class.TriTrapper = {
    parent: 'Trapper',
    label: 'Tri-Trapper',
    guns: [
        {
            offset: 2,
            length: 12,
            width: 20,
            aspect: 1.3,
            angle: 0,
            color: Color.LightGrey,
            border: Color.AutoBorder,
            properties: {
                type: 'Trap',
                skill: {
                    reload: 0.8,
                    speed: 2,
                    size: 1.2,
                },
            },
        },
        {
            offset: 2,
            length: 12,
            width: 20,
            aspect: 1.3,
            angle: (Math.PI * 2) / 3,
            color: Color.LightGrey,
            border: Color.AutoBorder,
            properties: {
                type: 'Trap',
                skill: {
                    reload: 0.8,
                    speed: 2,
                    size: 1.2,
                },
            },
        },
        {
            offset: 2,
            length: 12,
            width: 20,
            aspect: 1.3,
            angle: -(Math.PI * 2) / 3,
            color: Color.LightGrey,
            border: Color.AutoBorder,
            properties: {
                type: 'Trap',
                skill: {
                    reload: 0.8,
                    speed: 2,
                    size: 1.2,
                },
            },
        },
    ],
    upgrades: [],
};

Class.MegaTrapper = {
    parent: 'Trapper',
    label: 'Mega Trapper',
    guns: [
        {
            offset: 2,
            length: 16,
            width: 24,
            aspect: 1.3,
            angle: 0,
            color: Color.LightGrey,
            border: Color.AutoBorder,
            properties: {
                type: 'Trap',
                skill: {
                    reload: 0.8,
                    speed: 2,
                    size: 1.5,
                    health: 2,
                    damage: 2,
                },
            },
        },
    ],
    upgrades: [],
};

Class.AutoTrapper = {
    parent: 'Trapper',
    label: 'Auto Trapper',
    turrets: [
        {
            offset: new Vector(0, 0),
            angle: 0,
            type: 'AutoTurret',
        },
    ],
    upgrades: [],
};

Class.AutoTurret = {
    size: 8,
    guns: [
        {
            offset: -5,
            length: 12,
            width: 8,
            angle: 0,
            properties: {
                type: 'Bullet',
                skill: {
                    reload: 1,
                    damage: 0.4,
                    speed: 3,
                },
            },
        },
    ],
};

// DRONE TANKS

Class.Overseer = {
    parent: 'Basic',
    label: 'Overseer',
    guns: [
        {
            offset: -5,
            length: 14,
            width: 20,
            angle: Math.PI / 2,
            properties: {
                type: 'Drone',
                maxChildren: 4,
                skill: {
                    reload: 0.4,
                },
            },
        },
        {
            offset: -5,
            length: 14,
            width: 20,
            angle: -Math.PI / 2,
            properties: {
                type: 'Drone',
                maxChildren: 4,
                skill: {
                    reload: 0.4,
                },
            },
        },
    ],
    upgrades: ['Overlord', 'Manager', 'Factory', 'Necromancer'],
};

Class.Overlord = {
    parent: 'Overseer',
    label: 'Overlord',
    guns: [
        {
            offset: -5,
            length: 14,
            width: 20,
            angle: 0,
            properties: {
                type: 'Drone',
                maxChildren: 2,
            },
        },
        {
            offset: -5,
            length: 14,
            width: 20,
            angle: Math.PI / 2,
            properties: {
                type: 'Drone',
                maxChildren: 2,
            },
        },
        {
            offset: -5,
            length: 14,
            width: 20,
            angle: Math.PI,
            properties: {
                type: 'Drone',
                maxChildren: 2,
            },
        },
        {
            offset: -5,
            length: 14,
            width: 20,
            angle: -Math.PI / 2,
            properties: {
                type: 'Drone',
                maxChildren: 2,
            },
        },
    ],
    upgrades: [],
};

Class.Manager = {
    parent: 'Overseer',
    label: 'Manager',
    guns: [
        {
            offset: -5,
            length: 14,
            width: 20,
            angle: 0,
            properties: {
                type: 'Drone',
                maxChildren: 6,
                skill: {
                    reload: 0.3,
                },
            },
        },
    ],
    alpha: 0.2,
    upgrades: [],
};

Class.Factory = {
    parent: 'Overseer',
    label: 'Factory',
    guns: [
        {
            offset: -5,
            length: 22,
            width: 28,
            angle: 0,
            properties: {
                cantFire: true,
            },
        },
        {
            offset: 14,
            length: 6,
            width: 29,
            angle: 0,
            properties: {
                type: 'Minion',
                maxChildren: 6,
                autofire: true,
                skill: {
                    reload: 0.3,
                    range: undefined,
                },
            },
        },
        {
            offset: -5,
            length: 12.5,
            width: 29,
            angle: 0,
            properties: {
                cantFire: true,
            },
        },
    ],
    upgrades: [],
};

Class.Minion = {
    showHealth: false,
    showName: false,
    showScore: false,
    giveScore: false,
    skill: {
        fov: 300,
        speed: 0.2,
        health: 5,
        regen: 0,
        damage: 10,
        pen: 5,
        range: null,
        pushability: 1,
    },
    sides: 0,
    controllers: [new ControllerMaker(MasterCircleMove), new ControllerMaker(MinionNearest), new ControllerMaker(Minion)],
    size: 5,
    bullet: true,
    hardBullet: true,
    guns: [
        {
            offset: -3,
            length: 16,
            width: 28,
            angle: 0,
            properties: {
                type: 'Bullet',
                skill: {
                    reload: 1,
                    damage: 0.4,
                    size: 0.7,
                    speed: 3,
                },
            },
        },
    ],
};

Class.Necromancer = {
    parent: 'Overseer',
    label: 'Necromancer',
    guns: [
        {
            offset: -5,
            length: 14,
            width: 20,
            angle: Math.PI / 2,
            properties: {
                type: 'Square',
                maxChildren: 16,
                skill: {
                    reload: 0.2,
                },
            },
        },
        {
            offset: -5,
            length: 14,
            width: 20,
            angle: -Math.PI / 2,
            properties: {
                type: 'Square',
                maxChildren: 16,
                skill: {
                    reload: 0.2,
                },
            },
        },
    ],
    upgrades: [],
};

Class.Square = {
    parent: 'Drone',
    sides: 4,
};

// SMASHER TANKS

Class.Smasher = {
    parent: 'Basic',
    label: 'Smasher',
    sides: 0,
    skill: {
        speed: 1,
        health: 500,
        damage: 2,
        pen: 10,
        pushability: 2,
    },
    props: [
        {
            offset: new Vector(),
            size: 30,
            sides: -6,
            color: Color.Black,
            layer: -1,
            spin: 0.01,
        },
        {
            offset: new Vector(),
            size: 30,
            sides: -6,
            color: Color.Black,
            layer: -1,
            spin: -0.01,
        },
    ],
    guns: [],
    upgrades: ['Spike', 'Landmine', 'MegaSmasher'],
};

Class.Spike = {
    parent: 'Smasher',
    label: 'Spike',
    props: [
        {
            offset: new Vector(),
            fixedAngle: true,
            size: 35,
            sides: 3,
            color: Color.Black,
            layer: -1,
            spin: 0.01,
        },
        {
            offset: new Vector(),
            fixedAngle: true,
            angle: -Math.PI / 2,
            size: 35,
            sides: 3,
            color: Color.Black,
            layer: -1,
            spin: 0.01,
        },
        {
            offset: new Vector(),
            fixedAngle: true,
            angle: Math.PI / 2,
            size: 35,
            sides: 3,
            color: Color.Black,
            layer: -1,
            spin: 0.01,
        },
        {
            offset: new Vector(),
            fixedAngle: true,
            angle: (Math.PI * 2) / 2,
            size: 35,
            sides: 3,
            color: Color.Black,
            layer: -1,
            spin: 0.01,
        },
    ],
    skill: {
        damage: 2.5,
        pushability: 10,
    },
    upgrades: [],
};

Class.Landmine = {
    parent: 'Smasher',
    label: 'Landmine',
    props: [
        {
            offset: new Vector(),
            size: 28,
            sides: -6,
            color: Color.Black,
            layer: -1,
            spin: 0.01,
        },
        {
            offset: new Vector(),
            size: 28,
            sides: -6,
            color: Color.Black,
            layer: -1,
            spin: -0.01,
        },
    ],
    skill: {
        damage: 2.2,
    },
    upgrades: [],
};

Class.MegaSmasher = {
    parent: 'Smasher',
    label: 'Mega Smasher',
    props: [
        {
            offset: new Vector(),
            size: 34,
            sides: -6,
            color: Color.Black,
            layer: -1,
            spin: 0.01,
        },
        {
            offset: new Vector(),
            size: 34,
            sides: -6,
            color: Color.Black,
            layer: -1,
            spin: -0.01,
        },
    ],
    skill: {
        health: 60,
        damage: 3,
    },
    upgrades: [],
};
