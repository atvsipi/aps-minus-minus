import {Color} from '../definitions/color';
import {Vector} from '../physics/vector';
import {Logger} from '../util/logger';
import {Controller} from './controller';
import {Entity, EntitySetting} from './entity';
import {GunSetting} from './gun';
import {PropSetting} from './props';
import {TurretSetting} from './turret';

export interface GunClassType {
    offset?: number;
    direction?: number;
    length?: number;
    width?: number;
    aspect?: number;
    angle?: number;
    color?: Color | string;
    border?: Color | string;
    strokeWidth?: number;
    alpha?: number;
    layer?: number;
    properties?: {
        type?: string;
        autofire?: boolean;
        altFire?: boolean;
        delaySpawn?: number;
        maxChildren?: false | number;
        independentChildren?: boolean;
        destroyOldestChild?: boolean;
        controllers?: Controller[];
        skill?: {
            reload?: number;
            recoil?: number;
            size?: number;
            health?: number;
            damage?: number;
            pen?: number;
            speed?: number;
            range?: number;
            spray?: number;
        };
    };
}

export interface PropClassType {
    offset?: Vector;
    angle?: number;
    fixedAngle?: boolean;
    spin?: number;
    spin2?: number;
    color?: Color | string;
    border?: Color | string;
    size?: number;
    sides?: number | string | Vector[];
    strokeWidth?: number;
    alpha?: number;
    layer?: number;
}

export interface TurretClassType {
    offset?: Vector;
    angle?: number;
    fixedAngle?: boolean;
    spin?: number;
    spin2?: number;
    type: string;
}

export interface ClassType {
    parent?: string;
    showHealth?: boolean;
    showName?: boolean;
    showScore?: boolean;
    giveScore?: boolean;
    killMessage?: boolean | string;
    label?: string;
    hitType?: 'none' | 'auto' | ((other: Entity) => void);
    miniMapType?: 'none' | 'always' | 'team' | ((other: Entity) => boolean);
    score?: number;
    name?: null | string;
    size?: number;
    mass?: number;
    sides?: string | number | Vector[];
    isFixed?: boolean;
    airplane?: boolean;
    food?: boolean;
    hardBullet?: boolean;
    bullet?: boolean;
    independent?: boolean;
    controllers?: Controller[];
    skill?: {
        speed?: number;
        health?: number;
        regen?: number;
        damage?: number;
        pen?: number;
        range?: number | null;
        pushability?: number;
        fov?: number;
    };
    color?: Color | string;
    border?: Color | string;
    strokeWidth?: number;
    alpha?: number;
    guns?: GunClassType[];
    props?: PropClassType[];
    turrets?: TurretClassType[];
    upgrades?: string[];
    tier?: number;
    on?: {[key: string]: (body: Entity, ...args: unknown[]) => unknown};
}

export interface ProcessedClass extends EntitySetting {
    tier: number;
    mockupId: number;
    color: Color | string;
    border: Color | string;
    strokeWidth: number;
    alpha: number;
    guns: GunSetting[];
    props: PropSetting[];
    turrets: TurretSetting[];
    upgrades: string[];
}

const defaultGun: GunSetting = {
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
    properties: {
        type: 'Bullet',
        autofire: false,
        altFire: false,
        delaySpawn: 0,
        maxChildren: false,
        independentChildren: false,
        destroyOldestChild: false,
        controllers: [],
        skill: {
            reload: 1,
            recoil: 1,
            size: 1,
            health: 1,
            damage: 1,
            pen: 1,
            speed: 1,
            range: 1,
            spray: 1,
        },
    },
};

const defaultProp: PropSetting = {
    offset: new Vector(),
    angle: 0,
    fixedAngle: false,
    spin: 0,
    spin2: 0,
    color: Color.TeamColor,
    border: Color.AutoBorder,
    size: 5,
    sides: 0,
    strokeWidth: 4,
    alpha: 1,
    layer: 1,
};

const defaultTurret: TurretSetting = {
    offset: new Vector(),
    angle: 0,
    fixedAngle: false,
    spin: 0,
    spin2: 0,
    type: 'Basic',
};

const defaultEntity: ProcessedClass = {
    tier: 0,
    mockupId: 0,
    showHealth: true,
    showName: true,
    showScore: true,
    giveScore: true,
    killMessage: false,
    label: 'Entity',
    hitType: 'auto',
    miniMapType: 'none',
    score: 25000,
    name: null,
    size: 10,
    mass: 1,
    sides: 0,
    isFixed: false,
    airplane: false,
    hardBullet: false,
    bullet: false,
    food: false,
    independent: false,
    controllers: [],
    skill: {
        speed: 0.5,
        health: 100,
        regen: 0.1,
        damage: 3,
        pen: 10,
        range: null,
        pushability: 1,
        fov: 800,
    },
    color: Color.TeamColor,
    border: Color.AutoBorder,
    strokeWidth: 4,
    alpha: 1,
    guns: [],
    props: [],
    turrets: [],
    upgrades: [],
    on: {},
};

export const Class: {[key: string]: ClassType} = {};
export const EntityClass: {[key: string]: ProcessedClass} = {};

let Cache: {[key: string]: ProcessedClass} = {};

let mockups = 1;

function ProcessClass(name: string, entityClass: ClassType, basic: ProcessedClass) {
    if (Cache[name]) return Cache[name];

    let processed = Object.assign({}, basic, entityClass);

    if (entityClass.skill) processed.skill = Object.assign({}, basic.skill, entityClass.skill);

    if (entityClass.guns) {
        processed.guns = [];

        for (const gun of entityClass.guns) {
            const processedGun = Object.assign({}, defaultGun, gun);
            if (gun.properties?.skill) processedGun.properties.skill = Object.assign({}, defaultGun.properties.skill, gun.properties.skill);

            processed.guns.push(processedGun);
        }
    }

    if (entityClass.props) {
        processed.props = [];

        for (const prop of entityClass.props) {
            const processedProp = Object.assign({}, defaultProp, prop);

            processed.props.push(processedProp);
        }
    }

    if (entityClass.turrets) {
        processed.turrets = [];

        for (const turret of entityClass.turrets) {
            const processedTurret = Object.assign({}, defaultTurret, turret);

            processed.turrets.push(processedTurret);
        }
    }

    if (entityClass.parent) {
        const parent = entityClass.parent;
        processed.parent = undefined;

        processed = ProcessClass(name, processed, ProcessClass(parent, Class[parent], defaultEntity));
    }

    processed.mockupId = mockups++;

    Cache[name] = processed;

    return processed;
}

export function ClassLoader() {
    Logger.info('Loading class...');

    Cache = {};

    const keys = Object.keys(Class);

    for (let i = 0; i < keys.length; i++) {
        EntityClass[keys[i]] = ProcessClass(keys[i], Class[keys[i]], defaultEntity);
        if (i % 10 === 0) Logger.info(`Class loaded ${i + 1}/${keys.length}`);
    }

    Logger.success('All classes loaded!');
}
