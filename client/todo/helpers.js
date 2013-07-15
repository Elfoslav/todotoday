Template.todo.rendered = function() {
	Meteor.call('changePageTitle', "What to do in TodoToday");
	triggerAnalytics();
};

Template.todo.helpers({
	todos : function() {
		var todos = Todos.find();
		var out = '';
		if(todos.count()) {
			console.log(todos.count());
			todos.forEach(function(todo) {
				out += '<li>' + todo.message;
				if(todo.user == Meteor.userId()) {
					out += ' | <input type="button" value="Delete" data-action="delete" data-id="' + todo._id + '" />';
				}
				out += '</li>';
			});
		}
		return new Handlebars.SafeString(out);
	}
});
