import {grid} from './canvas.js';
import {Color} from './color.js';
import {Vector} from './vector.js';

const corner = 5;

const gridSize = 50;
const gridWidth = 1;

const gridGraphics = new PIXI.Graphics();
grid.addChild(gridGraphics);

export function addGrid(world) {
    gridGraphics.clear();
    gridGraphics.alpha = 0.1;
    for (let y = 0; y <= world.height; y += gridSize) {
        gridGraphics.rect(0, y, world.width, gridWidth).fill({color: Color.Black2});
    }
    for (let x = 0; x <= world.width; x += gridSize) {
        gridGraphics.rect(x, 0, gridWidth, world.height).fill({color: Color.Black2});
    }
}

export function addEntity(obj) {
    if (!obj.pixi) {
        obj.pixi = {
            container: new PIXI.Container(),
            underShape: new PIXI.Graphics(),
            shape: new PIXI.Graphics(),
            gun: new PIXI.Graphics(),
            info: new PIXI.Container(),
        };

        obj.pixi.container.addChild(obj.pixi.underShape, obj.pixi.shape, obj.pixi.gun, obj.pixi.info);
    }

    obj.pixi.shape.clear();

    if (Array.isArray(obj.sides)) {
        obj.pixi.shape.poly(obj.sides);
        obj.pixi.shape.scale.x = obj.size;
        obj.pixi.shape.scale.y = obj.size;
    } else if (typeof obj.sides === 'string') {
        // TODO
    } else if (!obj.sides) {
        obj.pixi.shape.circle(0, 0, obj.size);
    } else if (obj.sides < 0) {
        const angle = entity.angle + Math.PI / entity.sides;

        obj.pixi.shape.roundPoly(0, 0, obj.size, obj.sides, corner, angle);
    } else if (obj.sides > 0) {
        const angle = entity.angle + Math.PI / entity.sides;

        obj.pixi.shape.star(0, 0, -obj.sides, obj.size, obj.size * 0.3, angle);
    }

    obj.pixi.shape.fill(obj.color);
    obj.pixi.shape.stroke({
        width: 6,
        color: obj.border,
    });

    for (const gun of obj.guns.sort((a, b) => a.layer - b.layer)) {
        const size = obj.size / 20;
        const p1 = new Vector(obj.size + gun.offset * size, ((gun.width / 2) * size) / gun.aspect).rotate(gun.angle);
        const p3 = new Vector(obj.size + gun.offset * size, -(((gun.width / 2) * size) / gun.aspect)).rotate(gun.angle);
        const p2 = new Vector(obj.size + (gun.offset + gun.length) * size, ((gun.width * size) / 2) * gun.aspect).rotate(gun.angle);
        const p4 = new Vector(obj.size + (gun.offset + gun.length) * size, -(((gun.width * size) / 2) * gun.aspect)).rotate(gun.angle);

        const graphics = gun.layer < 0 ? obj.pixi.underShape : obj.pixi.gun;

        graphics.poly([p1.x, p1.y, p2.x, p2.y, p4.x, p4.y, p3.x, p3.y, p1.x, p1.y]);

        graphics.fill(gun.color).stroke({
            width: 6,
            color: gun.border,
        });
        graphics.alpha = gun.alpha;
    }
}

export function addEntityInfo(obj) {}
