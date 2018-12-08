const PIXI = require('pixi.js');
const Viewport = require('pixi-viewport');
const TiledMap = require('tiled-to-pixi');

const Utils = require('./Utils.js');
const Player = require('./Player.js');
const Enemy = require('./Enemy.js');

let app,gameScene,gameStatus,viewport,player,enemys=new Array(),collidables,
	healthBar,outerBar,innerBar,div,mapaConteiner,objetosConteiner,gameConteiner,
	mapa,objetos,weapon;

div=document.getElementById("tablero");

app = new PIXI.Application({ 
	width: div.getBoundingClientRect().width, 
	height: div.getBoundingClientRect().width*0.70,
	antialiasing: true,
	transparent: false,
	resolution: 1
});

viewport = new PIXI.extras.Viewport({
	screenWidth: div.getBoundingClientRect().width,
	screenHeight: div.getBoundingClientRect().width*0.70,
	worldWidth: 1024,
	worldHeight: 1024,
	interaction: app.renderer.interaction,
	divWheel:div
});

viewport.clamp({left:0,right:1024,top:0,bottom:1024});
viewport.clampZoom({minWidth:350,minHeight:350,maxWidth:1024,maxHeight:1024});

app.renderer.backgroundColor = 0x595959;
div.appendChild(app.view);

gameScene=new PIXI.Container();
gameStatus=new PIXI.Container();

gameStatus.visible=false;

app.stage.addChild(gameScene);
app.stage.addChild(gameStatus);
gameScene.addChild(viewport);

viewport.wheel();

PIXI.loader
	.add('assets/player.png')
	.add('assets/enemy0.png')
	.add('assets/enemy1.png')
	.add('assets/enemy2.png')
	.add('assets/enemy3.png')
	.add('assets/enemy4.png')
	.add('assets/enemy5.png')
	.add('assets/enemy6.png')
	.add('assets/enemy7.png')
	.add('assets/enemy8.png')
	.add('assets/enemy9.png')
	.add('assets/weapon0.png')
	.add('assets/overworld.png')
	.add('mapa', 'assets/mapa.tmx')
	.add('objetos', 'assets/objetos.tmx')
	.use(TiledMap.middleware)
	.load(start);

function start(){
 	keyboard();
 	collisions();
 	
 	mapaConteiner=new PIXI.Container();
	gameConteiner=new PIXI.Container();
	objetosConteiner=new PIXI.Container();

	//mapa
	mapa = new TiledMap('mapa');
	mapaConteiner.addChild(mapa);

	//objetos Colidables
	objetos = new TiledMap('objetos');
	objetosConteiner.addChild(objetos);

	//player
 	player = Player.create();

 	//barra de vida
 	healthBar = new PIXI.Container();
	healthBar.position.set(10, 20);

	innerBar = new PIXI.Graphics();
	innerBar.beginFill(0x000000);
	innerBar.drawRect(0, 10, 150, 8);
	innerBar.endFill();
	healthBar.innerBar=innerBar;
	healthBar.addChild(innerBar);

	outerBar = new PIXI.Graphics();
	outerBar.beginFill(0xFF3300);
	outerBar.drawRect(0, 10, 150, 8);
	outerBar.endFill();
	healthBar.outerBar=outerBar;
	healthBar.addChild(outerBar);

	message = new PIXI.Text("HP", Utils.font(0));
	message.x = 10;
	message.y = 0;
	healthBar.addChild(message);

	gameScene.addChild(healthBar);

	//enemigos
	for(var i=0;i<50;i++){
		enemys[i] = Enemy.create(player,collidables,enemys,i);
		gameConteiner.addChild(enemys[i]);
	}

	gameConteiner.addChild(player);

	//arma
	weapon = new PIXI.Sprite(PIXI.loader.resources["assets/weapon0.png"].texture);
	weapon.visible=false;
	weapon.attack=10;
	weapon.x=player.x+player.width;
	weapon.y=player.y+(player.height/2)-(weapon.height/2);
	gameConteiner.addChild(weapon);
	weapon.direction=0;

	viewport.addChild(mapaConteiner);
	viewport.addChild(gameConteiner);
	viewport.addChild(objetosConteiner);
	viewport.follow(player, {speed:50,radius:0});
	viewport.ticker.speed=4;
	viewport.ticker.add(deltaTime => initLoop(deltaTime));
}

function initLoop(delta){
	if(player.vx != 0 || player.vy != 0){
		if(player.walk(collidables)){
			weapon.x += player.vx;
			weapon.y += player.vy;
		}
	}

	for (let i = 0; i <enemys.length; i++) {
		if(enemys[i].status){
			if(Utils.isCollision(player,enemys[i])){
				player.updateHP(-enemys[i].attack,healthBar);
			}else{
				enemys[i].followPlayer();
			}
		}
		if(weapon.visible){
			if(Utils.isCollision(weapon,enemys[i])){
				enemys[i].hp += -weapon.attack;
				if(enemys[i].hp<=0){
					enemys[i].status=false;
					enemys[i].visible=false;
				}
			}
		}
	}

	if(gameScene.visible && player.hp<=0){
		let message = new PIXI.Text("Game Over!", Utils.font(1));
		message.x = 120;
		message.y = app.stage.height / 2 - 32;
		gameStatus.addChild(message);
		gameScene.visible=false;
		gameStatus.visible=true;

		viewport.ticker.stop();
	}
}

function keyboard(){
	let left = Utils.keyboard(37),
		up = Utils.keyboard(38),
		right = Utils.keyboard(39),
		down = Utils.keyboard(40)
		attack = Utils.keyboard(88);

	//***************************//
	attack.press = () => {
		weapon.visible=true;
		if(player.direction==1){
			weapon.x=player.x-weapon.width;
			weapon.y=player.y+(player.height/2)-(weapon.height/2);
		}else if(player.direction==2){
			weapon.x=player.x+(player.width/2)-(weapon.width/2);
			weapon.y=player.y-weapon.height;
		}else if(player.direction==3){
			weapon.x=player.x+player.width;
			weapon.y=player.y+(player.height/2)-(weapon.height/2);
		}else if(player.direction==4){
			weapon.x=player.x+(player.width/2)-(weapon.width/2);
			weapon.y=player.y+player.height;
		}
	};
	attack.release = () => {
		weapon.visible=false;
	};
	//***************************//
	left.press = () => {
		player.vx = -player.velocity;
		player.vy =  0;
		player.direction=1;
	};
	left.release = () => {
		if(right.isUp && player.vy === 0){
			player.vx = 0;
		}
	};
	//***************************//
	up.press = () => {
		player.vx =  0;
		player.vy = -player.velocity;
		player.direction=2;
	};
	up.release = () => {
		if(down.isUp && player.vx === 0){
			player.vy = 0;
		}
	};
	//***************************//
	right.press = () => {
		player.vx = +player.velocity;
		player.vy =  0;
		player.direction=3;
	};
	right.release = () => {
		if(left.isUp && player.vy === 0){
			player.vx = 0;
		}
	};
	//***************************//
	down.press = () => {
		player.vx =  0;
		player.vy = +player.velocity;
		player.direction=4;
	};
	down.release = () => {
		if(up.isUp && player.vx === 0){
			player.vy = 0;
		}
	};
}

function collisions() {
	collidables=[
		{x: 360, y: 512, width: 54, height: 20},
		{x: 320, y: 64, width: 30, height: 30},
		{x: 160, y: 128, width: 30, height: 30},
		{x: 192, y: 544, width: 30, height: 30},
		{x: 288, y: 800, width: 30, height: 30},
		{x: 704, y: 768, width: 30, height: 30},
		{x: 768, y: 768, width: 30, height: 30},
		{x: 452, y: 768, width: 52, height: 26},
		{x: 516, y: 800, width: 52, height: 26},
		{x: 643, y: 640, width: 24, height: 29},
		{x: 194, y: 224, width: 58, height: 28},
		{x: 898, y: 704, width: 58, height: 28},
		{x: 898, y: 800, width: 58, height: 28},
		{x: 130, y: 640, width: 58, height: 28},
		{x: 672, y: 416, width: 32, height: 32},
		{x: 544, y: 416, width: 64, height: 32},
		{x: 416, y: 256, width: 32, height: 32},
		{x: 832, y: 480, width: 32, height: 32},
		{x: 132, y: 416, width: 58, height: 28},
		{x: 932, y: 480, width: 58, height: 28},
		{x: 548, y: 160, width: 58, height: 28},
		{x: 420, y: 160, width: 52, height: 28},
		{x: 196, y: 736, width: 52, height: 28},
		{x: 772, y: 90, width: 84, height: 38},
		{x: 552, y: 584, width: 16, height: 16},
		{x: 680, y: 488, width: 16, height: 16},
		{x: 968, y: 616, width: 16, height: 16},
		{x: 968, y: 360, width: 16, height: 16},
		{x: 1000, y: 168, width: 16, height: 16},
		{x: 712, y: 136, width: 16, height: 16},
		{x: 616, y: 232, width: 16, height: 16},
		{x: 456, y: 360, width: 16, height: 16},
		{x: 898, y: 548, width: 28, height: 26},
		{x: 772, y: 672, width: 22, height: 28},
		{x: 358, y: 410, width: 84, height: 26},
		{x: 358, y: 360, width: 84, height: 26},
		{x: 774, y: 314, width: 84, height: 26},
		{x: 774, y: 264, width: 84, height: 26},
		{x: 0, y: 0, width: 64, height: 1024},
		{x: 64, y: 0, width: 32, height: 512},
		{x: 64, y: 608, width: 32, height: 416},
		{x: 96, y: 0, width: 32, height: 384},
		{x: 96, y: 832, width: 32, height: 192},
		{x: 128, y: 928, width: 896, height: 96},
		{x: 128, y: 32, width: 32, height: 64},
		{x: 128, y: 160, width: 32, height: 128},
		{x: 96, y: 448, width: 32, height: 32},
		{x: 96, y: 576, width: 32, height: 32},
		{x: 96, y: 704, width: 32, height: 32},
		{x: 96, y: 768, width: 32, height: 32},
		{x: 128, y: 864, width: 32, height: 64},
		{x: 160, y: 896, width: 32, height: 32},
		{x: 256, y: 864, width: 128, height: 64},
		{x: 576, y: 864, width: 352, height: 64},
		{x: 512, y: 896, width: 64, height: 32},
		{x: 928, y: 896, width: 32, height: 32}
	]
}