import {VectorLike} from '../physics/vector';

export class RandomPosGenerator {
    public height: number;
    public width: number;
    public exclusionZone: [VectorLike, VectorLike][];

    constructor(width: number, height: number, exclusionZone: [VectorLike, VectorLike][]) {
        this.width = width;
        this.height = height;

        this.exclusionZone = exclusionZone;
    }

    public getRandomPos(): VectorLike {
        let pos: VectorLike;
        do {
            pos = {x: Math.random() * this.width, y: Math.random() * this.height};
        } while (this.exclusionZone.some(([min, max]) => pos.x >= min.x && pos.x <= max.x && pos.y >= min.y && pos.y <= max.y));

        return pos;
    }
}

export function randomFood(
    foods: {
        type: string;
        weight: number;
    }[],
) {
    const totalWeight = foods.reduce((sum: number, food) => sum + food.weight, 0);

    let random = Math.random() * totalWeight;

    for (let food of foods) {
        if (random < food.weight) {
            return food.type;
        }
        random -= food.weight;
    }
}
