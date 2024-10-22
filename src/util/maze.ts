const directions = [
    {dx: 0, dy: -2},
    {dx: 0, dy: 2},
    {dx: -2, dy: 0},
    {dx: 2, dy: 0},
];

export class Maze {
    public width: number;
    public height: number;

    public maze: boolean[][];

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;

        this.maze = Array.from({length: height}, () => Array(width).fill(true));
    }

    public removeBorders() {
        for (let x = 0; x < this.width; x++) {
            this.maze[0][x] = false;
            this.maze[this.height - 1][x] = false;
        }
        for (let y = 0; y < this.height; y++) {
            this.maze[y][0] = false;
            this.maze[y][this.width - 1] = false;
        }
    }

    public punchWall(x: number, y: number) {
        this.maze[y][x] = false;
    }

    public generateMaze(x: number, y: number) {
        this.punchWall(x, y);
        directions.sort(() => Math.random() - 0.5);

        for (const {dx, dy} of directions) {
            const nx = x + dx;
            const ny = y + dy;

            if (ny > 0 && ny < this.height - 1 && nx > 0 && nx < this.width - 1 && this.maze[ny][nx]) {
                this.punchWall(x + dx / 2, y + dy / 2); // Punch the wall between current and next
                this.generateMaze(nx, ny);
            }
        }
    }

    public punchAdditionalWalls() {
        const queue = [{x: 1, y: 1}];
        const visited = Array.from({length: this.height}, () => Array(this.width).fill(false));
        visited[1][1] = true;

        while (queue.length > 0) {
            const {x, y} = queue.shift();

            if (Math.random() < 0.2) {
                const punchDir = directions[Math.floor(Math.random() * directions.length)];
                const nx = x + punchDir.dx;
                const ny = y + punchDir.dy;

                if (ny > 0 && ny < this.height - 1 && nx > 0 && nx < this.width - 1 && this.maze[ny][nx]) {
                    this.punchWall(nx, ny);
                }
            }

            for (const {dx, dy} of directions) {
                const nx = x + dx;
                const ny = y + dy;

                if (ny > 0 && ny < this.height - 1 && nx > 0 && nx < this.width - 1 && !visited[ny][nx] && !this.maze[ny][nx]) {
                    visited[ny][nx] = true;
                    queue.push({x: nx, y: ny});
                }
            }
        }
    }

    public createHoles(centers: [number, number][], holeRadius: number) {
        for (const [x, y] of centers) {
            for (let dy = -holeRadius; dy <= holeRadius; dy++) {
                for (let dx = -holeRadius; dx <= holeRadius; dx++) {
                    if (dx * dx + dy * dy <= holeRadius * holeRadius) {
                        const nx = x + dx;
                        const ny = y + dy;

                        if (ny > 0 && ny < this.height - 1 && nx > 0 && nx < this.width - 1 && this.maze[ny][nx]) {
                            this.punchWall(nx, ny);
                        }
                    }
                }
            }
        }
    }

    public createCorridors(corridors: number[]) {
        for (let y of corridors) {
            for (let x = corridors[0]; x <= corridors[1]; x++) {
                this.punchWall(x, y);
                this.punchWall(y, x);
            }
        }
    }
}
