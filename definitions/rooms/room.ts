import {Team} from '@/definitions/team';
import {RoomLoop} from '@/room/room-loop';
import {Tile, TileMaker} from '@/room/tile';
import {BaseTile} from '@/room/tiles';

const ____ = new TileMaker({
    spawn: [
        {type: 'Food', weight: 90},
        {type: 'Triangle', weight: 50},
        {type: 'AlphaTriangle', weight: 12},
    ],
    spawnTimes: 1,
    spawnInterval: 1000,
});

const nest = new TileMaker({
    spawn: [
        {type: 'Pentagon', weight: 20},
        {type: 'Hexagon', weight: 20},
        {type: 'AlphaPentagon', weight: 10},
        {type: 'ShinyPentagon', weight: 1},
        {type: 'MonsterTriangle', weight: 0.5},
    ],
    spawnTimes: 1,
    spawnInterval: 1000,
});

const babl = BaseTile(Team.Blue);
const bagr = BaseTile(Team.Green);

export default {
    name: 'room',
    room: class extends RoomLoop {
        public teams: Team[] = [Team.Blue, Team.Green];
        public tileMap: (Tile | TileMaker)[][] = [
            [babl, babl, babl, babl, babl, babl, babl, babl],
            [____, ____, ____, ____, ____, ____, ____, ____],
            [____, ____, nest, nest, nest, nest, ____, ____],
            [____, ____, nest, nest, nest, nest, ____, ____],
            [____, ____, nest, nest, nest, nest, ____, ____],
            [____, ____, nest, nest, nest, nest, ____, ____],
            [____, ____, ____, ____, ____, ____, ____, ____],
            [bagr, bagr, bagr, bagr, bagr, bagr, bagr, bagr],
        ];
    },
};
