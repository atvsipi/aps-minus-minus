import {Team} from '@/definitions/team';
import {Entity} from '@/entity/entity';
import {Vector} from '@/physics/vector';
import {RoomConfig} from '@/room/room-config';
import {RoomLoop} from '@/room/room-loop';
import {randomFood} from '@/util/random';

const foods: {
    type: string;
    weight: number;
}[] = [
    {type: 'Food', weight: 90},
    {type: 'Pentagon', weight: 20},
    {type: 'AlphaPentagon', weight: 10},
    {type: 'ShinyPentagon', weight: 1},
];

export default {
    name: 'test',
    room: class extends RoomLoop {
        constructor() {
            super();
        }

        public spawn(name: string): Entity {
            const entity = new Entity();

            entity.init('Player');

            entity.name = name;

            entity.team = Math.random() > 0.5 ? Team.Blue : Team.Green;

            const {x, y} = this.randomPosGenerator.getRandomPos(
                ...(this.teamArea[entity.team] || [
                    {x: 0, y: 0},
                    {x: RoomConfig.width, y: RoomConfig.height},
                ]),
            );

            entity.pos.x = x;
            entity.pos.y = y;

            return entity;
        }

        public init() {
            //this.generateLabyrinth(31);
            this.create4TDMBase();

            {
                const entity = new Entity();

                entity.init('bot');
                entity.pos = new Vector(900, 900);

                this.insert(entity);
            }

            setInterval(() => {
                if (this.entities.size < 1500) {
                    const entity = new Entity();

                    entity.init(randomFood(foods));

                    const {x, y} = this.randomPosGenerator.getRandomPos({x: 0, y: 0}, {x: RoomConfig.width, y: RoomConfig.height});

                    entity.pos.x = x;
                    entity.pos.y = y;

                    entity.team = Team.Room;

                    this.insert(entity);
                }
            }, 500);
        }

        public update(): void {
            if (this.tick === 0) this.init();

            super.update();
        }
    },
};
