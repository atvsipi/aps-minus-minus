export const app = new PIXI.Application();

const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

await app.init({
    resizeTo: window,
    antialias: true,
    resolution: 2,
    autoDensity: true,
});

document.body.appendChild(app.canvas);

export const grid = new PIXI.Container();
export const world = new PIXI.Container();
export const joystick = new PIXI.Container();
export const messages = new PIXI.Container();
export const upgrades = new PIXI.Container();
export const score = new PIXI.Container();
export const leaderboard = new PIXI.Container();
export const debug = new PIXI.Container();

app.stage.addChild(grid);
app.stage.addChild(world);
if (mobile) app.stage.addChild(joystick);
app.stage.addChild(messages);
app.stage.addChild(upgrades);
app.stage.addChild(score);
app.stage.addChild(leaderboard);
app.stage.addChild(debug);
