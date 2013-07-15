Deps.autorun(function() {
	Meteor.subscribe('userTasks');
	Meteor.subscribe('userSettings');
	Meteor.subscribe('todos');
	var sub = Meteor.subscribe('currentUserTask');

	currUserTask = CurrentUserTask.findOne({ user : Meteor.userId() });
	if(currUserTask) {
		if(!app.doingInterval) {
			app.doingInterval = startTimeSpentInterval(currUserTask.task);
		}
	}

    if(Meteor.userId()) {
        var settings = Settings.findOne({
			user : Meteor.userId()
		});
		if(settings && settings.dateFormat) {
			Session.set('dateFormat', settings.dateFormat);
		} else {
			Session.set('dateFormat', DEFAULT_DATE_FORMAT);
		}
    }
});


Meteor.startup(function() {

});
