Handlebars.registerHelper('isEqual', function(a, b, content) {
	if(a === b) {
		return content;
	}
	return '';
});

Handlebars.registerHelper('userTasksCount', function() {
	return Tasks.find({ user : Meteor.userId() }).count();
});

Handlebars.registerHelper('time', function(time, format) {
	return moment(time).format(format);
});

Handlebars.registerHelper('dateFormatUpper', function() {
	return Session.get('dateFormat');
});

Handlebars.registerHelper('dateFormatLower', function() {
	return (Session.get('dateFormat')) ? Session.get('dateFormat').toLowerCase() : '';
});
