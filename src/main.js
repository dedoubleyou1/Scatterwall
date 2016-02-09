var game = new Phaser.Game(1080, 1920, Phaser.CANVAS, 'game', {
	preload: function() {
		// Preload loading bar images.
		// this.load.image('preloaderBg','images/preloaderBg.png');
        // this.load.image('preloaderBar', 'images/preloaderBar.png');
	},
	create: function() {
		this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.state.add('Gameplay', Gameplay);

		this.state.start('Gameplay');
	}
});