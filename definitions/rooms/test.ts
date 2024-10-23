import {Team} from '@/definitions/team';
import {Entity} from '@/entity/entity';
import {Vector} from '@/physics/vector';
import {RoomConfig} from '@/room/room-config';
import {RoomLoop} from '@/room/room-loop';
import {Maze} from '@/util/maze';
import {RandomPosGenerator, randomFood} from '@/util/random';

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
        public randomPosGenerator = new RandomPosGenerator(RoomConfig.width, RoomConfig.height, []);

        constructor() {
            super();
        }

        protected generateLabyrinth(size: number) {
            const padding = 1;
            const maze = new Maze(size, size);
            const wallScale = RoomConfig.height / (size + 2 * padding);

            maze.generateMaze(1, 1);
            maze.punchAdditionalWalls();

            maze.createHoles(
                [
                    [5, 5],
                    [5, 25],
                    [25, 5],
                    [25, 25],
                ],
                4,
            );

            maze.createHoles([[15, 15]], 8);

            const corridors = [7, 23];

            maze.createCorridors(corridors);

            for (let x = padding; x < size + padding; x++) {
                for (let y = padding; y < size + padding; y++) {
                    if (!maze.maze[y - 1]?.[x - 1]) continue;

                    const d = {
                        x: x * wallScale + wallScale / 2,
                        y: y * wallScale + wallScale / 2,
                    };

                    const wallEntity = new Entity();
                    wallEntity.init('Wall');
                    wallEntity.pos.x = d.x;
                    wallEntity.pos.y = d.y;
                    wallEntity.setting.size = wallScale * 0.5 * Math.SQRT2;
                    wallEntity.team = Team.Room;
                    this.insert(wallEntity);
                    this.walls.push(wallEntity);
                    this.randomPosGenerator.exclusionZone.push([
                        {x: d.x, y: d.y},
                        {x: d.x + wallEntity.setting.size, y: d.y + wallEntity.setting.size},
                    ]);
                }
            }
        }

        public spawn(name: string): Entity {
            const entity = new Entity();

            entity.init('Player');

            entity.name = name;

            const {x, y} = this.randomPosGenerator.getRandomPos();

            entity.pos.x = x;
            entity.pos.y = y;

            return entity;
        }

        public init() {
            this.generateLabyrinth(31);

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

                    const {x, y} = this.randomPosGenerator.getRandomPos();

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
