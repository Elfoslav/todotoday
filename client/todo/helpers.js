Template.todo.rendered = function() {
	Meteor.call('changePageTitle', "Improve TodoToday");
	triggerAnalytics();
};

Template.todo.helpers({
	todos : function() {
		var todos = Todos.find();
		var out = '';
		if(todos.count()) {
			todos.forEach(function(todo) {
				if(todo.done) {
					out += '<li><strike>' + todo.message + ' <i class="icon-ok"></i></strike>';
				} else {
					out += '<li>' + todo.message;
				}
				if(todo.user == Meteor.userId()) {
					out += ' | <input type="button" value="Delete" data-action="delete" data-id="' + todo._id + '" />';
					if(!todo.done) {
						out += ' <input type="button" value="Done" data-action="done" data-id="' + todo._id + '" />';
					} else {
						out += ' <input type="button" value="Undone" data-action="undone" data-id="' + todo._id + '" />';
					}
				}
				out += '</li>';
			});
		}
		return new Handlebars.SafeString(out);
	}
});
