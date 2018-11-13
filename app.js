const PIXI = require('pixi.js');
const Viewport = require('pixi-viewport');
const TiledMap = require('tiled-to-pixi');


let app,gameScene,gameStatus,viewport,player,enemigos=new Array(),
	healthBar,fontGeneral,fontTitulo,div,mapaConteiner,gameConteiner,mapa;

div = document.getElementById("tablero");

app = new PIXI.Application({ 
	width: div.getBoundingClientRect().width, 
	height: div.getBoundingClientRect().width*0.70,
	antialiasing: true,
	transparent: false,
	resolution: 1
});

viewport = new PIXI.extras.Viewport({
	screenWidth: window.innerWidth,
	screenHeight: window.innerHeight,
	worldWidth: 1000,
	worldHeight: 1000,
	interaction: app.renderer.interaction
});

fontGeneral = new PIXI.TextStyle({
	ontFamily: "Futura",
	fontSize: 10,
	fill: "white"
});

fontTitulo = new PIXI.TextStyle({
	fontFamily: "Futura",
	fontSize: 64,
	fill: "white"
});

app.renderer.backgroundColor = 0x595959;
div.appendChild(app.view);

gameScene=new PIXI.Container();
gameStatus=new PIXI.Container();

gameStatus.visible=false;

app.stage.addChild(gameScene);
app.stage.addChild(gameStatus);
gameScene.addChild(viewport);

viewport.drag().pinch().wheel().decelerate();

PIXI.loader
	.add('assets/player.png')
	.add('assets/terrain_atlas.png')
	.add('mapa', 'assets/mapariseisland.tmx')
	.use(TiledMap.middleware)
	.load(start);

function createStatusBar(){
	healthBar = new PIXI.Container();
	healthBar.position.set(10, 20);
	gameScene.addChild(healthBar);

	let innerBar = new PIXI.Graphics();
	innerBar.beginFill(0x000000);
	innerBar.drawRect(0, 0, 150, 8);
	innerBar.endFill();
	healthBar.addChild(innerBar);

	let outerBar = new PIXI.Graphics();
	outerBar.beginFill(0xFF3300);
	outerBar.drawRect(0, 0, 150, 8);
	outerBar.endFill();
	healthBar.addChild(outerBar);

	healthBar.outer = outerBar;

	let message = new PIXI.Text("HP", fontGeneral);
	message.x = 10;
	message.y = 10;
	gameScene.addChild(message);
}

function createPlayer(){
	
	/************
	 *
	 * create player
	 *
	 ************/
	player = new PIXI.Sprite(PIXI.loader.resources["assets/player.png"].texture)
	player.x = 300;
	player.y = 100;
	player.vx = 0;
	player.vy = 0;
	player.velocity=1.5;

	gameConteiner.addChild(player);

	/************
	 *
	 * crear eventos de teclado para el player
	 *
	 ************/

	let left = keyboard(37),up = keyboard(38),right = keyboard(39),down = keyboard(40);

	left.press = () => {
		player.vx = -player.velocity;
		player.vy =  0;
	};
	left.release = () => {
		if(right.isUp && player.vy === 0){
			player.vx = 0;
		}
	};

	up.press = () => {
		player.vx =  0;
		player.vy = -player.velocity;
	};
	up.release = () => {
		if(down.isUp && player.vx === 0){
			player.vy = 0;
		}
	};

	right.press = () => {
		player.vx = +player.velocity;
		player.vy =  0;
	};
	right.release = () => {
		if(left.isUp && player.vy === 0){
			player.vx = 0;
		}
	};

	down.press = () => {
		player.vx =  0;
		player.vy = +player.velocity;
	};
	down.release = () => {
		if(up.isUp && player.vx === 0){
			player.vy = 0;
		}
	};
}

function createEnemigos(){
	for(var i=0;i<10;i++){
		enemigos[i] = gameConteiner.addChild(new PIXI.Graphics());
		enemigos[i].beginFill(0xFF0000);
		enemigos[i].drawRect(0, 0, 10, 10);
		enemigos[i].endFill();
		
		let collidables = mapa.layers.CollisionLayer.getCollidables(),isCollidable;

		do{
			isCollidable = false;
			enemigos[i].x = randomInt(0,992);
			enemigos[i].y = randomInt(0,992);

			if(enemigos[i].y >450){
				enemigos[i].vy=2;
			}else{
				enemigos[i].vy=-2;
			}

			for(let j=0 ; j < collidables.length ; j++){
				if(isCollisionRectangle(enemigos[i],collidables[j]))
					isCollidable = true;
			}
		}while(isCollidable || isCollisionRectangle(player,enemigos[i]));
	}
}

function createViewport() {
	mapaConteiner=new PIXI.Container();
	gameConteiner=new PIXI.Container();
	mapa = new TiledMap('mapa');
	mapaConteiner.addChild(mapa);
	viewport.addChild(mapaConteiner);
	viewport.addChild(gameConteiner);

	let collidables = mapa.layers.CollisionLayer.getCollidables();

	/*for(let i=0;i<collidables.length;i++){
		let coli = gameConteiner.addChild(new PIXI.Graphics());
		coli.beginFill(0x0000ff);
		coli.drawRect(0, 0, collidables[i].width, collidables[i].height);
		coli.endFill();
		coli.x = collidables[i].x;
		coli.y = collidables[i].y;
		coli.alpha=0.3;
	}*/
}

function start(){
	/************
 	 *
 	 * instanciar objetos
 	 *
 	 ************/

 	
 	createViewport();
 	createStatusBar();
 	createPlayer();
	createEnemigos();

	viewport.ticker.speed=4;
	viewport.ticker.add(deltaTime => bucleInicial(deltaTime));
}

function bucleInicial(delta){
	if(player.vx != 0 || player.vy != 0){

		let collidables = mapa.layers.CollisionLayer.getCollidables();
		let isWalkable = true;
		let playerTemp = {};

		playerTemp.width = player.width;
		playerTemp.height = player.height;
		playerTemp.x = player.x + player.vx;
		playerTemp.y = player.y + player.vy;

		for(let i=0 ; i < collidables.length ; i++){
			if(isCollisionRectangle(playerTemp,collidables[i]))
				isWalkable=false;
		}

		if(isWalkable){
			player.x += player.vx;
			player.y += player.vy;
		}
	}

	for (let i = 0; i <enemigos.length; i++) {
		if(isCollisionRectangle(player,enemigos[i])){
			if(healthBar.outer.width>0)
				healthBar.outer.width -= 1;
		}

		let collidables = mapa.layers.CollisionLayer.getCollidables();
		let isCollidable = false;
		let eneTemp = {};

		eneTemp.width = enemigos[i].width;
		eneTemp.height = enemigos[i].height;
		eneTemp.x = enemigos[i].x;
		eneTemp.y = enemigos[i].y + enemigos[i].vy;

		for(let j=0 ; j < collidables.length ; j++){
			if(isCollisionRectangle(eneTemp,collidables[j]))
				isCollidable=true;
		}

		if(!isCollidable && enemigos[i].y>=0 && enemigos[i].y+enemigos[i].height<992){
			enemigos[i].y += enemigos[i].vy;
		}else if(enemigos[i].y<0){
			enemigos[i].y = 0;
			enemigos[i].vy=enemigos[i].vy*-1;
		}else if(enemigos[i].y>992){
			enemigos[i].y = 992;
			enemigos[i].vy=enemigos[i].vy*-1;
		}else{
			enemigos[i].vy=enemigos[i].vy*-1;
		}
	}

	if(gameScene.visible && healthBar.outer.width<=0){
		let message = new PIXI.Text("Game Over!", fontTitulo);
		message.x = 120;
		message.y = app.stage.height / 2 - 32;
		gameStatus.addChild(message);
		gameScene.visible=false;
		gameStatus.visible=true;

		viewport.ticker.stop();
	}
}


/************
 *
 * Eventos de teclado
 *
 ************/

function keyboard(keyCode) {
	var key = {};
	key.code = keyCode;
	key.press = undefined;
	key.release = undefined;
	key.isDown=false;
	key.isUp=true;

	key.downEvent = event => {
		if(event.keyCode === key.code) {
			if (key.isUp && key.press) key.press();
			key.isDown = true;
			key.isUp = false;
		}
		event.preventDefault();
	};

	key.upEvent = event => {
		if(event.keyCode === key.code) {
			if(key.isDown && key.release) key.release();
			key.isDown = false;
			key.isUp = true;
		}
		event.preventDefault();
	};

	window.addEventListener(
		"keydown", key.downEvent.bind(key), false
	);
	window.addEventListener(
		"keyup", key.upEvent.bind(key), false
	);
	return key;
}

/************
 *
 * Colision
 *
 ************/

function isCollisionRectangle(r1, r2) {
	let combinedHalfWidths, combinedHalfHeights, vx, vy;

	r1.centerX = r1.x + r1.width / 2; 
	r1.centerY = r1.y + r1.height / 2; 
	r2.centerX = r2.x + r2.width / 2; 
	r2.centerY = r2.y + r2.height / 2; 
	
	r1.halfWidth = r1.width / 2;
	r1.halfHeight = r1.height / 2;
	r2.halfWidth = r2.width / 2;
	r2.halfHeight = r2.height / 2;
	
	vx = r1.centerX - r2.centerX;
	vy = r1.centerY - r2.centerY;

	combinedHalfWidths = r1.halfWidth + r2.halfWidth;
	combinedHalfHeights = r1.halfHeight + r2.halfHeight;

	if (Math.abs(vx) < combinedHalfWidths) {
		if (Math.abs(vy) < combinedHalfHeights) {
			return true;
		} else {
			return false;
		}
	}
	return false;
}

function randomInt(min,max) {
	return Math.floor(Math.random() * (max - min)) + min;
}