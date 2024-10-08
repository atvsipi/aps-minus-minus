import {ClassLoader, EntityClass} from './entity/class';

await import('./definitions/tanks');

ClassLoader();

import {Listen} from './network/web-server';
import {Logger} from './util/logger';
import {room} from './room/room';
import {RoomConfig} from './room/roomconfig';
import {Entity} from './entity/entity';
import {Color} from './definitions/color';
import {Vector} from './physics/vector';
import {Nearest} from './entity/controller';

Listen(3003, () => {
    Logger.success('Web server is listen on 3003!');
});

setInterval(() => {
    room.update();
}, RoomConfig.tick);

{
    const entity = new Entity();

    entity.init(EntityClass.Wall);
    entity.pos = new Vector(50, 50);

    room.insert(entity);
}

{
    const entity = new Entity();

    entity.init(EntityClass.Wall);
    entity.pos = new Vector(50, 120);

    room.insert(entity);
}

{
    const entity = new Entity();

    entity.init(EntityClass.Wall);
    entity.pos = new Vector(50, 180);

    room.insert(entity);
}

{
    const entity = new Entity();

    entity.init(EntityClass.Wall);
    entity.pos = new Vector(120, 180);

    room.insert(entity);
}

{
    const entity = new Entity();

    entity.init(EntityClass.Wall);
    entity.pos = new Vector(120, 50);

    room.insert(entity);
}

{
    const entity = new Entity();

    entity.init(EntityClass.bot);

    room.insert(entity);
}
