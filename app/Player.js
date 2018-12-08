const Utils = require('./Utils.js');

module.exports={
	create:function(){
		/************
		 *
		 * create player
		 *
		 ************/
		
		let player = new PIXI.Sprite(PIXI.loader.resources["assets/player.png"].texture);
		
		player.x = 300;
		player.y = 100;
		player.vx = 0;
		player.vy = 0;
		player.velocity = 5;
		player.hp = 100;
		player.hpLimit = 100;
		player.direction=0;

		/************************/

		player.updateHP = function(i,healthBar){
			if(player.hp > 0){
				player.hp += i;
				if(player.hp > player.hpLimit){
					player.hp = player.hpLimit;
				}else if( player.hp < 0){
					player.hp = 0;
				}
				healthBar.outerBar.width = (player.hp/player.hpLimit) * healthBar.innerBar.width;
			}
		}

		/************************/

		player.walk = function(collidables,enemys){
		 	let isWalkable = true;
			let playerTemp = {
				width: player.width,
				height: player.height*0.2,
				x: player.x + player.vx,
				y: player.y + player.vy + (player.height*0.8)
			};

			for(let i=0 ; i < collidables.length ; i++){
				if(Utils.isCollision(playerTemp,collidables[i])){
					isWalkable=false;
				}
			}

			if(isWalkable){
				player.x += player.vx;
				player.y += player.vy;
			}

			return isWalkable;
		}		

		/************************/

		return player;
	}
};