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
	},
	doneTodo : function(id) {
		Todos.update(id, {
			$set : {
				done : true
			}
		});
	},
	undoneTodo : function(id) {
		Todos.update(id, {
			$set : {
				done : false
			}
		});
	}
});
