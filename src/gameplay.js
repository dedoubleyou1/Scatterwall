function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

Gameplay = function() {};

Gameplay.prototype = {
	preload: function() {
		game.load.audio('message', ['sound/message.mp3', 'sound/message.ogg']);
		game.load.audio('lose', ['sound/lose.mp3', 'sound/lose.ogg']);
	},
	create: function() {
		this.settings = {
			speed: 180
		};
		this.timer = 0;
		this.messageSound = game.add.audio('message');
		this.loseSound = game.add.audio('lose');

		this.messageQueue = []
		this.blockLaunchCounter = 0;
		this.newTriangleCounter = 400;
		this.triangleCounterMax = 400;
		game.physics.startSystem(Phaser.Physics.ARCADE);

		this.blockTypes = {
			red: {
				color: '#ee5555',
				group: game.add.group()
			},
			green: {
				color: '#ddcc55',
				group: game.add.group()
			},
			blue: {
				color: '#5555ee',
				group: game.add.group()
			}
		};

		for (var i = 0; i < 8; i++){
			this.drawRectangle(0, 0, 360, 360, 'red');
			this.drawRectangle(0, 0, 360, 360, 'green');
			this.drawRectangle(0, 0, 360, 360, 'blue');

    	}


		this.playerTextures = {
			red: this.drawCircle(360, 1600, 240, this.blockTypes.red.color),
			green: this.drawCircle(360, 1600, 240, this.blockTypes.green.color),
			blue: this.drawCircle(360, 1600, 240, this.blockTypes.blue.color)
		};

		this.playerCharacter = game.add.sprite(360, 1600, this.playerTextures.red);
		this.playerCharacter.type = 'player';
		this.playerCharacter.color = 'red';
		this.playerCharacter.anchor.setTo(0.5, 0.5);
		game.physics.enable(this.playerCharacter, Phaser.Physics.ARCADE);
		this.playerCharacter.body.collideWorldBounds = true;
		

		this.trianglesTextures = {
			red: this.drawTriangle(360, 1600, 240, this.blockTypes.red.color),
			green: this.drawTriangle(360, 1600, 240, this.blockTypes.green.color),
			blue: this.drawTriangle(360, 1600, 240, this.blockTypes.blue.color)
		};

		var resetTriangle = function(triangle){
			if (triangle.y < 0) {
				triangle.kill();
			}
		}

		this.triangleGroup = game.add.group();
		var triangleSprite;
		for (var i = 0; i < 5; i++) {
			triangleSprite  =  game.add.sprite(0, 0, this.trianglesTextures.red)
			triangleSprite.anchor.setTo(0.5, 0.5);
		    triangleSprite.type = 'triangle';
		    triangleSprite.color = 'red';
		    triangleSprite.exists = false;
        	triangleSprite.visible = false;
        	triangleSprite.checkWorldBounds = true;
        	triangleSprite.events.onOutOfBounds.add(resetTriangle, this);

		    game.physics.enable(triangleSprite, Phaser.Physics.ARCADE);
		    //triangleSprite.body.immovable = true;
		    this.triangleGroup.add(triangleSprite);
		};


		

		var resetMessage = function(message){
			console.log('test');
			if (message.y < -240) {
				message.kill();
				console.log('killed');
			}
		}

		var messageStrings = [{
				string1: 'It\'s obviously not',
				string2: 'important to you.'
			}, {
				string1: 'You just don\'t',
				string2: 'really care.'
			}, {
				string1: 'If you really wanted',
				string2: 'to do it you would.'
			}, {
				string1: 'You\'re just being',
				string2: 'lazy.'
			}, {
				string1: 'You really should',
				string2: 'work harder.'
			}, {
				string1: 'You should',
				string2: 'grow up.'
			}, {
				string1: 'You\'re just not',
				string2: 'trying hard enough.'
			}, {
				string1: '"It wouldn\'t be a',
				string2: 'problem if you tried.'
			},
		];

		this.messageGroup = game.add.group();
		var messageSprite;
		for (var i = 0; i < 8; i++) {
			messageSprite = game.add.sprite(0, 0, this.drawMessageBox(1080,268, messageStrings[i].string1, messageStrings[i].string2));
			messageSprite.exists = false;
        	messageSprite.visible = false;
        	messageSprite.checkWorldBounds = true;
        	messageSprite.events.onOutOfBounds.add(resetMessage, this);

        	game.physics.enable(messageSprite, Phaser.Physics.ARCADE);
        	messageSprite.body.immovable = true;
        	this.messageGroup.add(messageSprite);
		};

		//var messageBox  =  game.add.sprite(0, 0, this.drawMessageBox(1080,360));

		game.input.onUp.add(this.changePlayerType, this);
	},
	update: function() {


		if (this.messageQueue.length > 0) {	
			for (var i = 0; i < this.messageQueue.length; i++) {
				if (this.messageQueue[i].sprite.y > i * 236 + 16) {
					//console.log('test');
					//this.messageQueue[i].sprite.y = i * 236;
					this.messageQueue[i].sprite.body.velocity.y = -480;
				} else if (this.messageQueue[i].sprite.y < i * 236 - 16) {
					this.messageQueue[i].sprite.body.velocity.y = 960;
				} else {
					this.messageQueue[i].sprite.y = i * 236;
					this.messageQueue[i].sprite.body.velocity.y = 0;
				}
	
				this.messageQueue[i].timer -= 1;
				//console.log(this.messageQueue[i].timer)
			};
	
			if (this.messageQueue[0].timer === 0) {
				this.messageQueue[0].sprite.body.velocity.y = -480;
				this.messageQueue.splice(0,1);
			}
		}

		if (game.input.activePointer.isDown) {
			game.physics.arcade.moveToPointer(this.playerCharacter, 900, game.input.activePointer, 60);
		} else {
			this.playerCharacter.body.velocity.x = 0;
			this.playerCharacter.body.velocity.y = 0;
		}

		game.physics.arcade.collide(this.playerCharacter, this.blockTypes[this.playerCharacter.color].group);
		game.physics.arcade.overlap(this.triangleGroup, this.blockTypes.red.group, this.changeTriColor, null, this);
		game.physics.arcade.overlap(this.triangleGroup, this.blockTypes.green.group, this.changeTriColor, null, this);
		game.physics.arcade.overlap(this.triangleGroup, this.blockTypes.blue.group, this.changeTriColor, null, this);
		game.physics.arcade.overlap(this.playerCharacter, this.triangleGroup, this.receiveMessage, null, this);
		game.physics.arcade.collide(this.playerCharacter, this.messageGroup);


		
		if (this.blockLaunchCounter <= 0) {
			this.blockLauncher();
			var update = function(block) {
				block.body.velocity.y = this.settings.speed;
			};

			if (this.settings.speed < 480) {
				this.settings.speed += 5;
				this.blockTypes.red.group.forEachAlive(update, this)
				this.blockTypes.green.group.forEachAlive(update, this)
				this.blockTypes.blue.group.forEachAlive(update, this)
			}

			this.blockLaunchCounter = Math.abs(360 / this.settings.speed * 60) - 1;
			console.log(this.blockLaunchCounter);
			//game.world.bringToTop(this.playerCharacter)
		}
		this.blockLaunchCounter -= 1;

		if (this.newTriangleCounter === 0) {
			this.triangleLauncher();

			// var blockUnderColor;
			// var blockColors = ['red', 'green', 'blue'];
			// for (var i = 0; i < blockColors.length; i++) {
			// 	if (game.physics.arcade.getObjectsAtLocation(this.playerCharacter.x, this.playerCharacter.y, this.blockTypes[blockColors[i]].group).length > 0) {
			// 		blockUnderColor = blockColors[i]
			// 	}
			// };

			// var colorSelection = ['red', 'green', 'blue'];
			// colorSelection.splice(colorSelection.indexOf(this.playerCharacter.color), 1);
			// colorSelection.splice(colorSelection.indexOf(blockUnderColor), 1);

			// this.playerCharacter.color = colorSelection[0];
			// this.playerCharacter.loadTexture(this.playerTextures[this.playerCharacter.color]);

			if (this.triangleCounterMax > 160) {
				this.triangleCounterMax -= 20;
			}
			this.newTriangleCounter = this.triangleCounterMax;
			console.log(this.triangleCounterMax);

		}
		this.newTriangleCounter -= 1;

		if (this.playerCharacter.y > 2080) {
			this.loseSound.play();
			this.state.start('Gameplay');
		}

	},
	triangleLauncher: function() {
			var triangle = this.triangleGroup.getFirstExists(false);

	        if (triangle) {
	            triangle.reset(Math.floor(Math.random() * 3) * 360 + 180, 1920);
	            triangle.body.velocity.y = -360;
	            triangle.sentMessage = false;
	        }
	},
	blockLauncher: function() {
		

		var blockRow = shuffleArray(['red', 'green', 'blue']);

		var block;
		for (var i = 0; i < blockRow.length; i++) {
			 block = this.blockTypes[blockRow[i]].group.getFirstExists(false);

	        if (block) {
	            block.reset(i*360, -600);
	            block.body.velocity.y = this.settings.speed;
	        }
		};
	},
	changeTriColor: function(triangle, block) {
		if (block.color === triangle.color) {
			var changeColorTo;
			if (block.color === 'red') {
				changeColorTo = 'green';
			} else if (block.color === 'green') {
				changeColorTo = 'blue';
			} else if (block.color === 'blue') {
				changeColorTo = 'red';
			}
			triangle.color = changeColorTo;
			triangle.loadTexture(this.trianglesTextures[changeColorTo]);
		} else {
			return false
		}
	},
	receiveMessage: function(player, triangle) {
		if (!triangle.sentMessage) {

			shuffleArray(this.messageGroup.children);
			var message = this.messageGroup.getFirstExists(false);
			if (message) {
				this.messageSound.play();
				message.reset(0, (this.messageQueue.length - 1) * 236);
				//message.body.velocity.y = 960
				this.messageQueue.push({
					timer: 360,
					sprite: message
				})
				//console.log(this.messageQueue.timer);
				triangle.sentMessage = true;
			}
		}
	},
	drawRectangle: function(x, y, width, height, blockColor) {
		var resetBlock = function(block){
			if (block.y > 1920) {
				block.kill();
			}
		}

		var rect = game.add.bitmapData(width, height);
	    rect.ctx.beginPath();
	    rect.ctx.rect(0, 0, width, height);
	    rect.ctx.fillStyle = this.blockTypes[blockColor].color;
	    rect.ctx.fill();

	    var rectSprite =  game.add.sprite(x, y, rect)
	    rectSprite.type = 'block';
	    rectSprite.color = blockColor;
	    rectSprite.exists = false;
    	rectSprite.visible = false;
    	rectSprite.checkWorldBounds = true;
    	rectSprite.events.onOutOfBounds.add(resetBlock, this);

	    game.physics.enable(rectSprite, Phaser.Physics.ARCADE);
	    //rectSprite.body.velocity.y = 360;
	    rectSprite.body.immovable = true;
	    this.blockTypes[blockColor].group.add(rectSprite);


		return rectSprite;
	},
	drawTriangle: function(x, y, width, color) {
		var triangle = game.add.bitmapData(width, width);
	    triangle.ctx.beginPath();
	    triangle.ctx.moveTo(0, width);
		triangle.ctx.lineTo(width/2, 0);
		triangle.ctx.lineTo(width, width);
		triangle.ctx.closePath();
	    triangle.ctx.fillStyle = color;
	    triangle.ctx.fill();

		return triangle;
	},
	drawCircle: function(x, y, width, color) {
		var circle = game.add.bitmapData(width, width);
	    circle.ctx.beginPath();
	    circle.ctx.arc(width/2, width/2, width/2, 0, 2 * Math.PI, false)
	    circle.ctx.fillStyle = color;
	    circle.ctx.fill();

		return circle;
	},
	drawMessageBox: function(width, height, message1, message2) {
		var messageBox = game.add.bitmapData(width, height);
	    messageBox.ctx.beginPath();
	    messageBox.ctx.rect(0, 0, width, height);
	    messageBox.ctx.fillStyle = "#ffffff";
	    messageBox.ctx.fill();
	    messageBox.ctx.strokeStyle = "#000000";
	    messageBox.ctx.lineWidth = 64;
	  	messageBox.ctx.stroke();
	  	messageBox.ctx.fillStyle = "#000000";
	  	messageBox.ctx.font = "bold 72px sans-serif";
		messageBox.ctx.fillText(message1, 210, 120);
		messageBox.ctx.fillText(message2, 210, 200);
		messageBox.ctx.font = "bold 240px sans-serif";
		messageBox.ctx.fillText('“', 60, 240);
		messageBox.ctx.fillText('”', 920, 240);

		return messageBox;
	},
	changePlayerType: function(){
		var blockUnderColor;
		var blockColors = ['red', 'green', 'blue'];
		for (var i = 0; i < blockColors.length; i++) {
			if (game.physics.arcade.getObjectsAtLocation(this.playerCharacter.x, this.playerCharacter.y, this.blockTypes[blockColors[i]].group).length > 0) {
				blockUnderColor = blockColors[i]
			}
		};

		var colorSelection = ['red', 'green', 'blue'];
		colorSelection.splice(colorSelection.indexOf(this.playerCharacter.color), 1);
		colorSelection.splice(colorSelection.indexOf(blockUnderColor), 1);

		this.playerCharacter.color = colorSelection[0];
		this.playerCharacter.loadTexture(this.playerTextures[this.playerCharacter.color]);
	}
};