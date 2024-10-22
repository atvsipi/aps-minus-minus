import {Team} from '@/definitions/team';
import {Entity} from '@/entity/entity';
import {Vector} from '@/physics/vector';
import {RoomConfig} from '@/room/room-config';
import {RoomLoop} from '@/room/room-loop';
export default {
    name: 'room',
    room: class extends RoomLoop {
        constructor() {
            super();
        }

        public init() {
            {
                const entity = new Entity();

                entity.init('Wall');
                entity.pos = new Vector(50, 50);

                this.insert(entity);
            }

            {
                const entity = new Entity();

                entity.init('Wall');
                entity.pos = new Vector(50, 120);

                this.insert(entity);
            }

            {
                const entity = new Entity();

                entity.init('Wall');
                entity.pos = new Vector(50, 180);

                this.insert(entity);
            }

            {
                const entity = new Entity();

                entity.init('Wall');
                entity.pos = new Vector(120, 180);

                this.insert(entity);
            }

            {
                const entity = new Entity();

                entity.init('Wall');
                entity.pos = new Vector(120, 50);

                this.insert(entity);
            }

            {
                const entity = new Entity();

                entity.init('bot');
                entity.pos = new Vector(900, 900);

                this.insert(entity);
            }

            setInterval(() => {
                if (this.entities.size < 50) {
                    const entity = new Entity();

                    if (Math.random() > 0.7) entity.init('Food');
                    else if (Math.random() > 0.5) entity.init('Pentagon');
                    else if (Math.random() > 0.7) entity.init('Pentagon');
                    else entity.init('ShinyPentagon');
                    entity.pos = new Vector(RoomConfig.width * Math.random(), RoomConfig.height * Math.random());
                    entity.team = Team.Room;
                    entity.pos = new Vector(RoomConfig.width * Math.random(), RoomConfig.height * Math.random());

                    this.insert(entity);
                }
            }, 1000);
        }

        public update(): void {
            if (this.tick === 0) this.init();

            super.update();
        }
    },
};
