import {Color} from '../definitions/color';
import {Logger} from '../util/logger';

export interface ClassType {
    parent?: string;
    size?: number;
    mass?: number;
    sides?: number;
    isFixed?: boolean;
    airplane?: boolean;
    bullet?: boolean;
    color?: Color | string;
    border?: Color | string;
    guns?: {
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
    }[];
}

export interface ProcessedClass {
    size: number;
    mass: number;
    sides: number;
    isFixed: boolean;
    airplane: boolean;
    bullet: boolean;
    color: Color | string;
    border: Color | string;
    guns: {
        offset: number;
        direction: number;
        length: number;
        width: number;
        aspect: number;
        angle: number;
        color: Color | string;
        border: Color | string;
        strokeWidth: number;
        alpha: number;
        layer: number;
    }[];
}

const defaultEntity: ProcessedClass = {
    size: 10,
    mass: 1,
    sides: 0,
    isFixed: false,
    airplane: false,
    bullet: false,
    color: Color.TeamColor,
    border: Color.AutoBorder,
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
};

export const Class: {[key: string]: ClassType} = {};
export const EntityClass: {[key: string]: ProcessedClass} = {};

const Cache: {[key: string]: ProcessedClass} = {};

function ProcessClass(name: string, entityClass: ClassType, basic: ProcessedClass) {
    if (Cache[name]) return Cache[name];

    let processed = Object.assign({}, basic, entityClass);

    processed.guns = [];

    if (entityClass.guns)
        for (const gun of entityClass.guns) {
            processed.guns.push(Object.assign({}, defaultEntity.guns[0], gun));
        }

    if (entityClass.parent) {
        processed = ProcessClass(entityClass.parent, processed, ProcessClass(entityClass.parent, Class[entityClass.parent], defaultEntity));
    }

    return processed;
}

export function ClassLoader() {
    Logger.info('Loading class...');

    const keys = Object.keys(Class);

    for (let i = 0; i < keys.length; i++) {
        EntityClass[keys[i]] = ProcessClass(keys[i], Class[keys[i]], defaultEntity);
        if (i % 10 === 0) Logger.info(`Class loaded ${i + 1}/${keys.length}`);
    }

    Logger.success('All classes loaded!');
}
