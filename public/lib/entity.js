import {Color} from './color.js';
import {Team} from './team.js';
import {Vector} from './vector.js';

export class Entity {
    id = 0;
    health = 100;
    angle = 0;
    pos = new Vector();
    serverPos = new Vector();
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
