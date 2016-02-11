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

		this.BLOCK_SIZE = game.width / 3;
		this.MESSAGE_WIDTH = game.width;
		this.MESSAGE_HEIGHT = this.MESSAGE_WIDTH / 4;
		this.CIRCLE_SIZE = this.BLOCK_SIZE * 2 / 3;
		this.TRIANGLE_SIZE = this.BLOCK_SIZE * 2 / 3;
		this.MESSAGE_BORDER = game.width / 18;
		this.FONTSIZE_SMALL = game.width / 15;
		this.FONTSIZE_LARGE = game.width / 4;


		this.colorSelect = {
			red: {
				yellow: 'blue',
				blue: 'yellow',
				red: 'blue'
			},
			yellow: {
				red: 'blue',
				blue: 'red',
				yellow: 'red'
			},
			blue: {
				yellow: 'red',
				red: 'yellow',
				blue: 'yellow'
			}
		};

		this.settings = {
			speed: 180
		};
		this.timer = 0;
		this.messageSound = game.add.audio('message');
		this.loseSound = game.add.audio('lose');

		this.allBlocks = [];
		this.messageQueue = []
		this.messageOut;
		this.blockLaunchCounter = 0;
		this.newTriangleCounter = 400;
		this.triangleCounterMax = 400;
		//game.physics.startSystem(Phaser.Physics.ARCADE);
		game.physics.startSystem(Phaser.Physics.P2JS);
		game.physics.p2.updateBoundsCollisionGroup();

		this.playerCollisionGroup = game.physics.p2.createCollisionGroup();
    	this.triangleCollisionGroup = game.physics.p2.createCollisionGroup();
    	this.messageCollisionGroup = game.physics.p2.createCollisionGroup();

		this.blockTypes = {
			red: {
				color: '#ee5555',
				group: game.add.group(),
				collisionGroup: game.physics.p2.createCollisionGroup()
			},
			yellow: {
				color: '#ddcc55',
				group: game.add.group(),
				collisionGroup: game.physics.p2.createCollisionGroup()
			},
			blue: {
				color: '#5555ee',
				group: game.add.group(),
				collisionGroup: game.physics.p2.createCollisionGroup()
			}
		};

		for (var i = 0; i < 8; i++){
			this.drawRectangle(0, 0, this.BLOCK_SIZE, this.BLOCK_SIZE, 'red');
			this.drawRectangle(0, 0, this.BLOCK_SIZE, this.BLOCK_SIZE, 'yellow');
			this.drawRectangle(0, 0, this.BLOCK_SIZE, this.BLOCK_SIZE, 'blue');

    	}


		this.playerTextures = {
			red: this.drawCircle(0, 0, this.CIRCLE_SIZE, this.blockTypes.red.color),
			yellow: this.drawCircle(0, 0, this.CIRCLE_SIZE, this.blockTypes.yellow.color),
			blue: this.drawCircle(0, 0, this.CIRCLE_SIZE, this.blockTypes.blue.color)
		};

		this.playerCharacter = game.add.sprite(game.width/2, game.height/2, this.playerTextures.red);
		this.playerCharacter.type = 'player';
		this.playerCharacter.color = 'red';
		this.playerCharacter.anchor.setTo(0.5, 0.5);
		//physics
		game.physics.enable(this.playerCharacter, Phaser.Physics.P2JS);

		this.playerCharacter.body.setCircle(this.CIRCLE_SIZE/2);
		this.playerCharacter.body.collideWorldBounds = true;
		this.playerCharacter.body.damping = 0.95;
		this.playerCharacter.body.setCollisionGroup(this.playerCollisionGroup);	
		
		this.playerCharacter.body.collidesWith = [this.blockTypes[this.playerCharacter.color].collisionGroup, this.messageCollisionGroup, this.triangleCollisionGroup];
		var mask = this.playerCharacter.body.getCollisionMask();

        for (var i = this.playerCharacter.body.data.shapes.length - 1; i >= 0; i--)
        {
            this.playerCharacter.body.data.shapes[i].collisionMask = mask;
        }

        

		this.trianglesTextures = {
			red: this.drawTriangle(0, 0, this.TRIANGLE_SIZE, this.blockTypes.red.color),
			yellow: this.drawTriangle(0, 0, this.TRIANGLE_SIZE, this.blockTypes.yellow.color),
			blue: this.drawTriangle(0, 0, this.TRIANGLE_SIZE, this.blockTypes.blue.color)
		};



		var resetTriangle = function(triangle){
			if (triangle.y < 0) {
				triangle.kill();
			}
		}

		this.triangleGroup = game.add.group();
		var triangleSprite;
		var messageCallback;
		for (var i = 0; i < 5; i++) {
			triangleSprite  =  game.add.sprite(0, 0, this.trianglesTextures.red)
			triangleSprite.anchor.setTo(0.5, 0.5);
		    triangleSprite.type = 'triangle';
		    triangleSprite.color = 'red';
		    triangleSprite.exists = false;
        	triangleSprite.visible = false;
        	triangleSprite.checkWorldBounds = true;
        	triangleSprite.events.onOutOfBounds.add(resetTriangle, this);
        	//physics
		    game.physics.enable(triangleSprite, Phaser.Physics.P2JS);
		    triangleSprite.body.setCollisionGroup(this.triangleCollisionGroup);
		    triangleSprite.body.collideWorldBounds = false;
		    triangleSprite.body.collides([
		    	this.playerCollisionGroup, 
		    	this.blockTypes.red.collisionGroup, 
		    	this.blockTypes.yellow.collisionGroup, 
		    	this.blockTypes.blue.collisionGroup
		    ]);
		    triangleSprite.body.data.shapes[0].sensor = true;
		    //triangleSprite.body.data.sprite = triangleSprite;

		    //triangleSprite.body.immovable = true;
		    this.triangleGroup.add(triangleSprite);

		    messageCallback = (function(triangle){
		    	//console.log(triangle.color);
		    	return function(touched){
		    		if (touched.sprite.type === 'player') {
		    			this.receiveMessage(triangle);
		    		} else if (touched.sprite.type === 'block') {
		    			this.changeTriColor(triangle, touched.sprite);
		    		}
		    	}
		    })(triangleSprite);

		    triangleSprite.body.onBeginContact.add(messageCallback, this);


		    //triangleSprite.body.createBodyCallback(this.playerCollisionGroup, function(){console.log('test')}, this);

		};
		//this.playerCharacter.body.createGroupCallback(this.triangleCollisionGroup, this.receiveMessage, this);
		//console.log(this.triangleCollisionGroup)
		

		// var resetMessage = function(message){
		// 	console.log('offpage');
		// 	if (message.y < 0) {
		// 		this.messageOut = undefined;
		// 		message.kill();
		// 		console.log('killed');
		// 	}
		// }

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
			messageSprite = game.add.sprite(0, 0, this.drawMessageBox(this.MESSAGE_WIDTH,this.MESSAGE_HEIGHT, messageStrings[i].string1, messageStrings[i].string2));
			messageSprite.exists = false;
        	messageSprite.visible = false;
        	//messageSprite.checkWorldBounds = true;
        	//messageSprite.events.onOutOfBounds.add(resetMessage, this);

        	//physics
        	game.physics.enable(messageSprite, Phaser.Physics.P2JS);
        	messageSprite.body.kinematic = true;
        	messageSprite.body.setCollisionGroup(this.messageCollisionGroup);
        	messageSprite.body.collides([this.playerCollisionGroup]);


        	//messageSprite.body.immovable = true;
        	this.messageGroup.add(messageSprite);
		};

		//var messageBox  =  game.add.sprite(0, 0, this.drawMessageBox(1080,360));

		game.input.onUp.add(this.changePlayerType, this);
	},
	update: function() {

		if (typeof this.messageOut != 'undefined') {
			console.log('movingOut');
			if (this.messageOut.sprite.y < this.MESSAGE_HEIGHT / -2) {
				this.messageOut.sprite.kill();
				this.messageOut = undefined;
				console.log('killed');
			} else {
				this.messageOut.sprite.body.moveUp((this.messageOut.sprite.y - (-1 * (this.MESSAGE_HEIGHT - this.MESSAGE_BORDER / 2)) + (this.MESSAGE_HEIGHT / 2)) * 5);
			}
		}

		if (this.messageQueue.length > 0) {	
			var messagePosition;
			for (var i = 0; i < this.messageQueue.length; i++) {
				console.log(this.messageQueue[i].sprite.x);
				var messagePosition = (i * (this.MESSAGE_HEIGHT - this.MESSAGE_BORDER / 2)) + (this.MESSAGE_HEIGHT / 2);
				if (this.messageQueue[i].sprite.y > messagePosition + 2) {
					this.messageQueue[i].sprite.body.moveUp((this.messageQueue[i].sprite.y - messagePosition) * 5);
				} else if (this.messageQueue[i].sprite.y < messagePosition - 2) {
					this.messageQueue[i].sprite.body.moveDown((messagePosition - this.messageQueue[i].sprite.y) * 5);
				} else {
					this.messageQueue[i].sprite.body.setZeroVelocity();
					this.messageQueue[i].sprite.body.y = messagePosition;
				}	
				this.messageQueue[i].timer -= 1;
			};
	

			if (this.messageQueue[0].timer === 0) {
				this.messageOut = this.messageQueue[0];
				console.log('timedOut');
				this.messageQueue.splice(0,1);
			}
			console.log(this.messageOut);


		}


		//physics
		if (game.input.activePointer.isDown) {
		    var dx = this.playerCharacter.x - game.input.activePointer.worldX;
		    var dy = this.playerCharacter.y - game.input.activePointer.worldY;

		    var angle = Math.atan2(dy, dx) - Math.PI/2;
		    var speed = 10 * Math.sqrt(dx*dx + dy*dy);

		    this.playerCharacter.body.rotation = angle;
	        this.playerCharacter.body.thrust(speed);
		}

		
		if (this.blockLaunchCounter <= 0) {
			this.blockLauncher();
			var update = function(block) {
				block.body.velocity.y = this.settings.speed;
			};

			if (this.settings.speed < 480) {
				this.settings.speed += 5;
				this.blockTypes.red.group.forEachAlive(update, this)
				this.blockTypes.yellow.group.forEachAlive(update, this)
				this.blockTypes.blue.group.forEachAlive(update, this)
			}

			this.blockLaunchCounter = Math.abs(this.BLOCK_SIZE / this.settings.speed * 60) - 1;
			//game.world.bringToTop(this.playerCharacter)
		}
		this.blockLaunchCounter -= 1;

		if (this.newTriangleCounter === 0) {
			this.triangleLauncher();

			if (this.triangleCounterMax > 160) {
				this.triangleCounterMax -= 20;
			}
			this.newTriangleCounter = this.triangleCounterMax;

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
	            //physics
	            triangle.body.velocity.y = -360;
	            triangle.sentMessage = false;
	        }
	},
	blockLauncher: function() {
		

		var blockRow = shuffleArray(['red', 'yellow', 'blue']);

		var block;
		for (var i = 0; i < blockRow.length; i++) {
			 block = this.blockTypes[blockRow[i]].group.getFirstExists(false);

	        if (block) {
	            block.reset(i*this.BLOCK_SIZE + this.BLOCK_SIZE/2, -this.BLOCK_SIZE/2);
	            //physics
	            block.body.velocity.y = this.settings.speed;
	        }
		};
	},
	changeTriColor: function(triangle, block) {
		if (block.color === triangle.color) {
			var colorUnder = this.colorUnder(triangle);

			if (typeof colorUnder === 'undefined') {
				colorUnder = block.color;
			}

			var colorSelection = this.colorSelect[block.color][colorUnder];
			triangle.color = colorSelection;
			triangle.loadTexture(this.trianglesTextures[colorSelection]);
		}
	},
	receiveMessage: function(triangle) {
		console.log(triangle.sentMessage);
		if (!triangle.sentMessage) {

			shuffleArray(this.messageGroup.children);
			var message = this.messageGroup.getFirstExists(false);
			if (message) {
				this.messageSound.play();
				message.reset(game.width/2, (this.messageQueue.length - 1) * 236 + 118 + 32);
				//message.body.velocity.y = 960
				this.messageQueue.push({
					timer: 640,
					sprite: message
				})
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

    	//physics
	    game.physics.enable(rectSprite, Phaser.Physics.P2JS);
	    rectSprite.body.kinematic = true;
	    rectSprite.body.setCollisionGroup(this.blockTypes[blockColor].collisionGroup);
	    rectSprite.body.collides([this.playerCollisionGroup, this.triangleCollisionGroup]);
	    //rectSprite.body.immovable = true;
	    this.blockTypes[blockColor].group.add(rectSprite);
	    this.allBlocks.push(rectSprite);



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
	    messageBox.ctx.lineWidth = this.MESSAGE_BORDER;
	  	messageBox.ctx.stroke();
	  	messageBox.ctx.fillStyle = "#000000";
	  	messageBox.ctx.font = "bold " + this.FONTSIZE_SMALL + "px Helvetica";
		messageBox.ctx.fillText(message1, game.width/6, game.width/9);
		messageBox.ctx.fillText(message2, game.width/6, game.width/27*5);
		messageBox.ctx.font = "bold " + this.FONTSIZE_LARGE + "px Helvetica";
		messageBox.ctx.fillText('“', game.width/27, game.width/4);
		messageBox.ctx.fillText('”', game.width/27 * 23, game.width/4);

		return messageBox;
	},
	changePlayerType: function(){
		var blockColor = this.colorUnder(this.playerCharacter);

		if (typeof blockColor === 'undefined') {
			blockColor = this.playerCharacter.color;
		}

		var colorSelection = this.colorSelect[this.playerCharacter.color][blockColor];

		this.playerCharacter.color = colorSelection;
		this.playerCharacter.loadTexture(this.playerTextures[this.playerCharacter.color]);
		
		this.playerCharacter.body.collidesWith = [this.blockTypes[this.playerCharacter.color].collisionGroup, this.messageCollisionGroup, this.triangleCollisionGroup];
		var mask = this.playerCharacter.body.getCollisionMask();

        for (var i = this.playerCharacter.body.data.shapes.length - 1; i >= 0; i--)
        {
            this.playerCharacter.body.data.shapes[i].collisionMask = mask;
        }

		
	},
	pointIntersects: function (point, body) {
		if (point.x < body.left) {
			return false;
		} else if (point.x > body.right) {
			return false;
		} else if (point.y < body.top) {
			return false;
		} else if (point.y > body.bottom) {
			return false;
		} else {
			return true;
		}
    },
    colorUnder: function(sprite) {
    	var findBlock = (function(sprite){
    		return function(element, index){
    			return this.pointIntersects(sprite.position, element);
    		}
    	})(sprite);
    	var foundBlock = this.allBlocks.find(findBlock, this);
    	if (typeof foundBlock != 'undefined'){
    		return foundBlock.color;
    	}
    },
    tweenTint: function(obj, startColor, endColor, time) { 
    	// create an object to tween with our step value at 0
	    var colorBlend = {step: 0};
	    // create the tween on this object and tween its step property to 100
	    var colorTween = game.add.tween(colorBlend).to({step: 100}, time);
	    // run the interpolateColor function every time the tween updates, feeding it the
	    // updated value of our tween each time, and set the result as our tint    
	    colorTween.onUpdateCallback(function() {
	    	obj.tint = Phaser.Color.interpolateColor(startColor, endColor, 100, colorBlend.step);
	    });        
	    // set the object to the start color straight away
	    obj.tint = startColor;
	    // start the tween
	    colorTween.start();
	}
};