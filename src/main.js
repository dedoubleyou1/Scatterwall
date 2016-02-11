var game = new Phaser.Game(1242, 2208, Phaser.CANVAS, 'game', {
	preload: function() {
		// Preload loading bar images.
		this.load.image('logo_red', 'images/scatterwall_logo_red.png');
		this.load.image('logo_yellow', 'images/scatterwall_logo_yellow.png');
        this.load.image('logo_blue', 'images/scatterwall_logo_blue.png');
	},
	create: function() {
		//this.game.stage.scale.pageAlignHorizontally = true;
		//this.game.stage.scale.pageAlignVeritcally = true;
		this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

		//this.game.stage.scale.refresh();
		this.state.add('Gameplay', Gameplay);

		// GROUP A
		this.groupA = game.add.group();

		this.rectA = game.add.graphics(0, 0);
	    this.rectA.beginFill(0x5555ee, 1);
	    this.rectA.drawRect(0, 0, game.width, game.height);
	    this.rectA.endFill();
	    this.groupA.add(this.rectA);

	    this.titleA = this.add.sprite(game.width/2, game.height/2, 'logo_red');
		this.titleA.anchor.setTo(0.5, 0.5);
		 this.groupA.add(this.titleA);

	    this.maskA = game.add.graphics(0, 0);
	    this.maskA.drawRect(0, -game.height, game.width/3, game.height/3);
	   	this.maskA.drawRect(game.width/3*2, -game.height/3*2, game.width/3, game.height/3);
	  	this.maskA.drawRect(game.width/3, -game.height/3, game.width/3, game.height/3);
	    this.maskA.drawRect(0, 0, game.width/3, game.height/3);
	   	this.maskA.drawRect(game.width/3*2, game.height/3, game.width/3, game.height/3);
	   	this.maskA.drawRect(game.width/3, game.height/3*2, game.width/3, game.height/3);
	    this.groupA.mask = this.maskA;


	    		// GROUP B
		this.groupB = game.add.group();

		this.rectB = game.add.graphics(0, 0);
	    this.rectB.beginFill(0xee5555, 1);
	    this.rectB.drawRect(0, 0, game.width, game.height);
	    this.rectB.endFill();
	    this.groupB.add(this.rectB);

	    this.titleB = this.add.sprite(game.width/2, game.height/2, 'logo_yellow');
		this.titleB.anchor.setTo(0.5, 0.5);
		 this.groupB.add(this.titleB);

	    this.maskB = game.add.graphics(0, 0);
	    this.maskB.drawRect(game.width/3, -game.height, game.width/3, game.height/3);
	    this.maskB.drawRect(0, -game.height/3*2, game.width/3, game.height/3);
	    this.maskB.drawRect(game.width/3*2, -game.height/3, game.width/3, game.height/3);
	    this.maskB.drawRect(game.width/3, 0, game.width/3, game.height/3);
	    this.maskB.drawRect(0, game.height/3, game.width/3, game.height/3);
	   	this.maskB.drawRect(game.width/3*2, game.height/3*2, game.width/3, game.height/3);
	    this.groupB.mask = this.maskB;


	    		// GROUP A
		this.groupC = game.add.group();

		this.rectC = game.add.graphics(0, 0);
	    this.rectC.beginFill(0xddcc55, 1);
	    this.rectC.drawRect(0, 0, game.width, game.height);
	    this.rectC.endFill();
	    this.groupC.add(this.rectC);

	    this.titleC = this.add.sprite(game.width/2, game.height/2, 'logo_blue');
		this.titleC.anchor.setTo(0.5, 0.5);
		this.groupC.add(this.titleC);

	    this.maskC = game.add.graphics(0, 0);
	    this.maskC.drawRect(game.width/3*2, -game.height, game.width/3, game.height/3);
	    this.maskC.drawRect(game.width/3, -game.height/3*2, game.width/3, game.height/3);
	    this.maskC.drawRect(0, -game.height/3, game.width/3, game.height/3);
	    this.maskC.drawRect(game.width/3*2, 0, game.width/3, game.height/3);
	    this.maskC.drawRect(game.width/3, game.height/3, game.width/3, game.height/3);
	    this.maskC.drawRect(0, game.height/3*2, game.width/3, game.height/3);
	    this.groupC.mask = this.maskC;


		game.input.onDown.add(function(){
			this.state.start('Gameplay');
		}, this);

	},
	update: function() {
		this.maskA.y += 2;
		this.maskB.y += 2;
		this.maskC.y += 2;

		// this.titleA.rotation += 0.01;
		// this.titleB.rotation += 0.01;
		// this.titleC.rotation += 0.01;

		if (this.maskA.y >= game.height) {
			this.maskA.y = 0;
			this.maskB.y = 0;
			this.maskC.y = 0;
		}
	}
});