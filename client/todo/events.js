Template.todo.events({
	"click #add-todo-submit" : function(e) {
		e.preventDefault();
		var $message = $('#message');
		if(!$message.val()) {
			alert('You won\'t help to improve with a blank message');
			return;
		}
		console.log('submitted', $message.val());
		Meteor.call('saveTodo', $message.val(), function(err, data) {
			if(!err) {
				$message.val('');
			}
		});
	},
	"click [data-action]" : function(e) {
		var data = e.currentTarget.dataset;
		switch(data.action) {
			case 'delete' :
				Meteor.call('deleteTodo', data.id);
				break;
			case 'done' :
				Meteor.call('doneTodo', data.id);
				break;
			case 'undone' :
				Meteor.call('undoneTodo', data.id);
				break;
		}
	}
});
