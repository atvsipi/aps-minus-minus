import {Color} from '../definitions/color';

export interface Class {
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

export const Classes: {[key: string]: ProcessedClass} = {};

function processClass(entityClass: Class, defaultEntity: ProcessedClass) {
    let processed = Object.assign({}, defaultEntity, entityClass);

    processed.guns = [];

    if (entityClass.guns)
        for (const gun of entityClass.guns) {
            processed.guns.push(Object.assign({}, defaultEntity.guns[0], gun));
        }

    if (entityClass.parent) {
        processed = processClass(processed, Classes[entityClass.parent]);
    }

    return processed;
}

export function AddClass(name: string, target: Class) {
    Classes[name] = processClass(target, defaultEntity);

    return Classes[name];
}
