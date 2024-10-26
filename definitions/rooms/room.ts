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
    afterSpawn(tile, entity) {
        if (tile.setting.spawnTimes === 10 && Math.random() > 0.9) {
            tile.setting.spawnTimes = 40;
        } else if (tile.setting.spawnTimes === 40 && Math.random() > 0.95) {
            tile.setting.spawnTimes = 10;
        }
    },
});

const nest = new TileMaker({
    spawn: [
        {type: 'Pentagon', weight: 20},
        {type: 'Hexagon', weight: 20},
        {type: 'AlphaPentagon', weight: 10},
        {type: 'ShinyPentagon', weight: 1},
        {type: 'MonsterTriangle', weight: 0.5},
    ],
    spawnTimes: 6,
    spawnInterval: 1000,
});

const boss = new TileMaker({
    spawn: [{type: 'TriBoss1', weight: 100}],
    afterSpawn(tile, entity) {
        entity.controllers.push(new Nearest());
    },
    spawnTimes: 1,
    spawnInterval: 1000 * 10,
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
            [____, ____, nest, nest, boss, nest, ____, ____],
            [____, ____, nest, nest, nest, nest, ____, ____],
            [____, ____, nest, nest, nest, nest, ____, ____],
            [____, ____, ____, ____, ____, ____, ____, ____],
            [bagr, bagr, bagr, bagr, bagr, bagr, bagr, bagr],
        ];
    },
};
