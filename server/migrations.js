// database migrations
Migrations = new Meteor.Collection('migrations');

Meteor.startup(function () {

	var taskTimesIntoTask = "taskTimesIntoTask";
	if (!Migrations.findOne({name: taskTimesIntoTask})) {
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
		Migrations.insert({name: taskTimesIntoTask});
	}

	var taskTimesIntoTaskTimes = "taskTimesIntoTaskTimes";
	if (!Migrations.findOne({name: taskTimesIntoTaskTimes})) {
		//first remove all task times
		TaskTimes.remove();
		var tasks = Tasks.find();
		tasks.forEach(function(task) {
			var taskTimes = task.taskTimes;
			if(taskTimes && taskTimes instanceof Array) {
				taskTimes.forEach(function(taskTime) {
					TaskTimes.insert({
						user : task.user,
						task : task._id,
						start : taskTime.start,
						end : taskTime.end
					});
				});
			}
			//remove task times from task
			//Tasks.update(task._id, { $unset : { taskTimes : [] }});
		});
		Migrations.insert({name: taskTimesIntoTaskTimes});
	}
});
