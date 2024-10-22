import {EntityClass} from '../entity/class';
import {Entity} from '../entity/entity';
import {RoomConfig} from './room-config';
import {World} from './world';

export class RoomLoop extends World {
    public spawn(name: string) {
        const entity = new Entity();

        entity.init(EntityClass.Player);

        entity.name = name;

        RoomConfig.spawn(entity);

        return entity;
    }
}
