import {Maze} from '../util/maze';
import {EntityClass} from '../entity/class';
import {Entity} from '../entity/entity';
import {RoomConfig} from './room-config';
import {World} from './world';
import {RandomPosGenerator} from '../util/random';
import {Vector, VectorLike} from '../physics/vector';
import {Team} from '../definitions/team';

export class RoomLoop extends World {
    protected randomPosGenerator = new RandomPosGenerator();

    protected teamArea: {[key: string]: [VectorLike, VectorLike]} = {};

    public spawn(name: string) {
        const entity = new Entity();

        entity.init(EntityClass.Player);

        entity.name = name;

        RoomConfig.spawn(entity);

        return entity;
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
                    {x: d.x - wallEntity.setting.size, y: d.y - wallEntity.setting.size},
                    {x: d.x + wallEntity.setting.size, y: d.y + wallEntity.setting.size},
                ]);
            }
        }
    }

    protected create2TDMBase() {
        const initialSize = Math.floor(RoomConfig.width * 0.1);
        const numberOfSquaresInHeight = Math.floor(RoomConfig.height / initialSize);
        const baseSize = Math.floor(RoomConfig.height / numberOfSquaresInHeight);
        const size = baseSize * 0.5 * Math.SQRT2;
        const rows = Math.ceil(RoomConfig.height / baseSize);

        const createBase = (team: Team, startX: number, startY: number, deltaY: number) => {
            for (let row = 0; row < rows; row++) {
                const entity = new Entity();
                entity.init('Base');
                entity.team = team;
                entity.setting.size = size;
                entity.pos = new Vector(startX, startY + row * deltaY);
                this.insert(entity);
            }
        };

        createBase(Team.Blue, baseSize / 2, baseSize / 2, baseSize);
        this.teamArea[Team.Blue] = [
            {x: 0, y: 0},
            {x: baseSize, y: RoomConfig.height},
        ];

        createBase(Team.Green, RoomConfig.width - baseSize / 2, baseSize / 2, baseSize);
        this.teamArea[Team.Green] = [
            {x: RoomConfig.width - baseSize, y: 0},
            {x: RoomConfig.width, y: RoomConfig.height},
        ];
    }

    protected create4TDMBase() {
        const baseSize = RoomConfig.height * 0.1;
        const size = baseSize * 0.5 * Math.SQRT2;

        const teams = [Team.Red, Team.Green, Team.Blue, Team.Purple];
        const positions = [
            new Vector(0 + baseSize / 2, 0 + baseSize / 2), // Top-left (Red)
            new Vector(RoomConfig.width - baseSize / 2, 0 + baseSize / 2), // Top-right (Green)
            new Vector(0 + baseSize / 2, RoomConfig.height - baseSize / 2), // Bottom-left (Blue)
            new Vector(RoomConfig.width - baseSize / 2, RoomConfig.height - baseSize / 2), // Bottom-right (Purple)
        ];

        for (let i = 0; i < teams.length; i++) {
            const entity = new Entity();

            entity.init('Base');
            entity.team = teams[i];
            entity.setting.size = size;
            entity.pos = positions[i];

            this.insert(entity);

            this.teamArea[teams[i]] = [
                {x: positions[i].x - baseSize / 2, y: positions[i].y - baseSize / 2}, // Top-left corner of the area
                {x: positions[i].x + baseSize / 2, y: positions[i].y + baseSize / 2}, // Bottom-right corner of the area
            ];
        }
    }
}
