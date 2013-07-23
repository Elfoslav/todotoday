Deps.autorun(function() {
	Meteor.subscribe('userTasks');
	Meteor.subscribe('userProjects');
	Meteor.subscribe('userSettings');
	Meteor.subscribe('todos');
	Meteor.subscribe('taskTimes');
	var sub = Meteor.subscribe('currentUserTask');

	currUserTask = CurrentUserTask.findOne({ user : Meteor.userId() });
	if(currUserTask) {
		if(!app.doingInterval) {
			app.doingInterval = startTimeSpentInterval(currUserTask.task);
		}
	}

    if(Meteor.userId()) {
		Session.set('dateFormat', getDefaultDateFormat());
		Session.set('timeFormat', getDefaultTimeFormat());
    }
});


Meteor.startup(function() {

});
