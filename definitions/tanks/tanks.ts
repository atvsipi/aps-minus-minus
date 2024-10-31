import {Class, GunClassType} from '../../src/entity/class';
import {CircleMove, ControllerMaker, GoToMasterTarget, MasterCircleMove, Minion, MinionNearest, Nearest} from '../../src/entity/controller';
import {Vector} from '../../src/physics/vector';
import {Color} from '../../src/definitions/color';
import {Entity} from '@/entity/entity';
import {BASIC_SMASHER_SKILLS} from '@/entity/basic-skills';

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
    size: 7,
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
        fov: 500,
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
    upgrades: ['Twin', 'Sniper', 'MachineGun', 'Destroyer', 'FlankGuard', 'Trapper', 'Overseer', 'Smasher'],
};

Class.Twin = {
    parent: 'Basic',
    label: 'Twin',
    skill: {
        fov: 600,
    },
    guns: [
        {
            offset: -8,
            direction: 10,
            length: 23,
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
            offset: -8,
            direction: -10,
            length: 23,
            width: 16,
            aspect: 1,
            angle: 0,
            properties: {
                type: 'Bullet',
                delaySpawn: 0.5,
                skill: {
                    reload: 0.7,
                    damage: 0.8,
                },
            },
        },
    ],
    upgrades: ['TripleShot', 'Triplet', 'Streamliner', 'OctoTank'],
};

Class.Streamliner = {
    parent: 'Basic',
    label: 'Streamliner',
    guns: [
        {
            offset: -5,
            length: 26,
            width: 14,
            angle: 0,
            properties: {
                type: 'Bullet',
                delaySpawn: 0,
                skill: {
                    reload: 1.5,
                    speed: 1.3,
                },
            },
        },
        {
            offset: -5,
            length: 23,
            width: 14,
            angle: 0,
            properties: {
                type: 'Bullet',
                delaySpawn: 1 / 5,
                skill: {
                    reload: 1.5,
                    speed: 1.3,
                },
            },
        },
        {
            offset: -5,
            length: 20,
            width: 14,
            angle: 0,
            properties: {
                type: 'Bullet',
                delaySpawn: 2 / 5,
                skill: {
                    reload: 1.5,
                    speed: 1.3,
                },
            },
        },
        {
            offset: -5,
            length: 17,
            width: 14,
            angle: 0,
            properties: {
                type: 'Bullet',
                delaySpawn: 3 / 5,
                skill: {
                    reload: 1.5,
                    speed: 1.3,
                },
            },
        },
        {
            offset: -5,
            length: 14,
            width: 14,
            angle: 0,
            properties: {
                type: 'Bullet',
                delaySpawn: 4 / 5,
                skill: {
                    reload: 1.5,
                    speed: 1.3,
                },
            },
        },
    ],
    skill: {
        fov: 550,
    },
    upgrades: [],
};

Class.Triplet = {
    parent: 'Twin',
    label: 'Triplet',
    guns: [
        {
            offset: -5,
            length: 20,
            width: 16,
            angle: 0,
            properties: {
                type: 'Bullet',
                skill: {
                    reload: 1,
                    damage: 0.7,
                },
            },
        },
        {
            offset: -5,
            length: 20,
            width: 16,
            angle: 0,
            properties: {
                type: 'Bullet',
                skill: {
                    reload: 1,
                    damage: 0.7,
                },
            },
        },
        {
            offset: -5,
            length: 22,
            width: 16,
            angle: 0,
            properties: {
                type: 'Bullet',
                skill: {
                    reload: 1,
                    damage: 0.7,
                },
            },
        },
    ],
    skill: {
        fov: 550,
    },
    upgrades: [],
};

Class.OctoTank = {
    parent: 'Basic',
    label: 'Octo Tank',
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
            angle: Math.PI / 2,
            properties: {
                type: 'Bullet',
            },
        },
        {
            offset: -5,
            length: 20,
            width: 16,
            angle: (3 * Math.PI) / 4,
            properties: {
                type: 'Bullet',
            },
        },
        {
            offset: -5,
            length: 20,
            width: 16,
            angle: Math.PI,
            properties: {
                type: 'Bullet',
            },
        },
        {
            offset: -5,
            length: 20,
            width: 16,
            angle: (5 * Math.PI) / 4,
            properties: {
                type: 'Bullet',
            },
        },
        {
            offset: -5,
            length: 20,
            width: 16,
            angle: (3 * Math.PI) / 2,
            properties: {
                type: 'Bullet',
            },
        },
        {
            offset: -5,
            length: 20,
            width: 16,
            angle: (7 * Math.PI) / 4,
            properties: {
                type: 'Bullet',
            },
        },
    ],
    skill: {
        fov: 550,
    },
    upgrades: [],
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
        fov: 800,
    },
    upgrades: ['Assassin'],
};

Class.Assassin = {
    parent: 'Sniper',
    label: 'Assassin',
    guns: [
        {
            offset: -5,
            length: 30,
            width: 16,
            aspect: 1,
            angle: 0,
            properties: {
                type: 'Bullet',
                skill: {
                    reload: 0.3,
                    recoil: 1.4,
                    damage: 1.8,
                    speed: 5.5,
                    range: 3.5,
                },
            },
        },
    ],
    skill: {
        fov: 1000,
    },
    upgrades: ['Ranger'],
};

Class.Ranger = {
    parent: 'Assassin',
    label: 'Ranger',
    guns: [
        {
            offset: -5,
            length: 34,
            width: 16,
            aspect: 1,
            angle: 0,
            properties: {
                type: 'Bullet',
                skill: {
                    reload: 0.25,
                    recoil: 1.6,
                    damage: 2,
                    speed: 6,
                    range: 4,
                },
            },
        },
    ],
    skill: {
        fov: 1200,
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
    skill: {
        fov: 600,
    },
    upgrades: ['GunnerTrapper'],
};

Class.FlankGuard = {
    parent: 'Basic',
    label: 'Flank Guard',
    guns: [
        {
            offset: -5,
            length: 22,
            width: 18,
            angle: 0,
            properties: {
                type: 'Bullet',
                skill: {
                    speed: 1,
                },
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
    skill: {
        fov: 650,
    },
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
    skill: {
        fov: 500,
    },
    upgrades: ['PentaShot', 'Spread'],
};

Class.Spread = {
    parent: 'Basic',
    label: 'Spread Shot',
    guns: [
        {
            offset: -5,
            length: 20,
            width: 16,
            angle: (3 * Math.PI) / 10,
            properties: {
                type: 'Bullet',
                skill: {
                    size: 0.8,
                    damage: 0.8,
                },
            },
        },
        {
            offset: -5,
            length: 20,
            width: 16,
            angle: -(3 * Math.PI) / 10,
            properties: {
                type: 'Bullet',
                skill: {
                    size: 0.8,
                    damage: 0.8,
                },
            },
        },
        {
            offset: -5,
            length: 22,
            width: 16,
            angle: Math.PI / 5,
            properties: {
                type: 'Bullet',
                skill: {
                    size: 1,
                    damage: 1,
                },
            },
        },
        {
            offset: -5,
            length: 22,
            width: 16,
            angle: -Math.PI / 5,
            properties: {
                type: 'Bullet',
                skill: {
                    size: 1,
                    damage: 1,
                },
            },
        },
        {
            offset: -5,
            length: 24,
            width: 16,
            angle: Math.PI / 10,
            properties: {
                type: 'Bullet',
                skill: {
                    size: 1.2,
                    damage: 1.3,
                },
            },
        },
        {
            offset: -5,
            length: 24,
            width: 16,
            angle: -Math.PI / 10,
            properties: {
                type: 'Bullet',
                skill: {
                    size: 1.2,
                    damage: 1.3,
                },
            },
        },
        {
            offset: -5,
            length: 26,
            width: 16,
            angle: 0,
            properties: {
                type: 'Bullet',
                skill: {
                    size: 1.4,
                    damage: 1.7,
                },
            },
        },
    ],
    skill: {
        fov: 550,
    },
    upgrades: [],
};

Class.PentaShot = {
    parent: 'TripleShot',
    label: 'Penta Shot',
    guns: [
        {
            offset: -5,
            length: 22,
            width: 16,
            angle: Math.PI / 4,
            properties: {
                type: 'Bullet',
            },
        },
        {
            offset: -5,
            length: 22,
            width: 16,
            angle: -Math.PI / 4,
            properties: {
                type: 'Bullet',
            },
        },

        {
            offset: -5,
            length: 24,
            width: 16,
            angle: Math.PI / 10,
            properties: {
                type: 'Bullet',
            },
        },
        {
            offset: -5,
            length: 24,
            width: 16,
            angle: -Math.PI / 10,
            properties: {
                type: 'Bullet',
            },
        },
        {
            offset: -5,
            length: 26,
            width: 16,
            angle: 0,
            properties: {
                type: 'Bullet',
            },
        },
    ],
    skill: {
        fov: 500,
    },
    upgrades: [],
};

Class.Destroyer = {
    parent: 'Basic',
    label: 'Destroyer',
    guns: [
        {
            offset: -5,
            length: 24,
            width: 28,
            angle: 0,
            properties: {
                type: 'Bullet',
                skill: {
                    reload: 0.4,
                    recoil: 2,
                    size: 1.5,
                    damage: 2,
                    speed: 3,
                    range: 1.5,
                },
            },
        },
    ],
    skill: {
        fov: 550,
    },
    upgrades: ['Hybrid', 'Annihilator'],
};

Class.Hybrid = {
    parent: 'Destroyer',
    label: 'Hybrid',
    guns: [
        {
            offset: -5,
            length: 24,
            width: 28,
            angle: 0,
            properties: {
                type: 'Bullet',
                skill: {
                    reload: 0.4,
                    recoil: 2,
                    size: 1.5,
                    damage: 2,
                    speed: 3,
                    range: 1.5,
                },
            },
        },
        {
            offset: -5,
            length: 14,
            width: 22,
            aspect: 1.3,
            angle: Math.PI,
            properties: {
                type: 'Drone',
                maxChildren: 2,
                autofire: true,
                skill: {
                    reload: 0.4,
                    size: 1.2,
                    range: undefined,
                },
            },
        },
    ],
    skill: {
        fov: 550,
    },
    upgrades: [],
};

Class.Annihilator = {
    parent: 'Destroyer',
    label: 'Annihilator',
    guns: [
        {
            offset: -5,
            length: 24,
            width: 34,
            angle: 0,
            properties: {
                type: 'Bullet',
                skill: {
                    reload: 0.3,
                    recoil: 2.5,
                    size: 2,
                    damage: 2.5,
                    speed: 2.5,
                    range: 1.5,
                },
            },
        },
    ],
    skill: {
        fov: 550,
    },
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
    skill: {
        fov: 500,
    },
    upgrades: ['TriTrapper', 'MegaTrapper', 'GunnerTrapper', 'OverTrapper'],
};

Class.GunnerTrapper = {
    parent: 'Trapper',
    label: 'Gunner Trapper',
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
            offset: -5,
            length: 18,
            width: 8,
            angle: 0,
            properties: {
                type: 'Bullet',
                skill: {
                    reload: 1,
                    damage: 0.7,
                    speed: 3,
                },
            },
        },
        {
            offset: -5,
            length: 18,
            width: 8,
            angle: 0,
            properties: {
                type: 'Bullet',
                skill: {
                    reload: 1,
                    damage: 0.7,
                    speed: 3,
                },
            },
        },
    ],
    skill: {
        fov: 550,
    },
    upgrades: [],
};

Class.OverTrapper = {
    parent: 'Trapper',
    label: 'Overtrapper',
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
            offset: -5,
            length: 14,
            width: 22,
            aspect: 1.3,
            angle: Math.PI / 2,
            properties: {
                type: 'Drone',
                maxChildren: 2,
                autofire: true,
                skill: {
                    reload: 0.4,
                    size: 1.2,
                    range: undefined,
                },
            },
        },
        {
            offset: -5,
            length: 14,
            width: 22,
            aspect: 1.3,
            angle: -Math.PI / 2,
            properties: {
                type: 'Drone',
                maxChildren: 2,
                autofire: true,
                skill: {
                    reload: 0.4,
                    size: 1.2,
                    range: undefined,
                },
            },
        },
    ],
    skill: {
        fov: 550,
    },
    upgrades: [],
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
    skill: {
        fov: 500,
    },
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
    skill: {
        fov: 550,
    },
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
            width: 22,
            aspect: 1.3,
            angle: Math.PI / 2,
            properties: {
                type: 'Drone',
                maxChildren: 2,
                autofire: true,
                skill: {
                    reload: 0.4,
                    size: 1.2,
                    range: undefined,
                },
            },
        },
        {
            offset: -5,
            length: 14,
            width: 22,
            aspect: 1.3,
            angle: -Math.PI / 2,
            properties: {
                type: 'Drone',
                maxChildren: 2,
                autofire: true,
                skill: {
                    reload: 0.4,
                    size: 1.2,
                    range: undefined,
                },
            },
        },
    ],
    skill: {
        fov: 600,
    },
    upgrades: ['Overlord', 'Manager', 'Factory', 'Swarmer', 'Necromancer', 'OverTrapper'],
};

Class.Overlord = {
    parent: 'Overseer',
    label: 'Overlord',
    guns: [
        {
            offset: -5,
            length: 14,
            width: 22,
            angle: 0,
            aspect: 1.3,
            properties: {
                type: 'Drone',
                maxChildren: 2,
                autofire: true,
                skill: {
                    reload: 0.4,
                    size: 1.2,
                    range: undefined,
                },
            },
        },
        {
            offset: -5,
            length: 14,
            width: 22,
            aspect: 1.3,
            angle: Math.PI / 2,
            properties: {
                type: 'Drone',
                maxChildren: 2,
                autofire: true,
                skill: {
                    reload: 0.4,
                    size: 1.2,
                    range: undefined,
                },
            },
        },
        {
            offset: -5,
            length: 14,
            width: 22,
            aspect: 1.3,
            angle: Math.PI,
            properties: {
                type: 'Drone',
                maxChildren: 2,
                autofire: true,
                skill: {
                    reload: 0.4,
                    size: 1.2,
                    range: undefined,
                },
            },
        },
        {
            offset: -5,
            length: 14,
            width: 22,
            aspect: 1.3,
            angle: -Math.PI / 2,
            properties: {
                type: 'Drone',
                maxChildren: 2,
                skill: {
                    reload: 0.4,
                    size: 1.2,
                    range: undefined,
                },
            },
        },
    ],
    skill: {
        fov: 550,
    },
    upgrades: [],
};

Class.Manager = {
    parent: 'Overseer',
    label: 'Manager',
    guns: [
        {
            offset: -5,
            length: 14,
            width: 22,
            aspect: 1.3,
            angle: Math.PI / 2,
            properties: {
                type: 'Drone',
                maxChildren: 6,
                autofire: true,
                skill: {
                    reload: 0.4,
                    size: 1.2,
                    range: undefined,
                },
            },
        },
    ],
    skill: {
        fov: 550,
    },
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
    skill: {
        fov: 600,
    },
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

Class.Swarmer = {
    parent: 'Basic',
    label: 'Swarmer',
    guns: [
        {
            offset: -5,
            direction: -8,
            length: 16,
            width: 14,
            aspect: 0.8,
            angle: 0,
            properties: {
                type: 'Swarm',
                skill: {
                    reload: 0.5,
                    size: 1,
                    range: 4,
                },
            },
        },
        {
            offset: -5,
            direction: 8,
            length: 16,
            width: 14,
            aspect: 0.8,
            angle: 0,
            properties: {
                type: 'Swarm',
                skill: {
                    reload: 0.5,
                    size: 1,
                    range: 4,
                },
            },
        },
    ],
    skill: {
        fov: 550,
    },
    upgrades: ['Battleship'],
};

Class.Swarm = {
    parent: 'Drone',
    showHealth: false,
    showName: false,
    showScore: false,
    giveScore: false,
    skill: {
        fov: 200,
        speed: 0.4,
        health: 3,
        regen: 0,
        damage: 7,
        pen: 3,
        range: null,
        pushability: 0.5,
    },
    sides: 3,
    controllers: [new ControllerMaker(MasterCircleMove), new ControllerMaker(Nearest), new ControllerMaker(GoToMasterTarget)],
    size: 5,
    bullet: true,
    hardBullet: false,
};

Class.Battleship = {
    parent: 'Overseer',
    label: 'Battleship',
    guns: [
        {
            offset: -5,
            direction: -8,
            length: 16,
            width: 14,
            aspect: 0.8,
            angle: 0,
            properties: {
                type: 'Swarm',
                skill: {
                    reload: 0.5,
                    size: 1,
                    range: 4,
                },
            },
        },
        {
            offset: -5,
            direction: 8,
            length: 16,
            width: 14,
            aspect: 0.8,
            angle: 0,
            properties: {
                type: 'Swarm',
                skill: {
                    reload: 0.5,
                    size: 1,
                    range: 4,
                },
            },
        },
        {
            offset: -5,
            direction: -8,
            length: 16,
            width: 14,
            aspect: 0.8,
            angle: -Math.PI,
            properties: {
                type: 'Swarm',
                skill: {
                    reload: 0.5,
                    size: 1,
                    range: 4,
                },
            },
        },
        {
            offset: -5,
            direction: 8,
            length: 16,
            width: 14,
            aspect: 0.8,
            angle: -Math.PI,
            properties: {
                type: 'Swarm',
                skill: {
                    reload: 0.5,
                    size: 1,
                    range: 4,
                },
            },
        },
    ],
    skill: {
        fov: 600,
    },
    upgrades: [],
};

Class.Necromancer = {
    parent: 'Overseer',
    label: 'Necromancer',
    sides: 4,
    size: 14,
    guns: [
        {
            offset: -5,
            length: 10,
            width: 18,
            aspect: 1.1,
            angle: Math.PI / 2,
            properties: {
                type: 'Square',
                maxChildren: 7,
                autofire: true,
                skill: {
                    reload: 0.2,
                    range: undefined,
                },
            },
        },
        {
            offset: -5,
            length: 10,
            width: 18,
            aspect: 1.1,
            angle: -Math.PI / 2,
            properties: {
                type: 'Square',
                maxChildren: 7,
                autofire: true,
                skill: {
                    reload: 0.2,
                    range: undefined,
                },
            },
        },
    ],
    skill: {
        fov: 600,
    },
    on: {
        collision(body: Entity, other: Entity) {
            if (other.setting.label === 'Square') {
                const size = other.setting.size;
                other.team = body.team;
                other.team2 = body.team2;
                other.master = body;
                other.init('Square');
                other.setting.size = size;
            }

            return true;
        },
    },
    upgrades: [],
};

Class.Square = {
    parent: 'Drone',
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
    sides: 4,
    controllers: [new ControllerMaker(MasterCircleMove), new ControllerMaker(Nearest), new ControllerMaker(GoToMasterTarget)],
    size: 8,
    bullet: true,
    hardBullet: true,
    hitType(body, other) {
        if (other.setting.label === 'Square') {
            const size = other.setting.size;
            other.team = body.team;
            other.team2 = body.team2;
            other.master = body;
            other.init('Square');
            other.setting.size = size;
        }

        return true;
    },
};

// SMASHER TANKS

Class.Smasher = {
    parent: 'Basic',
    label: 'Smasher',
    userSkill: BASIC_SMASHER_SKILLS,
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
            fixedAngle: true,
            size: 25,
            sides: -6,
            color: Color.Black,
            layer: -1,
            spin: 0.02,
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
            size: 29,
            sides: 3,
            color: Color.Black,
            layer: -1,
            spin: 0.02,
        },
        {
            offset: new Vector(),
            fixedAngle: true,
            angle: -Math.PI / 2,
            size: 29,
            sides: 3,
            color: Color.Black,
            layer: -1,
            spin: 0.02,
        },
        {
            offset: new Vector(),
            fixedAngle: true,
            angle: Math.PI / 2,
            size: 29,
            sides: 3,
            color: Color.Black,
            layer: -1,
            spin: 0.02,
        },
        {
            offset: new Vector(),
            fixedAngle: true,
            angle: (Math.PI * 2) / 2,
            size: 29,
            sides: 3,
            color: Color.Black,
            layer: -1,
            spin: 0.02,
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
            fixedAngle: true,
            size: 25,
            sides: -6,
            color: Color.Black,
            layer: -1,
            spin: 0.02,
        },
        {
            offset: new Vector(),
            fixedAngle: true,
            size: 25,
            sides: -6,
            color: Color.Black,
            layer: -1,
            spin: 0.03,
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
            fixedAngle: true,
            size: 28,
            sides: -6,
            color: Color.Black,
            layer: -1,
            spin: 0.02,
        },
    ],
    skill: {
        health: 60,
        damage: 3,
    },
    upgrades: [],
};
