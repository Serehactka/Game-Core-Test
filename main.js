const BODY = document.body;
const canvas  = new Canvas();
const player = new Player(100, 100, 50, 50, true);
const ui = new UI();
const ctx = canvas.ctx;
const camera = new Camera();
const render = new Render();
const GameObjects = [];
const GRAVITY = new Acceleration(0, 0);

const platform1 = new Platform(400, 400, 100, 200);
const platform2 = new Platform(250, 400, 100, 200);
const platform3 = new Platform(0, 600, 10000, 50);
const platform4 = new Platform(-50, 550, 50, 50);
const platform5 = new Platform(-100, 500, 50, 50);
const platform6 = new Platform(-150, 450, 50, 50);
const platform7 = new Platform(-200, 400, 50, 50);

const platform8 = new Platform(-100, 350, 200, 50);
const platform9 = new Platform(200, 600, 50, 50);


GameObjects.push(platform1);
GameObjects.push(platform2);
GameObjects.push(platform3);
GameObjects.push(platform4);
GameObjects.push(platform5);
GameObjects.push(platform6);
GameObjects.push(platform7);

GameObjects.push(platform8);
GameObjects.push(platform9);


ctx.translate(200,200);

ui.subscribe('keydown', player.handleNotification.bind(player));
ui.subscribe('keyup', player.handleNotification.bind(player));

canvas.resizeToBody();

BODY.onresize = () => {
    canvas.resizeToBody();
}

const cameraXOffset = -(canvas.width / 2 - player.size.width / 2);
const cameraYOffset = -(canvas.height / 2 - player.size.height / 2);

camera.attachToPosition(player.position);
camera.setOffsetPosition(cameraXOffset, cameraYOffset);

render.addToRender(platform1);
render.addToRender(platform2);
render.addToRender(platform3);
render.addToRender(platform4);
render.addToRender(platform5);
render.addToRender(platform6);
render.addToRender(platform7);
render.addToRender(platform8);
render.addToRender(platform9);
render.addToRender(player);


render.render();