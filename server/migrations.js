// database migrations
Migrations = new Meteor.Collection('migrations');

Meteor.startup(function () {

	if (!Migrations.findOne({name: "taskTimesIntoTask"})) {
		var taskTimes = TaskTimes.find();
		taskTimes.forEach(function(taskTime) {
			Tasks.update(taskTime.task, {
				$addToSet : {
					taskTimes: {
						start: taskTime.start,
						end: taskTime.end
					}
				}
			});
		});
		Migrations.insert({name: "taskTimesIntoTask"});
	}
});
