import {Color} from '@/definitions/color';
import {Team} from '@/definitions/team';
import {Class} from '@/entity/class';
import {Entity} from '@/entity/entity';

Class.Wall = {
    label: 'Wall',
    showHealth: false,
    showName: false,
    showScore: false,
    sides: 4,
    isFixed: true,
    size: 49,
    skill: {damage: 0, health: 10000, regen: 100},
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
    skill: {damage: 0, health: 10000, regen: 100},
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
