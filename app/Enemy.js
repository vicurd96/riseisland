const Utils = require('./Utils.js');

module.exports = {
	create:function(player,collidables,enemys,k){
		/************
		 *
		 * create enemy
		 *
		 ************/
		
		let n=Utils.randomInt(0,9);
		let enemy = new PIXI.Sprite(PIXI.loader.resources["assets/enemy"+n+".png"].texture);
		enemy.vx = 0;
		enemy.vy = 0;
		enemy.velocity = 1;
		enemy.hp = 100;
		enemy.attack = 1;
		enemy.status=true;

		/************************/

		enemy.followPlayer = function(){
			if(enemy.status){
				let n=Utils.randomInt(0,10);
				if(n>5){
					if(player.x>enemy.x){
						enemy.vx = +enemy.velocity;
						enemy.vy = 0;
					}else if(player.x<enemy.x){
						enemy.vx = -enemy.velocity;
						enemy.vy = 0;
					}else if(player.y>enemy.y){
						enemy.vy = +enemy.velocity;
						enemy.vx = 0;
					}else if(player.y<enemy.y){
						enemy.vy = -enemy.velocity;
						enemy.vx = 0;
					}
				}else{
					if(player.y>enemy.y){
						enemy.vy = +enemy.velocity;
						enemy.vx = 0;
					}else if(player.y<enemy.y){
						enemy.vy = -enemy.velocity;
						enemy.vx = 0;
					}else if(player.x>enemy.x){
						enemy.vx = +enemy.velocity;
						enemy.vy = 0;
					}else if(player.x<enemy.x){
						enemy.vx = -enemy.velocity;
						enemy.vy = 0;
					}
				}

				let isWalkable = true;
				let eneTemp = {
					width: enemy.width,
					height: enemy.height,
					x: enemy.x + enemy.vx,
					y: enemy.y + enemy.vy
				}

				for(let i=0 ; i < collidables.length ; i++){
					if(Utils.isCollision(eneTemp,collidables[i]))
						isWalkable=false;
				}

				for(let i=0 ; i < enemys.length ; i++){
					if(enemys[i].status && i!=k && Utils.isCollision(eneTemp,enemys[i]))
						isWalkable=false;
				}

				if(isWalkable){
					enemy.x += enemy.vx;
					enemy.y += enemy.vy;
				}
			}
		};

		/************************/

		do{
			isCollidable = false;
			enemy.x = Utils.randomInt(0,992);
			enemy.y = Utils.randomInt(0,992);

			if(enemy.y>450){
				enemy.vy=5;
			}else{
				enemy.vy=-5;
			}

			for(let j=0 ; j < collidables.length ; j++){
				if(Utils.isCollision(enemy,collidables[j]))
					isCollidable = true;
			}

			for(let j=0 ; j < enemys.length ; j++){
				if(j!=k && Utils.isCollision(enemy,enemys[j]))
					isCollidable=true;
			}
		}while(isCollidable || Utils.isCollision(player,enemy));

		return enemy;
	}
};