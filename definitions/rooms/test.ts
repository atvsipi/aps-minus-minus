import {Team} from '@/definitions/team';
import {Entity} from '@/entity/entity';
import {Vector, VectorLike} from '@/physics/vector';
import {RoomConfig} from '@/room/room-config';
import {RoomLoop} from '@/room/room-loop';
import {Maze} from '@/util/maze';

export default {
    name: 'test',
    room: class extends RoomLoop {
        constructor() {
            super();
        }

        protected generateLabyrinth(size: number) {
            const padding = 1;
            const maze = new Maze(size, size);
            const wallScale = RoomConfig.height / (size + 2 * padding);

            maze.removeBorders();
            maze.generateMaze(1, 1);
            maze.punchAdditionalWalls();

            const holeCenters: [number, number][] = [
                [5, 5],
                [5, 25],
                [25, 5],
                [25, 25],
                [15, 15],
            ];
            const holeRadius = 2;

            maze.createHoles(holeCenters, holeRadius);

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
                    wallEntity.setting.size = wallScale * 0.5 * Math.SQRT2 - 2;
                    wallEntity.team = Team.Room;
                    this.insert(wallEntity);
                    this.walls.push(wallEntity);
                }
            }
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
                if (this.entities.size < 1000) {
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
