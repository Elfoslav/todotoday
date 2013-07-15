Meteor.methods({
	saveTodo : function(message) {
		Todos.insert({
			'message' : message,
			user : this.userId
		});
		console.log(Todos.find().fetch());
		console.log(message);
	},
	deleteTodo : function(id) {
		Todos.remove(id);
	}
});
