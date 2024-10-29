import {Color} from '@/definitions/color';
import {Team} from '@/definitions/team';
import {Nearest} from '@/entity/controller';
import {RoomLoop} from '@/room/room-loop';
import {Tile, TileMaker, Tiles} from '@/room/tile';
import {BaseTile} from '@/room/tiles';

const ____ = new TileMaker({
    spawn: [
        {type: 'Food', weight: 90},
        {type: 'Triangle', weight: 50},
        {type: 'AlphaTriangle', weight: 12},
    ],
    spawnTimes: 10,
    spawnInterval: 1000,
});

const nest = new TileMaker({
    spawn: [
        {type: 'Pentagon', weight: 20},
        {type: 'Hexagon', weight: 20},
        {type: 'AlphaPentagon', weight: 10},
        {type: 'ShinyPentagon', weight: 1},
        {type: 'MonsterTriangle', weight: 0.5},
        {type: 'King', weight: 0.2},
    ],
    spawnTimes: 6,
    spawnInterval: 1000,
});

const babl = BaseTile(Team.Blue);
const bagr = BaseTile(Team.Green);

export default {
    name: 'room',
    room: class extends RoomLoop {
        public teams: Team[] = [Team.Blue, Team.Green];
        public tileMap: Tiles[][] = [
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
