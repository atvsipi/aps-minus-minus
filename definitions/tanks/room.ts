import {Color} from '@/definitions/color';
import {Team} from '@/definitions/team';
import {Class} from '@/entity/class';
import {CircleMove, ControllerMaker, Nearest} from '@/entity/controller';
import {Entity} from '@/entity/entity';

Class.Wall = {
    label: 'Wall',
    showHealth: false,
    showName: false,
    showScore: false,
    sides: 4,
    isFixed: true,
    size: 49,
    skill: {damage: 0, health: 1000000, regen: 100},
    guns: [],
    miniMapType: 'always',
    color: Color.LightGrey,
};

Class.Base = {
    label: 'Base',
    showHealth: false,
    showName: false,
    showScore: false,
    sides: 4,
    isFixed: true,
    size: 300,
    skill: {damage: 0, health: 1000000, regen: 10000},
    guns: [],
    alpha: 0.3,
    miniMapType: 'always',
    color: Color.TeamColor,
    border: Color.TeamColor,
    strokeWidth: 0,
    hitType(entity, other) {
        if (!Entity.isSameTeam(entity, other) && other.team !== Team.Room) {
            other.room.remove(other);
            other.health = 0;
            other.socket.sendMsg('You died a stupid death.');
        }
    },
};

Class.BaseDrone = {
    showHealth: false,
    showName: false,
    showScore: false,
    giveScore: false,
    independent: true,
    skill: {
        fov: 500,
        speed: 1,
        health: 60,
        regen: 0,
        damage: 1,
        pen: 5,
        range: null,
        pushability: 10,
    },
    sides: 3,
    controllers: [new ControllerMaker(CircleMove), new ControllerMaker(Nearest, true)],
    size: 3,
};

Class.BaseDroneMaker = {
    label: 'Base',
    showHealth: false,
    showName: false,
    showScore: false,
    sides: 0,
    isFixed: true,
    size: 0,
    skill: {damage: 0, health: 10000, regen: 100},
    guns: [
        {
            offset: -10,
            direction: 0,
            length: 1,
            width: 1,
            aspect: 1,
            angle: 0,
            color: Color.LightGrey,
            border: Color.AutoBorder,
            strokeWidth: 0,
            alpha: 1,
            layer: -1,
            properties: {
                type: 'BaseDrone',
                autofire: true,
                altFire: false,
                delaySpawn: 0,
                maxChildren: 10,
                independentChildren: false,
                destroyOldestChild: false,
                skill: {
                    reload: 1,
                    recoil: 1,
                    size: 2,
                    health: 1,
                    damage: 1,
                    pen: 1,
                    speed: 3,
                    range: 5,
                    spray: 1,
                },
            },
        },
    ],
    alpha: 0,
    miniMapType: 'none',
    color: Color.TeamColor,
    border: Color.TeamColor,
    strokeWidth: 0,
    hitType: 'none',
};

Class.ArenaCloser = {
    label: 'Arena Closer',
    name: 'Arena Closer',
    showHealth: false,
    showName: true,
    showScore: false,
    airplane: true,
    sides: 0,
    size: 80,
    skill: {damage: 10000, health: 10000, regen: 100, fov: 100000000, speed: 1},
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
                    reload: 1,
                    recoil: 1,
                    size: 8,
                    health: 10,
                    damage: 10,
                    pen: 1,
                    speed: 6,
                    range: 2,
                    spray: 1,
                },
            },
        },
    ],
    controllers: [new ControllerMaker(Nearest, true)],
    alpha: 1,
    miniMapType: 'always',
    color: Color.Yellow,
    strokeWidth: 4,
};
