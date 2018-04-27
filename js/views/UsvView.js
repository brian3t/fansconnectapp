UsvView = Backbone.View.extend({
	render: function(){
		Backbone.Model.prototype.apply(this, arguments);
		if (this.hasOwnProperty('after_render')){
			this.after_render();
		}
	}
});