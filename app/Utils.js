module.exports={
	keyboard:function(keyCode) {
		let key = {};
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
	},
	isCollision:function(r1, r2) {
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
	},
	randomInt:function(min,max) {
		return Math.floor(Math.random() * (max - min)) + min;
	},
	font:function(tipo){
		let font;
		if(tipo===1){
			font = new PIXI.TextStyle({
				ontFamily: "Futura",
				fontSize: 64,
				fill: "white"
			});	
		}else{
			font = new PIXI.TextStyle({
				fontFamily: "Futura",
				fontSize: 10,
				fill: "white"
			});
		}
		return font;
	}
};