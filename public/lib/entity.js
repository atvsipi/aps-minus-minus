import {Color} from './color.js';
import {Team} from './team.js';
import {Vector} from './vector.js';

export class Prop {
    _offset = new Vector();
    angle = 0;
    spin = 0;
    spin2 = 0;
    color = Color.Black;
    border = Color.Black;
    size = 0;
    sides = 0;
    strokeWidth = 0;
    alpha = 0;
    layer = 0;

    offset = new Vector();

    update() {
        this.offset.rotate(this.spin2 / 70);
    }
}

export class Entity {
    id = 0;
    health = 100;
    angle = 0;
    pos = new Vector();
    vel = new Vector();
    level = 0;
    score = 0;
    levelScore = 0;
    size = 0;

    upgrades = [];

    team = Team[0];
    maxHealth = 100;
    showHealth = true;
    showName = true;
    showScore = true;

    fov = 100;

    name = 'Entity';

    color = Color.Black;
    border = Color.Black;

    mockupId = 0;

    sides = 0;
    guns = [];
    props = [];

    isLoaded = false;

    update() {
        for (const prop of this.props) {
            prop.update();
        }
    }
}
