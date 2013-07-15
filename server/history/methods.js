Meteor.methods({
	/**
	 * @param date type of Date
	 */
	getTasksByDate: function(start, end) {
		var tasks = Tasks.find({
			user : this.userId,
			taskTimes: { $elemMatch: { start: { $gte: start, $lt : end } } }
		},
		{
			sort : { "taskTimes.start" : -1 }
		});
		return tasks.fetch();
	},
	/**
	 * @param date first day of month. Eg.: 01.07.2013
	 */
	getTasksByMonth : function(firstDay, lastDay) {
		var tasks = Tasks.find({
			user : this.userId,
			taskTimes : { $elemMatch : { start: { $gte: firstDay, $lt : lastDay } } }
		});
		return tasks.fetch();
	}
});
