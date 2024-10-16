import {Color} from './color.js';
import {Team} from './team.js';
import {Vector} from './vector.js';

export class Entity {
    id = 0;
    health = 100;
    angle = 0;
    pos = new Vector();
    vel = new Vector();
    score = 0;
    size = 0;

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

    isLoaded = false;
}
